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
DUNDEE_MANIFEST = ROOT / "scripts" / "dundee-manifest.json"
MODELS_DIR = ROOT / "models" / "stl"
OUTPUT_DIR = ROOT / "public" / "images"

SIZE = 1600
SUPERSAMPLE = 2
PADDING = 0.32
PADDING_INCISAL = 0.30
# Fração superior do dente visível (coroa + parte da raiz)
DISPLAY_TOP_FRACTION = 0.85
BG = (255, 255, 255)
# Material neutro (STLs sem textura) — tom anatômico original, sem pintura artificial
NEUTRAL_BASE = np.array([0.88, 0.85, 0.80])
NEUTRAL_HIGHLIGHT = np.array([0.96, 0.94, 0.90])
NEUTRAL_SHADOW = np.array([0.62, 0.58, 0.52])


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


def texture_path_for_tooth(number: str, model_path: Path) -> Path | None:
    """Textura original Dundee do próprio dente (ex.: 13-TM.png)."""
    candidates = [
        MODELS_DIR / f"{number}-TM.png",
        model_path.with_name(f"{model_path.stem}-TM.png"),
    ]
    # Fallback só para o canino 13 (OBJ Dundee original em tmp)
    if number == "13":
        candidates.append(ROOT / "tmp" / "maxillary-canine" / "textures" / "UL3sketch1_1-TM.png")
    for path in candidates:
        if path.exists():
            return path
    return None


def load_texture_array(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float32) / 255.0


def sample_texture(tex: np.ndarray, u: float, v: float) -> np.ndarray:
    h, w = tex.shape[:2]
    u = float(np.clip(u, 0.0, 1.0))
    v = float(np.clip(1.0 - v, 0.0, 1.0))
    x = min(int(u * (w - 1)), w - 1)
    y = min(int(v * (h - 1)), h - 1)
    return tex[y, x]


def mesh_uv_coords(mesh: trimesh.Trimesh) -> np.ndarray | None:
    visual = getattr(mesh, "visual", None)
    uv = getattr(visual, "uv", None) if visual is not None else None
    if uv is None or len(uv) != len(mesh.vertices):
        return None
    return np.asarray(uv, dtype=np.float64)


def shade_lit(base: np.ndarray, normal: np.ndarray, light: np.ndarray, view_dir: np.ndarray) -> np.ndarray:
    ndotl = max(0.0, float(np.dot(normal, light)))
    ndotv = max(0.0, float(np.dot(normal, view_dir)))
    half_vec = light + view_dir
    half_vec /= max(np.linalg.norm(half_vec), 1e-9)
    spec = max(0.0, float(np.dot(normal, half_vec))) ** 18
    # Ambiente alto para preservar cores da textura Dundee (coroa clara / raiz bege)
    shade = 0.62 + 0.38 * ndotl
    highlight = np.minimum(base * 1.1 + 0.05, 1.0)
    color = base * shade + highlight * (spec * 0.12 + ndotv**4 * 0.04)
    return np.clip(color, 0, 1)


def render_mesh(
    mesh: trimesh.Trimesh,
    view: str,
    size: int = SIZE,
    texture: np.ndarray | None = None,
    uv: np.ndarray | None = None,
) -> Image.Image:
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
    use_texture = texture is not None and uv is not None

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
                # Bariocêntricos corretos: w0→v0, w1→v1, w2→v2
                w0 = ((v1[0] - p[0]) * (v2[1] - p[1]) - (v2[0] - p[0]) * (v1[1] - p[1])) / area
                w1 = ((v2[0] - p[0]) * (v0[1] - p[1]) - (v0[0] - p[0]) * (v2[1] - p[1])) / area
                w2 = 1.0 - w0 - w1
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
                        if use_texture:
                            tri_uv = uv[tri]
                            u = w0 * tri_uv[0, 0] + w1 * tri_uv[1, 0] + w2 * tri_uv[2, 0]
                            v = w0 * tri_uv[0, 1] + w1 * tri_uv[1, 1] + w2 * tri_uv[2, 1]
                            base = sample_texture(texture, u, v)
                        else:
                            base = NEUTRAL_BASE
                        color = shade_lit(base, normal, light, view_dir)
                        img[y, x] = color

    pil = Image.fromarray(np.clip(img * 255, 0, 255).astype(np.uint8))
    if view != "incisal":
        pil = add_ground_shadow(pil, zbuf)
    if SUPERSAMPLE > 1:
        pil = pil.resize((size, size), Image.Resampling.LANCZOS)
        pil = pil.filter(ImageFilter.UnsharpMask(radius=1.0, percent=70, threshold=2))
    return enhance_image(pil)


