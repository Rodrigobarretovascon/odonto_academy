#!/usr/bin/env python3
"""
Renderiza vistas finais padronizadas a partir de modelos STL.
Gera 14 dentes base (11-17, 41-47) e espelha para o lado contralateral.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import numpy as np
import trimesh
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "scripts" / "tooth-config.json"
MODELS_DIR = ROOT / "models" / "stl"
OUTPUT_DIR = ROOT / "public" / "images"

SIZE = 1600
SUPERSAMPLE = 2
PADDING = 0.32
PADDING_INCISAL = 0.30
# Fração superior do dente visível (coroa + parte da raiz)
DISPLAY_TOP_FRACTION = 0.85
BG = (255, 255, 255)
# Coroa branca brilhante + raiz amarronzada (referência clínica / cera)
CROWN_BASE = np.array([1.0, 1.0, 1.0])
CROWN_HIGHLIGHT = np.array([1.0, 1.0, 1.0])
CROWN_SHADOW = np.array([0.94, 0.94, 0.92])
ROOT_BASE = np.array([0.82, 0.69, 0.56])
ROOT_HIGHLIGHT = np.array([0.92, 0.80, 0.68])
ROOT_SHADOW = np.array([0.68, 0.55, 0.42])
CERVICAL_FRACTION = 0.42
CERVICAL_BLEND = 0.08


def load_config() -> dict:
    return json.loads(CONFIG_PATH.read_text())


def normalize_mesh(mesh: trimesh.Trimesh) -> trimesh.Trimesh:
    mesh = mesh.copy()
    mesh.merge_vertices()
    mesh.remove_unreferenced_vertices()
    mesh.vertices -= mesh.centroid
    scale = 1.0 / max(mesh.extents)
    mesh.apply_scale(scale)
    # Canonical: +Z incisal, +Y vestibular, +X mesial
    if mesh.bounds[1][2] < mesh.bounds[0][2]:
        mesh.apply_transform(np.diag([1, 1, -1, 1]))
    return mesh


def orient_tooth(mesh: trimesh.Trimesh, tooth_type: str, jaw: str) -> trimesh.Trimesh:
    """Auto-orienta STLs externos (ex.: Sketchfab) para o sistema canônico."""
    m = mesh.copy()
    verts = m.vertices
    cov = np.cov(verts.T)
    _, eigvecs = np.linalg.eigh(cov)
    order = np.argsort(np.linalg.eigh(cov)[0])[::-1]
    axes = eigvecs[:, order]

    # Eixo mais longo = coroa-raiz (Z)
    vertical = axes[:, 0]
    if vertical[2] < 0:
        vertical = -vertical

    md = axes[:, 1]
    vest = np.cross(md, vertical)
    if np.linalg.norm(vest) < 1e-6:
        vest = np.array([0.0, 1.0, 0.0])
    vest /= np.linalg.norm(vest)
    if jaw == "upper" and vest[1] < 0:
        vest = -vest
    if jaw == "lower" and vest[1] > 0:
        vest = -vest
    md = np.cross(vertical, vest)
    md /= np.linalg.norm(md)

    rot = np.column_stack([md, vest, vertical]).T
    transform = np.eye(4)
    transform[:3, :3] = rot
    m.apply_transform(transform)
    m.vertices -= m.centroid
    return m


def trim_mesh_for_display(mesh: trimesh.Trimesh, top_fraction: float = DISPLAY_TOP_FRACTION) -> trimesh.Trimesh:
    """Mantém coroa + parte superior da raiz; remove só a ponta apical."""
    z = mesh.vertices[:, 2]
    z_cut = float(np.quantile(z, 1.0 - top_fraction))
    keep = z >= z_cut
    face_mask = keep[mesh.faces].all(axis=1)
    if not face_mask.any():
        return mesh
    sub = mesh.submesh([face_mask], append=True)
    sub.merge_vertices()
    sub.remove_unreferenced_vertices()
    sub.vertices -= sub.centroid
    return sub


def fit_camera(
    proj_u: np.ndarray,
    proj_v: np.ndarray,
    padding: float,
) -> tuple[float, float, float]:
    """Calcula centro e meia-extensão com margem uniforme (sem distorção)."""
    min_u, max_u = float(proj_u.min()), float(proj_u.max())
    min_v, max_v = float(proj_v.min()), float(proj_v.max())
    center_u = (min_u + max_u) / 2
    center_v = (min_v + max_v) / 2
    half_u = (max_u - min_u) / 2 / (1 - padding)
    half_v = (max_v - min_v) / 2 / (1 - padding)
    half = max(half_u, half_v, 1e-6)
    return center_u, center_v, half


def view_camera(view: str) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Retorna direção do olhar, up e eixo horizontal da imagem."""
    if view == "vestibular":
        return np.array([0, 1, 0]), np.array([0, 0, 1]), np.array([1, 0, 0])
    if view == "palatina":
        return np.array([0, -1, 0]), np.array([0, 0, 1]), np.array([-1, 0, 0])
    if view == "mesial":
        return np.array([1, 0, 0]), np.array([0, 0, 1]), np.array([0, -1, 0])
    if view == "distal":
        return np.array([-1, 0, 0]), np.array([0, 0, 1]), np.array([0, 1, 0])
    if view == "incisal":
        return np.array([0, 0, -1]), np.array([0, 1, 0]), np.array([1, 0, 0])
    raise ValueError(view)


