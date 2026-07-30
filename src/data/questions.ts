export type QuestionCategory = "anatomia" | "periodonto" | "oclusao" | "escultura" | "geral";

export type DentalQuestion = {
  id: string;
  question: string;
  answer: string;
  category: QuestionCategory;
  tags: string[];
  /** Conteúdo completo exige assinatura quando true */
  subscriberOnly?: boolean;
};

export const DENTAL_QUESTIONS: DentalQuestion[] = [
  {
    id: "q-21-raizes",
    question: "Quantas raízes tem o dente 21?",
    answer:
      "O incisivo central superior (FDI 21) possui, em regra, uma raiz. Variações anatômicas existem e devem ser confirmadas clinicamente e por imagem.",
    category: "anatomia",
    tags: ["21", "raiz", "incisivo"],
  },
  {
    id: "q-ligamento",
    question: "Qual é a função do ligamento periodontal?",
    answer:
      "O ligamento periodontal une o cemento radicular ao osso alveolar, absorve cargas mastigatórias, permite micromovimentos e contém vasos e nervos que nutrem e sensibilizam o periodonto.",
    category: "periodonto",
    tags: ["ligamento", "periodonto"],
  },
  {
    id: "q-faces-molar",
    question: "Quais são as faces de um molar?",
    answer:
      "Um molar permanente apresenta faces vestibular, lingual (ou palatina), mesial, distal e oclusal. Cada face tem relevos próprios (cúspides, sulcos, fossas).",
    category: "anatomia",
    tags: ["molar", "faces"],
  },
  {
    id: "q-fdi",
    question: "O que significa a numeração FDI?",
    answer:
      "É o sistema de dois dígitos da Fédération Dentaire Internationale: o primeiro indica o quadrante (1–4 permanentes) e o segundo a posição do dente a partir da linha média (1–8).",
    category: "geral",
    tags: ["FDI", "numeração"],
  },
  {
    id: "q-cera-lecron",
    question: "Para que serve o instrumento Le cron na escultura em cera?",
    answer:
      "O Le cron (ou Lecron) é usado para modelar, escavar sulcos e refinar detalhes superficiais na cera com controle fino — especialmente em faces oclusais e cristas.",
    category: "escultura",
    tags: ["cera", "instrumento"],
    subscriberOnly: true,
  },
];

export const QUESTION_CATEGORY_LABEL: Record<QuestionCategory, string> = {
  anatomia: "Anatomia",
  periodonto: "Periodonto",
  oclusao: "Oclusão",
  escultura: "Escultura",
  geral: "Geral",
};
