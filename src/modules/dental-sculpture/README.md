# Módulo — Aula imersiva de escultura 3D

## Rota

`/app/escultura/:dente/imersivo` (completo para FDI 11 / 21)

## Técnica de remoção progressiva

**Morph por blend:** interpolação contínua `startBlend → endBlend` no bloco/dente procedural, sincronizada com a trajetória do instrumento e o scrubber. Sem booleanas de malha.

## Categorias e metadados

`data/stepMeta.ts` classifica as 24 fases (`orientation` | `measurement` | `marking` | `cutting` | `carving` | `inspection` | `cleaning` | `finishing`) e define `why`, cues de narração e outcomes de prática.

## Trajetórias

`data/tool-actions-central-upper.ts` — fases com path: **1, 3, 4, 6, 7, 9–13, 15–17, 20–24**.

Fases de inspeção/orientação (**2, 5, 8, 14, 18, 19**) usam overlays (faces, simetria, medidas, troca de instrumentos, luz rasante).

## Instrumentos e GLB

- Procedural: `lib/proceduralTools.ts`
- Definições + fallback: `data/toolAssets.ts` + `loadToolGroup`
- Coloque GLBs em `public/models/tools/{ruler,scalpel,lecron,brush,nylon}.glb`

## Anatomia procedural

`lib/proceduralIncisor.ts` — IC superior com bossa, cíngulo, fossa, cristas e assimetria MD.

## Prática

1. Fase com trajetória → **Praticar esta fase**
2. Arrastar o instrumento → **Avaliar minha trajetória**
3. Resultado visual: insuficiente / esperado / excessivo (`lib/practiceOutcomes.ts`)
4. **Replay da tentativa** + marcadores de momento (ideal contínua × aluno tracejada)

## Extra

- Comparar com anatomia ideal · Camadas da escultura · Progresso anatômico
- Teste final · Galeria de erros comuns
- Miniatura “Ver movimento resumido” · “Por que fazer assim?”
