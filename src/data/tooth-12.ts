import type { ToothSculptureData } from "../types/tooth";

const img = (file: string, alt: string, placeholderLabel: string) => ({
  src: `/images/tooth-12/${file}`,
  alt,
  placeholderLabel,
});

/**
 * Dente 12 — Incisivo lateral superior direito.
 * Imagens geradas para cada etapa. Par contralateral: 22.
 */
export const tooth12: ToothSculptureData = {
  number: 12,
  name: "Incisivo lateral superior direito",
  contralateralNumber: 22,
  contralateralName: "Incisivo lateral superior esquerdo",
  title: "Escultura Dental em Cera – Dente 12",
  subtitle: "Incisivo lateral superior · par contralateral 22",

  contralateralNote:
    "Para esculpir o dente 22, repita os mesmos passos trocando mesial por distal. O lateral é menor e mais estreito que o central — lembra um central comprimido.",

  blockMeasures: [
    { label: "Altura real", value: "9,3 mm" },
    { label: "Altura na escultura (1,5×)", value: "~14 mm (marcar ~15 mm com margem)" },
    { label: "Mesiodistal real", value: "7,0 mm" },
    { label: "Mesiodistal na escultura (1,5×)", value: "~10 mm" },
    { label: "Vestíbulo-palatina real", value: "6,1 mm" },
    { label: "Vestíbulo-palatina na escultura (1,5×)", value: "~9 mm" },
  ],

  blockPreparation: [
    "Centralize o dente no bloco: bloco ~20 mm, largura do dente ~9 mm → ~5 mm de cada lado.",
    "Marcar altura ~15 mm (14 mm + margem de segurança).",
    "Definir faces: vestibular, distal, palatina, mesial.",
    "Dividir em terços (quadriculado) antes do desenho.",
  ],

  blockImage: img("12-01-bloco.png", "Bloco de cera com medidas para dente 12", "Imagem — diagrama do bloco com medidas"),

  faceIdentification: {
    id: 2,
    title: "Identifique as faces",
    instructions: [
      "Vestibular — face externa.",
      "Palatina — face interna; forma côncava com cíngulo no terço cervical.",
      "Mesial — contato com o dente 11; mais reta, encostada no central.",
      "Distal — contato com o dente 13; mais arredondada e inclinada.",
      "Incisal — borda de corte; mesial mais reta, distal mais arredondada.",
    ],
    image: img("12-02-faces.png", "Identificação das faces do dente 12", "Imagem — identificação das faces"),
  },

  steps: [
    {
      id: 3,
      title: "Desenhe o perfil nas proximais",
      instructions: [
        "Começar pela distal: marcar ~5 mm de cada lado no bloco de ~10 mm.",
        "Desenho na mesial encostado no central; na distal mais inclinada.",
        "Copiar o desenho para o lado oposto, mantendo paralelismo.",
        "Dividir altura em terços para orientar o contorno.",
      ],
      image: img("12-03-proximal.png", "Perfil desenhado nas proximais", "Imagem — desenho da face proximal"),
    },
    {
      id: 4,
      title: "Faça o desgaste grosseiro",
      instructions: [
        "Cortar com estilete seguindo o desenho das proximais.",
        "Cortar vestibular e palatina com cuidado.",
        "Ajustar mesial para ficar mais evidente.",
        "Resultado: figura geométrica esquematizando o dente.",
      ],
      image: img("12-04-desgaste.png", "Desgaste grosseiro do bloco", "Imagem — desgaste grosseiro"),
      alert: "Trabalhar somente na área demarcada; preservar margem de segurança.",
    },
    {
      id: 5,
      title: "Forme a vestibular",
      instructions: [
        "Mesial mais próxima e reta; distal começa mais abaixo e inclinada.",
        "Vestibular passa dentro do quadrante demarcado.",
        "Desgastar com Le cron: contar e ir convergindo.",
        "Dente converge no sentido vestíbulo-palatino e médio-distal.",
      ],
      image: img("12-05-vestibular.png", "Modelagem da face vestibular", "Imagem — modelagem vestibular"),
    },
    {
      id: 6,
      title: "Esculpa a palatina",
      instructions: [
        "Face palatina côncava; cíngulo no terço cervical.",
        "Crista marginal mesial e distal.",
        "Remover marcas do quadriculado que atrapalham (margem de segurança permite).",
        "Proximais levemente côncavas para definir contorno.",
      ],
      image: img("12-06-palatina.png", "Modelagem da face palatina", "Imagem — modelagem palatina"),
    },
    {
      id: 7,
      title: "Ajuste proporção e borda incisal",
      instructions: [
        "Mesial maior e mais incisal; distal mais arredondada e menor.",
        "Ajustar bordas — lateral é menor que o central (11).",
        "Verificar inclinações em todas as faces.",
        "Tirar excessos de cera para enxergar melhor.",
      ],
      image: img("12-07-proporcao.png", "Ajuste de proporções", "Imagem — ajuste de proporções"),
    },
    {
      id: 8,
      title: "Finalize os detalhes",
      instructions: [
        "Definir lóbulos (bipartido ou tripartido, ou liso conforme preferência).",
        "Polir com escova e meia fina.",
        "Conferir simetria geral com o modelo.",
        "Resultado: incisivo lateral menor e mais estreito que o central.",
      ],
      image: img("12-08-finalizacao.png", "Detalhes finais", "Imagem — finalização dos detalhes"),
    },
  ],

  finalViews: [
    { label: "Vestibular", image: img("12-final-vestibular.png", "Vista vestibular final", "Imagem — vista vestibular") },
    { label: "Palatina", image: img("12-final-palatina.png", "Vista palatina final", "Imagem — vista palatina") },
    { label: "Mesial", image: img("12-final-mesial.png", "Vista mesial final", "Imagem — vista mesial") },
    { label: "Distal", image: img("12-final-distal.png", "Vista distal final", "Imagem — vista distal") },
    { label: "Incisal", image: img("12-final-incisal.png", "Vista incisal final", "Imagem — vista incisal") },
  ],

  contralateralDifferences: [
    {
      aspect: "Espelhamento",
      primaryTooth: "Mesial para linha média (lado direito); distal para o 13.",
      contralateralTooth: "Mesial para linha média (lado esquerdo); distal para o 23.",
    },
    {
      aspect: "Contato mesial",
      primaryTooth: "Encosta no dente 11.",
      contralateralTooth: "Encosta no dente 21.",
    },
    {
      aspect: "Contato distal",
      primaryTooth: "Encosta no dente 13.",
      contralateralTooth: "Encosta no dente 23.",
    },
    {
      aspect: "Proporção",
      primaryTooth: "Mesial mais reta; distal mais arredondada.",
      contralateralTooth: "Mesmo padrão, espelhado.",
    },
  ],

  alerts: [
    "Instrumentos: bloco de cera, Le cron, estilete, escova, meia fina, régua.",
    "Margem de segurança na altura (~15 mm) compensa marcas do quadriculado.",
    "O 12 é visivelmente menor e mais estreito que o 11.",
  ],
};
