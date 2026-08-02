# Vídeos de escultura em cera

## Direitos autorais

Não use nem baixe vídeos do YouTube de terceiros para o site.
Os guias na página usam **textos e animações 3D originais da GB Dental**.

Quando houver gravação própria (ou vídeo gerado com direitos liberados), salve em:

```
public/videos/tooth-{FDI}/fase-{id}.mp4
```

Se o arquivo existir, o player de vídeo entra automaticamente no lugar da animação 3D.

## Roteiros por dente (técnica regressiva)

| FDI | Elemento |
|-----|----------|
| 11 / 21 | Incisivo central superior |
| 12 / 22 | Incisivo lateral superior |
| 13 / 23 | Canino superior |
| 14 / 24 | 1º pré-molar superior |
| 15 / 25 | 2º pré-molar superior |
| 16 / 26 | 1º molar superior |
| 17 / 27 | 2º molar superior |
| 41 / 31 | Incisivo central inferior |
| 42 / 32 | Incisivo lateral inferior |
| 43 / 33 | Canino inferior |
| 44 / 34 | 1º pré-molar inferior |
| 45 / 35 | 2º pré-molar inferior |
| 46 / 36 | 1º molar inferior |
| 47 / 37 | 2º molar inferior |

Os IDs de fase seguem o roteiro de cada dente em `src/data/sculpture-scripts.ts`
(instrumentais, medidas, terços, cortes, anatomia, oclusal, polimento, etc.).

## Kit de referência (piloto dente 11)

Para preparar clipes/frames e o roteiro de fidelidade do 3D progressivo, use:

```
content/referencia-3d/COMO-ENVIAR.md
content/referencia-3d/dente-11/TABELA-FASES.md
content/referencia-3d/dente-11/PROMPTS-3D.md
content/referencia-3d/dente-11/
```

Essa pasta é material de produção/referência.  
Os MP4 que o aluno assiste no site ficam em `public/videos/tooth-{FDI}/`.
