#!/usr/bin/env python3
"""
Baixa modelos Dundee (Sketchfab) para models/stl/{FDI}.glb ou extrai OBJ de zips manuais.

Modos:
  1. API (GLB + texturas embutidas): SKETCHFAB_API_TOKEN=... python scripts/download-dundee-models.py
  2. Manual: coloque zips OBJ do Sketchfab em models/dundee-inbox/ e rode sem token

Token: https://sketchfab.com/settings/password → API Token
"""
from __future__ import annotations

import io
import json
import os
import re
import shutil
import sys
import zipfile
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "scripts" / "dundee-manifest.json"
OUT_DIR = ROOT / "models" / "stl"
INBOX = ROOT / "models" / "dundee-inbox"
API = "https://api.sketchfab.com/v3"


def load_manifest() -> dict:
    return json.loads(MANIFEST.read_text())


def download_glb(uid: str, token: str) -> bytes:
    headers = {"Authorization": f"Token {token}"}
    r = requests.get(f"{API}/models/{uid}/download", headers=headers, timeout=60)
    r.raise_for_status()
    data = r.json()
    for fmt in ("glb", "gltf"):
        if fmt in data and "url" in data[fmt]:
            url = data[fmt]["url"]
            break
    else:
        raise RuntimeError(f"Formato não disponível para {uid}: {list(data.keys())}")
    file_r = requests.get(url, timeout=300)
    file_r.raise_for_status()
    return file_r.content


def extract_obj_zip(data: bytes, dest_dir: Path, fdi: str) -> Path | None:
    dest_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        names = zf.namelist()
        obj_name = next((n for n in names if n.lower().endswith(".obj")), None)
        if not obj_name:
            return None
        zf.extractall(dest_dir)
        obj_path = dest_dir / obj_name
        final_obj = OUT_DIR / f"{fdi}.obj"
        shutil.copy2(obj_path, final_obj)
        for n in names:
            if n.lower().endswith(("-tm.png", "_tm.png")) or re.search(r"tm\.png$", n, re.I):
                tex_src = dest_dir / n
                tex_dst = OUT_DIR / f"{fdi}-TM.png"
                shutil.copy2(tex_src, tex_dst)
                print(f"    · textura {tex_dst.name}")
        return final_obj


def process_inbox_zip(path: Path, fdi: str) -> bool:
    data = path.read_bytes()
    work = ROOT / "tmp" / "dundee" / fdi
    if work.exists():
        shutil.rmtree(work)
    obj = extract_obj_zip(data, work, fdi)
    if obj:
        print(f"  ✓ {fdi}.obj ← {path.name}")
        return True
    # tenta GLB dentro do zip
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        glb = next((n for n in zf.namelist() if n.lower().endswith(".glb")), None)
        if glb:
            OUT_DIR.mkdir(parents=True, exist_ok=True)
            (OUT_DIR / f"{fdi}.glb").write_bytes(zf.read(glb))
            print(f"  ✓ {fdi}.glb ← {path.name}")
            return True
    print(f"  ! {path.name}: sem OBJ/GLB")
    return False


def match_inbox_to_fdi(path: Path, manifest: dict) -> str | None:
    stem = path.stem.lower()
    for fdi, info in manifest["teeth"].items():
        uid = info["sketchfabUid"][:8]
        if uid in stem or fdi in stem:
            return fdi
        slug = re.sub(r"[^a-z0-9]+", "-", info["name"].lower()).strip("-")
        if slug.replace("-", "") in stem.replace("-", "").replace("_", ""):
            return fdi
    return None


def download_tooth(fdi: str, info: dict, token: str, force: bool) -> bool:
    glb_path = OUT_DIR / f"{fdi}.glb"
    obj_path = OUT_DIR / f"{fdi}.obj"
    if not force and (glb_path.exists() or obj_path.exists()):
        print(f"  · {fdi} já existe — pulando")
        return True
    print(f"  ↓ {fdi} — {info['name']}")
    try:
        data = download_glb(info["sketchfabUid"], token)
    except requests.HTTPError as e:
        print(f"  ! HTTP {e.response.status_code} — {info['name']}")
        return False
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    glb_path.write_bytes(data)
    print(f"  ✓ {glb_path.name} ({len(data) // 1024} KB)")
    extract_texture_from_glb(glb_path, fdi)
    return True


def extract_texture_from_glb(glb_path: Path, fdi: str) -> Path | None:
    """Extrai baseColor PNG embutido no GLB → models/stl/{fdi}-TM.png."""
    try:
        from pygltflib import GLTF2
    except ImportError:
        print("    ! pygltflib ausente — textura não extraída")
        return None
    gltf = GLTF2().load(str(glb_path))
    if not gltf.images:
        return None
    idx = 0
    for mat in gltf.materials or []:
        pbr = mat.pbrMetallicRoughness
        if pbr and pbr.baseColorTexture is not None:
            tex = gltf.textures[pbr.baseColorTexture.index]
            idx = tex.source
            break
    img = gltf.images[idx]
    if img.bufferView is None:
        return None
    bv = gltf.bufferViews[img.bufferView]
    data = gltf.binary_blob()
    blob = data[bv.byteOffset : bv.byteOffset + bv.byteLength]
    out = OUT_DIR / f"{fdi}-TM.png"
    out.write_bytes(blob)
    print(f"    · textura {out.name} ({len(blob) // 1024} KB)")
    return out


def main() -> None:
    manifest = load_manifest()
    teeth = manifest["teeth"]
    only = sys.argv[1:] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else []
    force = "--force" in sys.argv
    token = os.environ.get("SKETCHFAB_API_TOKEN", "").strip()

    INBOX.mkdir(parents=True, exist_ok=True)
    inbox_files = sorted(INBOX.glob("*.zip")) + sorted(INBOX.glob("*.ZIP"))
    if inbox_files:
        print(f"Processando {len(inbox_files)} zip(s) em {INBOX.relative_to(ROOT)}…")
        for path in inbox_files:
            fdi = match_inbox_to_fdi(path, manifest)
            if not fdi:
                print(f"  ? {path.name} — FDI não identificado (renomeie com número, ex.: 11-maxillary.zip)")
                continue
            if only and fdi not in only:
                continue
            process_inbox_zip(path, fdi)

    if token:
        print(f"\nBaixando via Sketchfab API ({len(teeth)} dentes base)…")
        ok = fail = 0
        for fdi, info in teeth.items():
            if only and fdi not in only:
                continue
            if download_tooth(fdi, info, token, force):
                ok += 1
            else:
                fail += 1
        print(f"\n{ok} ok, {fail} falha(s)")
        if fail:
            sys.exit(1)
    elif not inbox_files:
        print(
            "SKETCHFAB_API_TOKEN não definido e inbox vazio.\n\n"
            "Opção A — API (GLB):\n"
            "  1. Crie token em https://sketchfab.com/settings/password\n"
            "  2. SKETCHFAB_API_TOKEN=seu_token npm run download-dundee\n\n"
            "Opção B — Manual (OBJ + textura, melhor qualidade):\n"
            "  1. Baixe cada modelo em https://sketchfab.com/DundeeDental/collections/permanent-teeth-4c0d0548c40c463c8cdceb6e0d08df7f\n"
            f"  2. Salve os .zip em {INBOX.relative_to(ROOT)}/\n"
            "  3. npm run download-dundee\n"
        )
        sys.exit(1)
    else:
        print("\n✓ Inbox processado. Rode: npm run render-views")


if __name__ == "__main__":
    main()
