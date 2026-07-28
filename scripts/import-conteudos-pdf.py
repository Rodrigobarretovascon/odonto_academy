#!/usr/bin/env python3
"""Importa slides do PDF conteudos.pdf para public/images/content/conteudos/."""
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PDF = Path.home() / "Downloads" / "conteudos.pdf"
OUT_DIR = ROOT / "public" / "images" / "content" / "conteudos"
MANIFEST_TS = ROOT / "src" / "data" / "content-manifest.ts"

# Títulos e categorias calibrados sobre o PDF (21 páginas)
SLIDES = [
    {"page": 1, "id": "primeiros-dentinhos", "title": "Primeiros Dentinhos", "category": "decidua", "tags": ["erupção", "infantil"]},
    {"page": 2, "id": "denticao-comparativa", "title": "Primeira dentição e dentição permanente", "category": "denticao", "tags": ["arcada"]},
    {"page": 3, "id": "numeracao-permanente", "title": "Numeração FDI — dentição permanente", "category": "denticao", "tags": ["FDI"]},
    {"page": 4, "id": "numeracao-decidua", "title": "Numeração FDI — dentes decíduos", "category": "decidua", "tags": ["FDI", "leite"]},
    {"page": 5, "id": "anatomia-oclusal", "title": "Anatomia oclusal para restaurações", "category": "oclusal", "tags": ["restauração"]},
    {"page": 6, "id": "anatomia-dente-estruturas", "title": "Anatomia do dente — estruturas externas e internas", "category": "anatomia", "tags": ["esmalte", "polpa"]},
    {"page": 7, "id": "instrumento-lecron", "title": "Lecron nº 5", "category": "escultura", "tags": ["instrumento", "cera"]},
    {"page": 8, "id": "cera-escultura", "title": "Para que serve a cera para escultura dental?", "category": "escultura", "tags": ["cera", "material"]},
    {"page": 9, "id": "anatomia-labios", "title": "Anatomia dos lábios", "category": "estetica", "tags": ["face"]},
    {"page": 10, "id": "anatomia-cranio", "title": "Anatomia do crânio", "category": "anatomia", "tags": ["ossos"]},
    {"page": 11, "id": "palato-duro", "title": "Palato duro", "category": "anatomia", "tags": ["cavidade oral"]},
    {"page": 12, "id": "uvula", "title": "Úvula", "category": "anatomia", "tags": ["palato mole"]},
    {"page": 13, "id": "nariz", "title": "Nariz", "category": "estetica", "tags": ["face"]},
    {"page": 14, "id": "partes-dente", "title": "Partes do dente — coroa, colo e raiz", "category": "anatomia", "tags": ["coroa", "raiz"]},
    {"page": 15, "id": "tecidos-dente", "title": "Tecidos do dente", "category": "anatomia", "tags": ["esmalte", "dentina"]},
    {"page": 16, "id": "periodonto", "title": "Periodonto — proteção e inserção", "category": "periodonto", "tags": []},
    {"page": 17, "id": "gengiva-regioes", "title": "Gengiva — principais regiões anatômicas", "category": "periodonto", "tags": ["gengiva"]},
    {"page": 18, "id": "anatomia-dente-completa", "title": "Anatomia do dente — coroa, colo, raiz e tecidos", "category": "anatomia", "tags": []},
    {"page": 19, "id": "gengivite-periodontite", "title": "Gengivite × Periodontite", "category": "periodonto", "tags": ["doença"]},
    {"page": 20, "id": "evolucao-periodontal", "title": "Evolução da doença periodontal", "category": "periodonto", "tags": ["doença"]},
    {"page": 21, "id": "papilas-linguais", "title": "Papilas linguais", "category": "anatomia", "tags": ["língua"]},
]

CATEGORY_LABELS = {
    "decidua": "Dentição decídua",
    "denticao": "Dentição permanente",
    "anatomia": "Anatomia",
    "oclusal": "Oclusal",
    "escultura": "Escultura em cera",
    "estetica": "Estética facial",
    "periodonto": "Periodonto",
}


def import_pdf(pdf_path: Path) -> list[dict]:
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF não encontrado: {pdf_path}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf_path)
    entries: list[dict] = []

    for slide in SLIDES:
        page_idx = slide["page"] - 1
        if page_idx >= doc.page_count:
            continue
        meta = {**slide, "image": f"/images/content/conteudos/{slide['id']}.png"}
        filename = OUT_DIR / f"{slide['id']}.png"
        pix = doc[page_idx].get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        pix.save(str(filename))
        entries.append(meta)
        print(f"  ✓ {slide['id']}.png")

    doc.close()
    return entries


def write_manifest_ts(entries: list[dict]) -> None:
    lines = [
        "/** Gerado por scripts/import-conteudos-pdf.py — não editar manualmente. */",
        "",
        "export type ContentCategory =",
        '  | "decidua"',
        '  | "denticao"',
        '  | "anatomia"',
        '  | "oclusal"',
        '  | "escultura"',
        '  | "estetica"',
        '  | "periodonto";',
        "",
        "export interface ContentSlide {",
        "  id: string;",
        "  page: number;",
        "  title: string;",
        "  category: ContentCategory;",
        "  tags: string[];",
        "  image: string;",
        "}",
        "",
        "export const CONTENT_CATEGORY_LABELS: Record<ContentCategory, string> = {",
    ]
    for key, label in CATEGORY_LABELS.items():
        lines.append(f'  {key}: "{label}",')
    lines.append("};")
    lines.append("")
    lines.append("export const contentSlides: ContentSlide[] = ")
    lines.append(json.dumps(entries, ensure_ascii=False, indent=2) + ";")
    lines.append("")
    MANIFEST_TS.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n✓ Manifest: {MANIFEST_TS.relative_to(ROOT)}")


def main() -> None:
    pdf = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF
    print(f"Importando {pdf}…")
    entries = import_pdf(pdf)
    write_manifest_ts(entries)
    print(f"\n{len(entries)} slides em {OUT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
