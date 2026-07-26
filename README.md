# Escultura Dental em Cera — Gabriela

Sistema reutilizável para apresentar instruções de escultura dental em cera, com layout responsivo e exportação para PDF.

## Estrutura

```text
src/
  components/
    DentalSculpturePage.tsx   # Página completa de um dente
    InstructionCard.tsx       # Card numerado por etapa
    ToothView.tsx             # Vistas finais (vestibular, palatina, etc.)
    MeasurementDiagram.tsx    # Medidas e preparação do bloco
    ContralateralComparison.tsx
    ImagePlaceholder.tsx      # Placeholder identificado para imagens
  data/
    tooth-12.ts               # Conteúdo do dente 12 (editável)
  types/
    tooth.ts                  # Tipos compartilhados
```

## Como executar

```bash
cd /Users/rbarreto/CascadeProjects/gabriela
npm install
npm run dev
```

Abra o endereço indicado no terminal (geralmente `http://localhost:5173`).

## Como visualizar e exportar PDF

1. Abra a página no navegador.
2. Clique em **Exportar PDF / Imprimir**.
3. No diálogo de impressão, escolha **Salvar como PDF**.
4. Orientação: **Paisagem** (landscape).

## Adicionar um novo dente

1. Copie `src/data/tooth-12.ts` para `src/data/tooth-XX.ts`.
2. Preencha o objeto com medidas, etapas, alertas e diferenças contralaterais.
3. Em `src/App.tsx`, importe o novo arquivo de dados.

## Adicionar imagens

Coloque os arquivos em `public/images/tooth-12/` e referencie no objeto de dados:

```typescript
image: {
  src: "/images/tooth-12/vestibular.jpg",
  alt: "Vista vestibular final",
  placeholderLabel: "Imagem — vista vestibular",
}
```

Quando `src` estiver ausente, o placeholder identificado será exibido automaticamente.

## Build para produção

```bash
npm run build
npm run preview
```

Os arquivos estáticos ficam em `dist/`.
