# Prompt Mestre — Slides de Escultura Dental em Cera

Use este prompt no **Cursor** para gerar cada slide/página de um dente. Cole a transcrição do vídeo correspondente e anexe as fotos de referência.

---

## Prompt (copiar e colar)

```
Analise o projeto em docs/Gabriaela e implemente o slide do dente [NÚMERO]
seguindo EXATAMENTE o layout do slide de referência anexado
(public/images/reference/dente-11-slide.png).

NÃO gere imagem estática nem descrição textual solta — implemente código
(React + TypeScript) reutilizando os componentes existentes.

## Fontes obrigatórias

1. TRANSCRIÇÃO DO VÍDEO (abaixo) — fonte única do conteúdo textual.
   - NÃO altere, resuma demais, corrija ou invente medidas/instruções.
   - Extraia textos curtos e objetivos, mas mantendo fidelidade total.
   - Se a transcrição tiver erro de reconhecimento de voz, corrija apenas
     termos técnicos óbvios (ex.: "le cron" → "Le cron", "platina" → "palatina").

2. IMAGEM DE REFERÊNCIA DO SLIDE — modelo visual (grid, cores, cards numerados).
   - Reproduza a organização acadêmica: fundo branco, títulos azul-escuro,
     detalhes azul-claro, cards numerados, layout horizontal 16:9.

3. FOTOS DO DENTE (se anexadas) — use em src/data/tooth-XX.ts.
   - Quando não houver foto, crie placeholder identificado
     (ex.: "Imagem — desgaste grosseiro").
   - NÃO use ilustrações genéricas ou anatomicamente incorretas.

## Estrutura do slide (10 seções)

1. Medidas e preparação do bloco
2. Identificação das faces
3. Desenho do perfil nas proximais
4. Desgaste grosseiro
5. Modelagem vestibular
6. Modelagem palatina / lingual / oclusal (conforme o dente)
7. Ajuste das proporções e bordas
8. Finalização dos detalhes
9. Resultado final — vistas (vestibular, palatina/lingual, mesial, distal, incisal/oclusal)
10. Comparação com o dente contralateral

## Dente contralateral (OBRIGATÓRIO)

Cada slide explica UM dente e inclui quadro final sobre o par espelhado:

| Dente | Contralateral | Nome |
|-------|---------------|------|
| 11 | 21 | Incisivo central superior |
| 12 | 22 | Incisivo lateral superior |
| 13 | 23 | Canino superior |
| 14 | 24 | 1º pré-molar superior |
| 15 | 25 | 2º pré-molar superior |
| 16 | 26 | 1º molar superior |
| 17 | 27 | 2º molar superior |
| 31 | 41 | Incisivo central inferior |
| 32 | 42 | Incisivo lateral inferior |
| 33 | 43 | Canino inferior |
| 34 | 44 | 1º pré-molar inferior |
| 35 | 45 | 2º pré-molar inferior |
| 36 | 46 | 1º molar inferior |
| 37 | 47 | 2º molar inferior |

Inclua:
- Caixa `contralateralNote` no topo (como no slide do 11): resumo do espelhamento.
- Tabela `contralateralDifferences`: o que muda no dente oposto.

## Implementação técnica

- Crie `src/data/tooth-XX.ts` com objeto `ToothSculptureData`.
- NÃO duplique layout — reutilize DentalSculpturePage e componentes.
- Separe dados anatômicos do código visual.
- Responsivo: desktop 16:9 (grid 4 colunas), tablet 2 colunas, celular 1 coluna.
- Impressão/PDF: paisagem A4 ou 16:9.
- Exportação via botão "Exportar PDF / Imprimir".

## Estilo visual (igual ao slide de referência)

- Fundo branco ou off-white (#f8f9fb)
- Títulos: azul-escuro (#1e3a5f)
- Contornos e detalhes: azul-claro (#4a90c4 / #d6e8f5)
- Cards numerados com círculo azul
- Tipografia: Source Sans 3, legível
- Espaçamento consistente, sem áreas vazias desnecessárias
- Caixa de atenção para alertas importantes da transcrição

## Ao finalizar

Informe:
- Arquivos criados/modificados
- Como executar (`npm run dev`)
- Quais imagens ainda são placeholders
- Par contralateral configurado

---

TRANSCRIÇÃO DO VÍDEO — DENTE [NÚMERO]:

[COLE A TRANSCRIÇÃO COMPLETA AQUI]

---

FOTOS ANEXADAS:
- [ ] Slide de referência (layout)
- [ ] Fotos das etapas de escultura
- [ ] Fotos das vistas finais (V, P/L, M, D, I/O)
```

