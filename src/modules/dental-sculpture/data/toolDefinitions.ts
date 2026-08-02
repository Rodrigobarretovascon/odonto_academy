import type { AnatomyStructure, ToolDefinition } from "../types/sculpture";

export const SCULPTURE_TOOLS: ToolDefinition[] = [
  {
    id: "wax",
    name: "Bloco de cera",
    function:
      "Matéria-prima que será progressivamente desgastada até adquirir a forma do dente.",
    usedInSteps: [1],
  },
  {
    id: "ruler",
    name: "Régua",
    function:
      "Planeja e delimita as dimensões da escultura. Neste tutorial as medidas são proporcionais.",
    usedInSteps: [1, 14],
  },
  {
    id: "scalpel",
    name: "Estilete",
    function: "Cortes iniciais e remoção dos maiores excessos de cera.",
    usedInSteps: [1, 4, 5, 6, 7],
    safety: "Realize os cortes lentamente e sempre mantenha os dedos fora da direção da lâmina.",
  },
  {
    id: "lecron",
    name: "Lecron",
    function:
      "Desgastes controlados, arredondamento, concavidades e definição dos detalhes anatômicos.",
    usedInSteps: [8, 9, 10, 11, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  },
  {
    id: "brush",
    name: "Escova",
    function: "Retira partículas de cera para avaliar melhor a superfície (não altera anatomia).",
    usedInSteps: [12, 24],
  },
  {
    id: "nylon",
    name: "Meia fina",
    function: "Alisa a superfície e suaviza pequenas irregularidades no acabamento final.",
    usedInSteps: [24],
    safety: "Não friccione em excesso — pode apagar detalhes anatômicos.",
  },
];

export const CENTRAL_UPPER_ANATOMY: AnatomyStructure[] = [
  {
    id: "face-v",
    name: "Face vestibular",
    face: "V",
    description: "Face externa, voltada para os lábios. Convexidade com bossa no terço cervical.",
    createdInStep: 2,
  },
  {
    id: "face-p",
    name: "Face lingual",
    face: "P",
    description: "Face interna. Contém cíngulo, fossa e cristas marginais.",
    createdInStep: 2,
  },
  {
    id: "face-m",
    name: "Face mesial",
    face: "M",
    description: "Contato com o 21. Contorno mais reto; ângulo mesioincisal mais definido.",
    createdInStep: 2,
  },
  {
    id: "face-d",
    name: "Face distal",
    face: "D",
    description: "Contato com o 12. Contorno mais arredondado; ângulo distoincisal mais suave.",
    createdInStep: 2,
  },
  {
    id: "incisal",
    name: "Borda incisal",
    face: "I",
    description: "Extremidade de corte da coroa.",
    createdInStep: 3,
  },
  {
    id: "cervical",
    name: "Linha cervical",
    face: "cervical",
    description: "Limite sinuoso entre coroa e raiz/base.",
    createdInStep: 11,
  },
  {
    id: "cingulum",
    name: "Cíngulo",
    face: "P",
    description: "Volume cervical lingual, arredondado e contínuo — não esférico.",
    createdInStep: 17,
  },
  {
    id: "fossa",
    name: "Concavidade lingual",
    face: "P",
    description: "Fossa rasa e ampla entre as cristas marginais, acima do cíngulo.",
    createdInStep: 15,
  },
  {
    id: "crm",
    name: "Crista marginal mesial",
    face: "P",
    description: "Borda lateral mesial da fossa lingual.",
    createdInStep: 16,
  },
  {
    id: "crd",
    name: "Crista marginal distal",
    face: "P",
    description: "Borda lateral distal da fossa lingual.",
    createdInStep: 16,
  },
  {
    id: "boss",
    name: "Bossa vestibular",
    face: "V",
    description: "Maior proeminência vestibular, no terço cervical.",
    createdInStep: 10,
  },
  {
    id: "lobes",
    name: "Lóbulos vestibulares",
    face: "V",
    description: "Três lóbulos de desenvolvimento com depressões discretas entre eles.",
    createdInStep: 20,
  },
];