def enhance_image(pil: Image.Image) -> Image.Image:
    """Leve clareamento da textura Dundee, sem esticar histograma (evita escurecer)."""
    arr = np.array(pil, dtype=np.float32)
    tooth = arr.min(axis=2) < 250
    if not tooth.any():
        return pil
    arr[tooth] = np.clip(arr[tooth] * 1.12 + 6.0, 0, 255)
    return Image.fromarray(arr.astype(np.uint8))


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


def load_dundee_manifest() -> dict:
    if not DUNDEE_MANIFEST.exists():
        return {"teeth": {}}
    return json.loads(DUNDEE_MANIFEST.read_text())


def dundee_mirror_for(number: str) -> bool:
    teeth = load_dundee_manifest().get("teeth", {})
    return bool(teeth.get(number, {}).get("mirror", False))


def dundee_flip_vertical_for(number: str) -> bool:
    teeth = load_dundee_manifest().get("teeth", {})
    return bool(teeth.get(number, {}).get("flipVertical", False))


def mirror_mesh_x(mesh: trimesh.Trimesh) -> trimesh.Trimesh:
    m = mesh.copy()
    m.apply_transform(np.diag([-1.0, 1.0, 1.0, 1.0]))
    return m


def flip_mesh_z(mesh: trimesh.Trimesh) -> trimesh.Trimesh:
    m = mesh.copy()
    m.apply_transform(np.diag([1.0, 1.0, -1.0, 1.0]))
    return m


def texture_from_mesh_visual(mesh: trimesh.Trimesh) -> tuple[np.ndarray, np.ndarray] | None:
    visual = getattr(mesh, "visual", None)
    if visual is None:
        return None
    uv = getattr(visual, "uv", None)
    material = getattr(visual, "material", None)
    image = getattr(material, "image", None) if material is not None else None
    if uv is None or image is None:
        return None
    if len(uv) != len(mesh.vertices):
        return None
    tex = np.asarray(image.convert("RGB"), dtype=np.float32) / 255.0
    return tex, np.asarray(uv, dtype=np.float64)


def stl_path_for_tooth(number: str, meta: dict) -> Path:
    for ext in (".obj", ".glb", ".stl"):
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
    mesh = trimesh.load_mesh(stl, force="mesh", process=False)
    if isinstance(mesh, trimesh.Scene):
        mesh = trimesh.util.concatenate(tuple(mesh.geometry.values()))
    mesh = normalize_mesh(mesh)
    mesh = orient_tooth(mesh, meta["type"], meta["jaw"])
    if dundee_flip_vertical_for(number):
        mesh = flip_mesh_z(mesh)
        print("  · flip vertical")
    if dundee_mirror_for(number):
        mesh = mirror_mesh_x(mesh)
    mesh = trim_mesh_for_display(mesh)

    tex_path = texture_path_for_tooth(number, stl)
    texture = load_texture_array(tex_path) if tex_path else None
    uv = mesh_uv_coords(mesh)
    if texture is None:
        embedded = texture_from_mesh_visual(mesh)
        if embedded is not None:
            texture, uv = embedded
            print(f"  · textura embutida ({stl.suffix})")
    if texture is not None and uv is None:
        print(f"  ! textura encontrada ({tex_path.name}) mas sem UV — material neutro")
        texture = None
    elif texture is not None:
        print(f"  · textura original: {tex_path.name}")

    out_dir.mkdir(parents=True, exist_ok=True)
    for internal, suffix in views_for_tooth(meta):
        img = render_mesh(mesh, internal, texture=texture, uv=uv)
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