---

## Como usar — passo a passo

### 1. Escolha o dente e copie a transcrição

Cada vídeo abaixo corresponde a um arquivo de dados. **Não edite o texto** ao colar no prompt.

| Arquivo alvo | Dente | Vídeo / transcrição |
|---|---|---|
| `tooth-11.ts` | 11 | Incisivo central superior |
| `tooth-12.ts` | 12 | Incisivo lateral superior |
| `tooth-13.ts` | 13 | Canino superior |
| `tooth-14.ts` | 14 | 1º pré-molar superior |
| `tooth-15.ts` | 15 | 2º pré-molar superior |
| `tooth-16.ts` | 16 | 1º molar superior |
| `tooth-17.ts` | 17 | 2º molar superior |
| `tooth-31.ts` | 31 | Incisivo central inferior |
| `tooth-32.ts` | 32 | Incisivo lateral inferior |
| `tooth-33.ts` | 33 | Canino inferior |
| `tooth-34.ts` | 34 | 1º pré-molar inferior |
| `tooth-35.ts` | 35 | 2º pré-molar inferior |
| `tooth-36.ts` | 36 | 1º molar inferior |
| `tooth-37.ts` | 37 | 2º molar inferior |

### 2. Anexe as imagens no chat do Cursor

- **Obrigatório:** `public/images/reference/dente-11-slide.png` (modelo de layout)
- **Opcional:** fotos das etapas e vistas finais do dente específico

### 3. Execute o prompt

O Cursor deve criar/atualizar apenas `src/data/tooth-XX.ts` e, se necessário, registrar o dente em `App.tsx`.

### 4. Visualize e exporte

```bash
cd docs/Gabriaela
npm run dev
```

Abra no navegador → **Exportar PDF / Imprimir** → Salvar como PDF (paisagem).

---

## Regras importantes

1. **Fidelidade à transcrição** — medidas, sequência de cortes, instrumentos e alertas vêm do vídeo, não de outras fontes.
2. **Layout do slide 11** — todas as páginas seguem a mesma composição visual.
3. **Um slide por dente** — o contralateral é explicado no quadro final, não em página separada (salvo se solicitado).
4. **Escala macro 1,5×** — quando a transcrição mencionar "uma vez e meia", registre medidas originais e ampliadas no objeto de dados.
5. **Placeholders identificados** — nunca substitua por imagens aleatórias.

---

## Exemplo curto (dente 12)

```
Implemente o slide do dente 12 usando a transcrição abaixo.
Par contralateral: 22.
Medidas da transcrição: altura ~14 mm (1,5× de 9,3), mesiodistal ~10 mm,
vestíbulo-palatina ~9 mm. Marcar faces: vestibular, distal, palatina, mesial.
[... transcrição completa ...]
```

---

## Referência visual

O slide do **dente 11** (`public/images/reference/dente-11-slide.png`) é o padrão:

- Título centralizado
- Caixa superior direita com nota sobre o dente 21
- Grid 4×2 com 8 etapas numeradas
- Faixa inferior: 5 vistas finais + comparação 11 ↔ 21

Todos os demais dentes devem manter essa mesma harmonia visual.