def crown_blend(z: float, z_min: float, z_max: float) -> float:
    """0 = raiz (amarronzada), 1 = coroa (branca). +Z = incisal."""
    span = max(z_max - z_min, 1e-9)
    cervical = z_min + span * CERVICAL_FRACTION
    blend = span * CERVICAL_BLEND
    if z >= cervical:
        return 1.0
    if z <= cervical - blend:
        return 0.0
    return float((z - (cervical - blend)) / blend)


def shade_palette(t: float) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Interpola paletas coroa ↔ raiz."""
    base = ROOT_BASE * (1.0 - t) + CROWN_BASE * t
    highlight = ROOT_HIGHLIGHT * (1.0 - t) + CROWN_HIGHLIGHT * t
    shadow = ROOT_SHADOW * (1.0 - t) + CROWN_SHADOW * t
    return base, highlight, shadow


def render_mesh(mesh: trimesh.Trimesh, view: str, size: int = SIZE) -> Image.Image:
    internal = size * SUPERSAMPLE
    look, up, right = view_camera(view)
    look = look.astype(np.float64)
    up = up.astype(np.float64)
    right = right.astype(np.float64)
    look = look / np.linalg.norm(look)
    up = up - look * np.dot(up, look)
    up /= np.linalg.norm(up)
    right = np.cross(up, look)
    right /= np.linalg.norm(right)

    verts = mesh.vertices
    faces = mesh.faces
    vnorms = mesh.vertex_normals
    z_min = float(verts[:, 2].min())
    z_max = float(verts[:, 2].max())

    proj_u = verts @ right
    proj_v = verts @ up
    depth = verts @ look

    padding = PADDING_INCISAL if view == "incisal" else PADDING
    center_u, center_v, half = fit_camera(proj_u, proj_v, padding)
    if view != "incisal":
        center_v += half * 0.03

    img = np.full((internal, internal, 3), 255, dtype=np.float32)
    zbuf = np.full((internal, internal), np.inf, dtype=np.float32)

    light = np.array([0.15, 0.45, 0.88])
    light /= np.linalg.norm(light)
    view_dir = -look

    face_depth = depth[faces].mean(axis=1)
    order = np.argsort(face_depth)

    for fi in order:
        tri = faces[fi]
        pu = proj_u[tri]
        pv = proj_v[tri]
        xs = ((pu - center_u) / half * 0.5 + 0.5) * (internal - 1)
        ys = (0.5 - (pv - center_v) / half * 0.5) * (internal - 1)
        pts = np.stack([xs, ys], axis=1)

        fn = vnorms[tri]
        facing = np.dot(fn.mean(axis=0), -look)
        if facing <= 0:
            continue

        min_x = max(int(np.floor(xs.min())), 0)
        max_x = min(int(np.ceil(xs.max())), internal - 1)
        min_y = max(int(np.floor(ys.min())), 0)
        max_y = min(int(np.ceil(ys.max())), internal - 1)
        if min_x > max_x or min_y > max_y:
            continue

        v0, v1, v2 = pts
        area = (v1[0] - v0[0]) * (v2[1] - v0[1]) - (v2[0] - v0[0]) * (v1[1] - v0[1])
        if abs(area) < 1e-6:
            continue

        for y in range(min_y, max_y + 1):
            for x in range(min_x, max_x + 1):
                p = np.array([x + 0.5, y + 0.5])
                w0 = ((v1[0] - v0[0]) * (p[1] - v0[1]) - (v1[1] - v0[1]) * (p[0] - v0[0])) / area
                w1 = ((v2[0] - v1[0]) * (p[1] - v1[1]) - (v2[1] - v1[1]) * (p[0] - v1[0])) / area
                w2 = 1 - w0 - w1
                if w0 >= 0 and w1 >= 0 and w2 >= 0:
                    z = w0 * depth[tri[0]] + w1 * depth[tri[1]] + w2 * depth[tri[2]]
                    if z < zbuf[y, x]:
                        zbuf[y, x] = z
                        normal = w0 * fn[0] + w1 * fn[1] + w2 * fn[2]
                        nlen = np.linalg.norm(normal)
                        if nlen < 1e-9:
                            continue
                        normal /= nlen
                        if np.dot(normal, -look) <= 0:
                            continue
                        z = w0 * verts[tri[0], 2] + w1 * verts[tri[1], 2] + w2 * verts[tri[2], 2]
                        t = crown_blend(z, z_min, z_max)
                        base, highlight, shadow = shade_palette(t)
                        ndotl = max(0.0, float(np.dot(normal, light)))
                        ndotv = max(0.0, float(np.dot(normal, view_dir)))
                        half_vec = light + view_dir
                        half_vec /= max(np.linalg.norm(half_vec), 1e-9)
                        spec_power = 28 if t > 0.55 else 18
                        spec = max(0.0, float(np.dot(normal, half_vec))) ** spec_power
                        spec_strength = 0.55 if t > 0.55 else 0.08
                        shade = 0.35 + 0.55 * ndotl
                        shadow_mix = (1.0 - ndotl) * (0.06 if t > 0.55 else 0.14)
                        color = (
                            shadow * shadow_mix
                            + base * shade
                            + highlight * (spec * spec_strength + ndotv**4 * (0.14 if t > 0.55 else 0.04))
                        )
                        img[y, x] = np.clip(color, 0, 1)

    pil = Image.fromarray(np.clip(img * 255, 0, 255).astype(np.uint8))
    if view != "incisal":
        pil = add_ground_shadow(pil, zbuf)
    if SUPERSAMPLE > 1:
        pil = pil.resize((size, size), Image.Resampling.LANCZOS)
        pil = pil.filter(ImageFilter.UnsharpMask(radius=1.0, percent=70, threshold=2))
    return enhance_image(pil)


def enhance_image(pil: Image.Image) -> Image.Image:
    """Clareia e aumenta contraste preservando o fundo branco."""
    arr = np.array(pil, dtype=np.float32)
    tooth = arr.min(axis=2) < 250
    if not tooth.any():
        return pil
    for c in range(3):
        channel = arr[:, :, c]
        values = channel[tooth]
        lo, hi = np.percentile(values, [2, 98])
        span = max(hi - lo, 1.0)
        stretched = (channel - lo) / span
        channel = np.where(tooth, np.clip(stretched, 0, 1) * 255, channel)
        arr[:, :, c] = channel
    out = Image.fromarray(arr.astype(np.uint8))
    out = ImageEnhance.Brightness(out).enhance(1.03)
    out = ImageEnhance.Contrast(out).enhance(1.05)
    return out


def add_ground_shadow(img: Image.Image, zbuf: np.ndarray) -> Image.Image:
    mask = np.isfinite(zbuf)
    if not mask.any():
        return img
    ys, xs = np.where(mask)
    base_y = ys.max()
    out = img.convert("RGBA")
    overlay = Image.new("RGBA", out.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    cx = int(xs.mean())
    width = max(12, int((xs.max() - xs.min()) * 0.35))
    draw.ellipse((cx - width, base_y - 4, cx + width, base_y + 10), fill=(0, 0, 0, 22))
    return Image.alpha_composite(out, overlay).convert("RGB")


def stl_path_for_tooth(number: str, meta: dict) -> Path:
    for ext in (".obj", ".stl"):
        direct = MODELS_DIR / f"{number}{ext}"
        if direct.exists():
            return direct
    align = meta.get("align3d")
    if align:
        return MODELS_DIR / align["case"] / "crown" / align["arch"] / align["file"]
    raise FileNotFoundError(f"Modelo não encontrado para dente {number} (procure {number}.stl ou {number}.obj)")


def views_for_tooth(meta: dict) -> list[tuple[str, str]]:
    """Retorna pares (view interna, sufixo do arquivo)."""
    back = "lingual" if meta["jaw"] == "lower" else "palatina"
    top = "oclusal" if meta["type"] in {"molar", "premolar"} else "incisal"
    return [
        ("vestibular", "vestibular"),
        ("palatina", back),
        ("mesial", "mesial"),
        ("distal", "distal"),
        ("incisal", top),
    ]


def render_tooth(number: str, meta: dict, out_dir: Path) -> None:
    stl = stl_path_for_tooth(number, meta)
    mesh = trimesh.load_mesh(stl, force="mesh")
    if isinstance(mesh, trimesh.Scene):
        mesh = trimesh.util.concatenate(tuple(mesh.geometry.values()))
    mesh = normalize_mesh(mesh)
    mesh = orient_tooth(mesh, meta["type"], meta["jaw"])
    mesh = trim_mesh_for_display(mesh)

    out_dir.mkdir(parents=True, exist_ok=True)
    for internal, suffix in views_for_tooth(meta):
        img = render_mesh(mesh, internal)
        filename = f"{number}-final-{suffix}.png"
        img.save(out_dir / filename, compress_level=3)
        print(f"  ✓ {filename}")


def mirror_view(src: Path, dst: Path, view: str) -> None:
    img = Image.open(src)
    mirrored = img.transpose(Image.FLIP_LEFT_RIGHT)
    mirrored.save(dst, optimize=True)


def mirror_source_suffix(source_meta: dict, suffix: str) -> str:
    swap = {"mesial": "distal", "distal": "mesial"}
    if suffix in swap:
        return swap[suffix]
    if suffix in {"palatina", "lingual"}:
        return "lingual" if source_meta["jaw"] == "lower" else "palatina"
    if suffix in {"incisal", "oclusal"}:
        return "oclusal" if source_meta["type"] in {"molar", "premolar"} else "incisal"
    return suffix


def generate_all() -> None:
    config = load_config()
    base = config["baseTeeth"]
    mirrors = config["mirrorPairs"]

    print("Renderizando dentes base…")
    for number, meta in base.items():
        print(f"Dente {number}")
        render_tooth(number, meta, OUTPUT_DIR / f"tooth-{number}")

    print("\nEspelhando dentes contralaterais…")
    for target, source in mirrors.items():
        print(f"Dente {target} ← {source}")
        src_dir = OUTPUT_DIR / f"tooth-{source}"
        dst_dir = OUTPUT_DIR / f"tooth-{target}"
        dst_dir.mkdir(parents=True, exist_ok=True)
        target_meta = {
            "jaw": "upper" if str(target)[0] in {"1", "2"} else "lower",
            "type": base[str(source)]["type"],
        }
        source_meta = base[str(source)]
        for internal, suffix in views_for_tooth(target_meta):
            src_suffix = mirror_source_suffix(source_meta, suffix)
            src_file = src_dir / f"{source}-final-{src_suffix}.png"
            dst_file = dst_dir / f"{target}-final-{suffix}.png"
            if not src_file.exists():
                print(f"  ! ausente: {src_file}")
                continue
            mirror_view(src_file, dst_file, suffix)
            print(f"  ✓ {dst_file.name}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--tooth":
        number = sys.argv[2] if len(sys.argv) > 2 else "13"
        config = load_config()
        meta = config["baseTeeth"].get(number)
        if not meta:
            print(f"Dente base {number} não encontrado. Use: 11-17 ou 41-47")
            sys.exit(1)
        stl = MODELS_DIR / f"{number}.stl"
        obj = MODELS_DIR / f"{number}.obj"
        if not stl.exists() and not obj.exists():
            print(f"Arquivo não encontrado: {stl} ou {obj}")
            print("Baixe o OBJ do Sketchfab e salve como models/stl/13.obj")
            sys.exit(1)
        path = obj if obj.exists() else stl
        print(f"Teste — dente {number} ({path.stat().st_size // 1024} KB, {path.suffix})")
        render_tooth(number, meta, OUTPUT_DIR / f"tooth-{number}")
        print(f"\n✓ Abra: http://localhost:5174/?dente={number}")
    else:
        generate_all()
