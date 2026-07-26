#!/usr/bin/env python3
"""Gera STLs paramétricos proporcionais (Fonseca) para os 14 dentes base."""
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / "scripts" / "tooth-config.json").read_text())
OUT = ROOT / "models" / "stl"

DIMS = {
    "11": (10.5, 8.5, 7.0, "upper", "incisor"),
    "12": (9.0, 6.5, 6.0, "upper", "incisor"),
    "13": (10.5, 7.9, 8.4, "upper", "canine"),
    "14": (8.5, 7.0, 9.0, "upper", "premolar"),
    "15": (8.0, 7.0, 8.5, "upper", "premolar"),
    "16": (7.5, 10.5, 11.0, "upper", "molar"),
    "17": (7.0, 10.0, 10.0, "upper", "molar"),
    "41": (9.0, 5.4, 6.0, "lower", "incisor"),
    "42": (9.5, 6.0, 6.0, "lower", "incisor"),
    "43": (11.0, 7.0, 8.0, "lower", "canine"),
    "44": (8.5, 7.0, 9.0, "lower", "premolar"),
    "45": (8.0, 7.0, 8.5, "lower", "premolar"),
    "46": (7.5, 11.0, 10.5, "lower", "molar"),
    "47": (7.0, 10.0, 10.0, "lower", "molar"),
}


def smooth_blob(rx: float, ry: float, rz: float, center: tuple[float, float, float]) -> trimesh.Trimesh:
    m = trimesh.creation.icosphere(subdivisions=5, radius=1.0)
    m.vertices *= [rx, ry, rz]
    m.vertices += center
    return m


def make_root(length: float, radius: float, x: float = 0.0) -> trimesh.Trimesh:
    upper = trimesh.creation.cylinder(radius=radius, height=length * 0.35, sections=32)
    upper.apply_translation([x, 0, -length * 0.35 / 2])
    lower = trimesh.creation.cone(radius=radius, height=length * 0.65, sections=32)
    lower.apply_translation([x, 0, -length * 0.35 - length * 0.65 / 2])
    return trimesh.util.concatenate([upper, lower])


def weld(parts: list[trimesh.Trimesh]) -> trimesh.Trimesh:
    mesh = trimesh.util.concatenate(parts)
    mesh.merge_vertices()
    mesh.remove_unreferenced_vertices()
    return mesh


def incisor(crown_h, md, vl, jaw):
    crown = smooth_blob(md * 0.44, vl * 0.40, crown_h * 0.46, (0, 0, crown_h * 0.5))
    incisal = crown.vertices[:, 2].max()
    crown.vertices[crown.vertices[:, 2] > incisal - crown_h * 0.12, 2] -= crown_h * 0.04
    if jaw == "upper":
        crown.vertices[crown.vertices[:, 1] > 0, 1] *= 1.05
    neck = trimesh.creation.cylinder(radius=md * 0.20, height=crown_h * 0.08, sections=32)
    neck.apply_translation([0, 0, crown_h * 0.04])
    root = make_root(crown_h * 1.2, md * 0.18)
    return weld([crown, neck, root])


def canine(crown_h, md, vl, jaw):
    crown = smooth_blob(md * 0.46, vl * 0.44, crown_h * 0.50, (0, 0, crown_h * 0.52))
    tip = crown.vertices[:, 2].max()
    crown.vertices[crown.vertices[:, 2] > tip - crown_h * 0.28, 0] *= 0.78
    crown.vertices[crown.vertices[:, 2] > tip - crown_h * 0.22, 2] += crown_h * 0.10
    if jaw == "upper":
        crown.vertices[crown.vertices[:, 1] > 0, 1] *= 1.10
    neck = trimesh.creation.cylinder(radius=md * 0.22, height=crown_h * 0.08, sections=32)
    neck.apply_translation([0, 0, crown_h * 0.04])
    root = make_root(crown_h * 1.35, md * 0.20)
    return weld([crown, neck, root])


def premolar(crown_h, md, vl, _jaw):
    crown = smooth_blob(md * 0.46, vl * 0.46, crown_h * 0.42, (0, 0, crown_h * 0.48))
    top = crown.vertices[:, 2].max()
    for x in (-md * 0.14, md * 0.14):
        mask = (np.abs(crown.vertices[:, 0] - x) < md * 0.16) & (
            crown.vertices[:, 2] > top - crown_h * 0.22
        )
        crown.vertices[mask, 2] += crown_h * 0.10
    neck = trimesh.creation.cylinder(radius=md * 0.18, height=crown_h * 0.08, sections=32)
    neck.apply_translation([0, 0, crown_h * 0.04])
    root = make_root(crown_h * 1.4, md * 0.16)
    return weld([crown, neck, root])


def molar(crown_h, md, vl, jaw, second=False):
    body = trimesh.creation.box(extents=[md * 0.88, vl * 0.84, crown_h * 0.62])
    body.apply_translation([0, 0, crown_h * 0.45])
    top = body.vertices[:, 2].max()
    bumps = []
    pts = [(md * 0.20, vl * 0.20), (-md * 0.20, vl * 0.20), (md * 0.20, -vl * 0.20), (-md * 0.20, -vl * 0.20)]
    if jaw == "upper" and not second:
        pts.append((0, 0))
    for x, y in pts:
        b = smooth_blob(crown_h * 0.11, crown_h * 0.11, crown_h * 0.10, (x, y, top - crown_h * 0.02))
        bumps.append(b)
    crown = weld([body, *bumps])
    neck = trimesh.creation.cylinder(radius=md * 0.16, height=crown_h * 0.08, sections=32)
    neck.apply_translation([0, 0, crown_h * 0.04])
    roots = [make_root(crown_h * 1.5, md * 0.12, x) for x in (-md * 0.16, md * 0.16)]
    if jaw == "lower":
        roots.append(make_root(crown_h * 1.35, md * 0.10, 0))
    return weld([crown, neck, *roots])


def build_tooth(number: str) -> trimesh.Trimesh:
    crown_h, md, vl, jaw, kind = DIMS[number]
    if kind == "incisor":
        mesh = incisor(crown_h, md, vl, jaw)
    elif kind == "canine":
        mesh = canine(crown_h, md, vl, jaw)
    elif kind == "premolar":
        mesh = premolar(crown_h, md, vl, jaw)
    else:
        mesh = molar(crown_h, md, vl, jaw, second=number in {"17", "47"})
    mesh.merge_vertices()
    mesh.remove_unreferenced_vertices()
    return mesh


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for number in CONFIG["baseTeeth"]:
        mesh = build_tooth(number)
        mesh.export(OUT / f"{number}.stl")
        print(f"✓ {number}.stl")


if __name__ == "__main__":
    main()
