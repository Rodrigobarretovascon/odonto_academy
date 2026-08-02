import type { ToothSculptureData } from "../types/tooth";

const img = (file: string, alt: string, placeholderLabel: string) => ({
  src: `/images/tooth-13/${file}`,
  alt,
  placeholderLabel,
});

/**
 * Dente 13 — Canino superior direito.
 * Imagens geradas para cada etapa. Par contralateral: 23.
 */
export const tooth13: ToothSculptureData = {
  number: 13,
  name: "Canino superior direito",
  contralateralNumber: 23,
  contralateralName: "Canino superior esquerdo",
  title: "Escultura Dental em Cera – Dente 13",
  subtitle: "Canino superior · par contralateral 23",

  contralateralNote:
    "Para esculpir o dente 23, repita os mesmos passos trocando mesial por distal. O canino é muito convexo na vestibular e tem formato de pentágono — espelhe o desenho geométrico.",

  blockMeasures: [
    { label: "Altura real", value: "10,5 mm" },
    { label: "Altura na escultura (1,5×)", value: "~15,8 mm (marcar ~16 mm)" },
    { label: "Vestíbulo-lingual real", value: "8,4 mm" },
    { label: "Vestíbulo-lingual na escultura (1,5×)", value: "~12,6 mm (~13 mm)" },
    { label: "Mesiodistal real", value: "7,9 mm" },
    { label: "Mesiodistal na escultura (1,5×)", value: "~11,9 mm (~12 mm)" },
  ],

  blockPreparation: [
    "Você precisa apenas de um bloco de cera e um Lecron.",
    "Marcar altura ~15,8 mm (quase 16 mm) em todo o bloco.",
    "Delimitar faces do dente 13: vestibular, distal, lingual, mesial.",
    "Centralizar no bloco (~20 mm): ~12,6 mm de largura → ~3,5 mm de cada lado.",
    "Dividir em terços (quadriculado) antes do desenho.",
  ],

  blockImage: img("13-01-bloco.png", "Bloco de cera com medidas para dente 13", "Imagem — diagrama do bloco com medidas"),

  faceIdentification: {
    id: 2,
    title: "Identifique as faces",
    instructions: [
      "Vestibular — face externa; muito convexa, especialmente no terço médio.",
      "Lingual — face interna; cristas marginais e elevação central (ponta do cúspide).",
      "Mesial — contato com o dente 12; borda mesial mais longa e demarcada.",
      "Distal — contato com o dente 14; borda distal mais curta e inclinada.",
      "Incisal — ponta do cúspide; característica principal do canino.",
    ],
    image: img("13-02-faces.png", "Identificação das faces do dente 13", "Imagem — identificação das faces"),
  },

  steps: [
    {
      id: 3,
      title: "Desenhe o perfil nas proximais",
      instructions: [
        "Começar pelo corte na face mesial (desenho e quadriculado).",
        "Desenhar o símbolo (cíngulo) na região cervical.",
        "Bossa vestibular estende um pouco além do terço cervical.",
        "Contorno termina entre o terço médio e o terço lingual-lingual.",
        "Reproduzir desenho simétrico na face distal.",
      ],
      image: img("13-03-proximal.png", "Perfil e desenho nas proximais", "Imagem — desenho da face proximal"),
    },
    {
      id: 4,
      title: "Faça o desgaste grosseiro",
      instructions: [
        "Canino muito convexo na vestibular — não cortar demais no terço médio central (região mais alta).",
        "Cortar com margem de segurança; remover excesso gradualmente.",
        "Na cervical, dar corte triangular (retirar \"corpinho\" como uma cunha).",
        "Resultado: silhueta geométrica em forma de pentágono (\"cadeirinha\").",
        "Mesial cervical mais baixa; atinge terço médio; distal desce um pouco mais.",
      ],
      image: img("13-04-desgaste.png", "Desgaste grosseiro — forma pentagonal", "Imagem — desgaste grosseiro"),
      alert: "Deixar área espessa na lingual para cristas marginais e ponta do cúspide.",
    },
    {
      id: 5,
      title: "Forme a vestibular",
      instructions: [
        "Delimitar vestibular: bloco ~20 mm, largura ~12 → sobram ~8 mm (4 mm de cada lado).",
        "Desenho na vestibular: forma de pentágono; cúspide incisal mais curta e menos inclinada.",
        "Borda distal mais comprida (afasta-se do palato).",
        "Desgastar com Lecron: maior desgaste na distal que na mesial (formato de lança).",
        "Vestibular levemente côncava se observada de perfil; arredondar contornos.",
      ],
      image: img("13-05-vestibular.png", "Modelagem da face vestibular", "Imagem — modelagem vestibular"),
    },
    {
      id: 6,
      title: "Esculpa a lingual",
      instructions: [
        "Desenhar crista marginal mesial e crista marginal distal.",
        "Crista intermediária na região central — forma a ponta do cúspide (marca do canino).",
        "Deixar elevação central evidente; não cortar a ponta cedo demais.",
        "Convexidade na vestibular; concavidade e cristas na lingual.",
        "Corte incisal lingual só após definir a ponta do cúspide.",
      ],
      image: img("13-06-lingual.png", "Modelagem da face lingual", "Imagem — modelagem lingual"),
    },
    {
      id: 7,
      title: "Ajuste proporção e borda incisal",
      instructions: [
        "Mesial deve ser maior: traçar linha dividindo as metades — mesial mais comprida.",
        "Distal um pouco mais demarcada e menos inclinada que o ideal? Corrigir ângulo inciso-mesial (mais baixo) e inciso-distal.",
        "Ajustar proximais: terço cervical côncavo; região incisal convexa.",
        "Tirar restos de cera para enxergar anatomia corretamente.",
        "Verificar perfil de lança: mesial longa, distal mais curta.",
      ],
      image: img("13-07-proporcao.png", "Ajuste de proporções e borda incisal", "Imagem — ajuste de proporções"),
    },
    {
      id: 8,
      title: "Finalize os detalhes",
      instructions: [
        "Arredondar margens ainda retas; aproximar ao desenho de referência.",
        "Refinar ponta do cúspide e cristas marginais.",
        "Polimento final com escova e meia fina.",
        "Conferir formato pentagonal e convexidade vestibular.",
      ],
      image: img("13-08-finalizacao.png", "Finalização dos detalhes anatômicos", "Imagem — finalização dos detalhes"),
    },
  ],

  finalViews: [
    { label: "Vestibular", image: img("13-final-vestibular.png", "Vista vestibular final", "Imagem — vista vestibular") },
    { label: "Lingual", image: img("13-final-lingual.png", "Vista lingual final", "Imagem — vista lingual") },
    { label: "Mesial", image: img("13-final-mesial.png", "Vista mesial final", "Imagem — vista mesial") },
    { label: "Distal", image: img("13-final-distal.png", "Vista distal final", "Imagem — vista distal") },
    { label: "Incisal", image: img("13-final-incisal.png", "Vista incisal final", "Imagem — vista incisal") },
  ],

  contralateralDifferences: [
    {
      aspect: "Espelhamento",
      primaryTooth: "Mesial voltada para o dente 12; distal para o 14.",
      contralateralTooth: "Mesial voltada para o dente 22; distal para o 24.",
    },
    {
      aspect: "Contato mesial",
      primaryTooth: "Contato com o dente 12 (lateral).",
      contralateralTooth: "Contato com o dente 22 (lateral).",
    },
    {
      aspect: "Contato distal",
      primaryTooth: "Contato com o dente 14 (1º pré-molar).",
      contralateralTooth: "Contato com o dente 24 (1º pré-molar).",
    },
    {
      aspect: "Bordas incisais",
      primaryTooth: "Mesial mais longa e demarcada; distal mais curta.",
      contralateralTooth: "Mesmo padrão morfológico, espelhado.",
    },
    {
      aspect: "Procedimento",
      primaryTooth: "Mesmos passos; formato pentagonal e ponta de cúspide central.",
      contralateralTooth: "Repetir trocando mesial ↔ distal.",
    },
  ],

  alerts: [
    "Não remover cera demais no terço médio vestibular no início — região central é mais alta.",
    "Reservar volume lingual para crista intermediária (ponta do cúspide).",
    "Desgaste maior na distal que na mesial (formato de lança).",
    "Você precisa apenas de um bloco de cera e um Lecron.",
  ],
};
