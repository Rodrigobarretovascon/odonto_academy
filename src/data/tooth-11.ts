import type { ToothSculptureData } from "../types/tooth";

const img = (file: string, alt: string, placeholderLabel: string) => ({
  src: `/images/tooth-11/${file}`,
  alt,
  placeholderLabel,
});

/**
 * Dente 11 — Incisivo central superior direito.
 * Imagens extraídas do slide de referência.
 * Par contralateral: 21.
 */
export const tooth11: ToothSculptureData = {
  number: 11,
  name: "Incisivo central superior direito",
  contralateralNumber: 21,
  contralateralName: "Incisivo central superior esquerdo",
  title: "Escultura Dental em Cera – Dente 11",
  subtitle: "Incisivo central superior · par contralateral 21",

  contralateralNote:
    "Para esculpir o dente 21, repita os mesmos passos, trocando mesial por distal (espelhamento). O processo é idêntico, apenas invertido.",

  blockMeasures: [
    { label: "Altura total do bloco", value: "48 mm" },
    { label: "Largura (mesiodistal)", value: "8,5 mm" },
    { label: "Espessura (vestíbulo-palatina)", value: "7,0 mm" },
    { label: "Área de escultura (incisal)", value: "10 mm" },
    { label: "Base de apoio (não esculpir)", value: "38 mm" },
  ],

  blockPreparation: [
    "Selecione o bloco com as dimensões acima.",
    "Marque a linha cervical separando os 10 mm superiores (escultura) dos 38 mm inferiores (base).",
    "Não esculpir abaixo da linha cervical nem acima dela além da área permitida.",
  ],

  blockImage: img(
    "01-bloco-medidas.png",
    "Bloco de cera com medidas 48×8,5×7 mm e área de escultura de 10 mm",
    "Imagem — diagrama do bloco com medidas",
  ),

  faceIdentification: {
    id: 2,
    title: "Identifique as faces",
    instructions: [
      "Borda incisal — extremidade superior de corte.",
      "Vestibular — face externa, voltada para os lábios.",
      "Palatina — face interna, voltada para o palato.",
      "Mesial — face de contato com o dente 21 (linha média).",
      "Distal — face de contato com o dente 12.",
      "Linha cervical — limite entre área de escultura (10 mm) e base (38 mm).",
    ],
    image: img(
      "02-faces.png",
      "Identificação das faces do dente 11",
      "Imagem — identificação das faces",
    ),
  },

  steps: [
    {
      id: 3,
      title: "Desenhe o perfil nas proximais",
      instructions: [
        "Trace o contorno nas faces mesial e distal (Vista Mesial e Vista Distal).",
        "Perfil com curva convexa na face vestibular.",
        "Curva mais suave na região cervical.",
      ],
      image: img(
        "03-perfil-proximal.png",
        "Perfil desenhado nas proximais",
        "Imagem — desenho da face proximal",
      ),
    },
    {
      id: 4,
      title: "Faça o desgaste grosseiro (apito)",
      instructions: [
        "Remova o excesso de cera seguindo os desenhos laterais.",
        "Trabalhe somente nos 10 mm superiores.",
        "Não toque na base de 38 mm nem corte acima da linha cervical.",
        "O bloco assume forma semelhante a um apito.",
      ],
      image: img(
        "04-desgaste-grosseiro.png",
        "Desgaste grosseiro — forma de apito",
        "Imagem — desgaste grosseiro",
      ),
      alert: "Preserve a base de 38 mm intacta.",
    },
    {
      id: 5,
      title: "Forme a vestibular",
      instructions: [
        "Afine lateralmente conforme setas indicativas.",
        "A borda incisal permanece mais larga.",
        "Superfície levemente arredondada, afinando gradualmente para a base.",
        "Evite formas planas ou quadradas.",
      ],
      image: img(
        "05-vestibular.png",
        "Modelagem da face vestibular",
        "Imagem — modelagem vestibular",
      ),
    },
    {
      id: 6,
      title: "Esculpa a palatina",
      instructions: [
        "Crie a fossa palatina côncava.",
        "Preserve o cíngulo no terço cervical.",
        "Defina crista marginal mesial e crista marginal distal.",
        "Mantenha transições suaves até a borda incisal.",
      ],
      image: img(
        "06-palatina.png",
        "Modelagem da face palatina",
        "Imagem — modelagem palatina",
      ),
    },
    {
      id: 7,
      title: "Ajuste proporção e borda incisal",
      instructions: [
        "Verifique nas vistas mesial, distal e incisal.",
        "Arredonde arestas vivas.",
        "O ângulo mesio-incisal deve ser mais reto que o disto-incisal.",
        "Confira espessura palatina uniforme.",
      ],
      image: img(
        "07-proporcao-incisal.png",
        "Ajuste de proporções e borda incisal",
        "Imagem — ajuste de proporções",
      ),
    },
    {
      id: 8,
      title: "Finalize os detalhes",
      instructions: [
        "Arredonde todas as transições.",
        "Adicione três sulcos vestibulares discretos.",
        "Defina três lóbulos discretos na face vestibular.",
        "Refine sem perder a anatomia estabelecida.",
      ],
      image: img(
        "08-finalizacao.png",
        "Finalização dos detalhes anatômicos",
        "Imagem — finalização dos detalhes",
      ),
    },
  ],

  finalViews: [
    {
      label: "Vestibular",
      image: img("final-vestibular.png", "Vista vestibular final", "Imagem — vista vestibular"),
    },
    {
      label: "Palatina",
      image: img("final-palatina.png", "Vista palatina final", "Imagem — vista palatina"),
    },
    {
      label: "Mesial",
      image: img("final-mesial.png", "Vista mesial final", "Imagem — vista mesial"),
    },
    {
      label: "Distal",
      image: img("final-distal.png", "Vista distal final", "Imagem — vista distal"),
    },
    {
      label: "Incisal",
      image: img("final-incisal.png", "Vista incisal final", "Imagem — vista incisal"),
    },
  ],

  contralateralDifferences: [
    {
      aspect: "Espelhamento geral",
      primaryTooth: "Mesial voltada para a linha média (lado direito).",
      contralateralTooth: "Mesial voltada para a linha média (lado esquerdo).",
    },
    {
      aspect: "Contato proximal mesial",
      primaryTooth: "Contato com o dente 21 (linha média).",
      contralateralTooth: "Contato com o dente 11 (linha média).",
    },
    {
      aspect: "Contato proximal distal",
      primaryTooth: "Contato com o dente 12.",
      contralateralTooth: "Contato com o dente 22.",
    },
    {
      aspect: "Assimetria natural",
      primaryTooth: "Mesial mais reta; distal mais arredondada.",
      contralateralTooth: "Mesial mais reta; distal mais arredondada (espelhado).",
    },
    {
      aspect: "Procedimento",
      primaryTooth: "Mesmos 8 passos descritos neste slide.",
      contralateralTooth: "Repetir os passos trocando mesial ↔ distal.",
    },
  ],

  alerts: [
    "Esculpir somente nos 10 mm superiores — base de 38 mm é apoio.",
    "Instrumentos: Le cron (afiado e de fábrica), Rollemberg nº 3/3S, espátula 7.",
  ],
};
