# QA Checklist — Escultura imersiva (FDI 11)

Marcações: `[ ]` não testado · `[x]` aprovado (automático/parcial) · `[!]` limitação conhecida

Gerado na Iteração 4. Validação odontológica humana ainda necessária nas fases marcadas `[!]`.

## Infraestrutura

- [x] Build Vite conclui
- [x] TypeScript do módulo sem erros novos
- [x] Testes unitários Vitest passam
- [x] Fallback procedural sem spam de 404 GLB (aviso único em DEV)
- [x] Dispose de cena/geometrias no unmount
- [x] Pause quando aba invisível
- [!] Contato instrumento–superfície: raycast aproximado — validar visualmente fases 11 e 15
- [!] Anatomia procedural melhorada, ainda não é GLB profissional

## Controles / sync

- [x] Scrubber atualiza progresso via `setProgress`
- [x] Quaternion slerp nas trajetórias
- [x] Catmull-Rom na posição
- [x] “Seguir demonstração” opcional
- [x] Narração cancela em pause / troca de fase / unmount
- [x] Partículas desligáveis + reduced-motion
- [!] Replay da tentativa: instrumento segue pontos do aluno; suavização limitada
- [!] Homologação manual play/pause/replay repetido ainda recomendada

## Prática

- [x] Avaliação rejeita trajetória curta
- [x] Reamostragem por comprimento de arco
- [x] Regiões protegidas detectadas
- [x] Outcomes insufficient / expected / excessive
- [!] Precisão clínica da nota — didática apenas

## Mobile / a11y

- [x] CSS 640px: viewer priorizado, chips tocáveis, timeline scroll
- [x] `touch-action: none` no canvas
- [x] aria-live do status da etapa
- [x] Escape fecha quiz/galeria
- [!] Teste real em iPhone/Android pendente
- [!] 320px extremo: timeline ainda densa

## Fases 1–24

| # | Categoria | Trajetória/overlay | Auto | Nota |
|---|-----------|--------------------|------|------|
| 1 | measurement | path régua+estilete | [x] | |
| 2 | orientation | faces labels | [x] | |
| 3 | marking | proximal draw | [x] | |
| 4 | cutting | cut MD | [x] | |
| 5 | inspection | symmetry | [x] | |
| 6 | carving | converge M/D | [x] | |
| 7 | carving | palatal/cíngulo | [!] | validar preservação cíngulo |
| 8 | orientation | instrument swap | [x] | |
| 9 | carving | round | [x] | |
| 10 | carving | bossa | [!] | vista proximal |
| 11 | carving | cervical ring | [!] | **prioridade odonto** |
| 12 | cleaning | brush | [x] | |
| 13 | carving | mesial | [x] | |
| 14 | inspection | measure | [x] | |
| 15 | carving | fossa | [!] | **prioridade odonto** |
| 16 | carving | cristas | [!] | |
| 17 | carving | cíngulo round | [!] | |
| 18 | inspection | MD compare | [x] | |
| 19 | measurement | proporções | [x] | |
| 20 | carving | sulcos (progress fix) | [x] | |
| 21 | carving | cervical redo | [x] | |
| 22 | carving | palatal refine | [x] | |
| 23 | inspection+carve | grazing + corners | [x] | |
| 24 | finishing | meia fina | [x] | |

## Teste final / galeria

- [x] Quiz 10 itens com explicação
- [x] Galeria com modelos de erro distintos
- [x] Rever fase navega para order correto
- [!] Validação visual odontológica dos 12 erros

## Debug (DEV)

```js
localStorage.setItem('DEBUG_TOOL_CONTACT','1')
localStorage.setItem('DEBUG_RENDERER_INFO','1')
// recarregar a página
```
