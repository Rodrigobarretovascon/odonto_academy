export type FinalQuizItem = {
  id: string;
  prompt: string;
  choices: { id: string; label: string }[];
  correctId: string;
  explanation: string;
};

export const FINAL_QUIZ: FinalQuizItem[] = [
  {
    id: "q1",
    prompt: "Qual face está voltada para os lábios?",
    choices: [
      { id: "V", label: "Vestibular" },
      { id: "L", label: "Lingual" },
      { id: "M", label: "Mesial" },
    ],
    correctId: "V",
    explanation: "A face vestibular é a externa, voltada para os lábios.",
  },
  {
    id: "q2",
    prompt: "Qual face contém cíngulo, fossa e cristas marginais?",
    choices: [
      { id: "V", label: "Vestibular" },
      { id: "L", label: "Lingual" },
      { id: "I", label: "Incisal" },
    ],
    correctId: "P",
    explanation: "A face lingual concentra cíngulo, fossa e as cristas.",
  },
  {
    id: "q3",
    prompt: "Onde se localiza o cíngulo?",
    choices: [
      { id: "cerv-p", label: "Terço cervical da face lingual" },
      { id: "inc-v", label: "Terço incisal da face vestibular" },
      { id: "mid-m", label: "Terço médio da face mesial" },
    ],
    correctId: "cerv-p",
    explanation: "O cíngulo é o volume cervical arredondado na face lingual.",
  },
  {
    id: "q4",
    prompt: "As cristas marginais delimitam principalmente:",
    choices: [
      { id: "fossa", label: "A fossa lingual" },
      { id: "boss", label: "A bossa vestibular" },
      { id: "root", label: "A raiz" },
    ],
    correctId: "fossa",
    explanation: "Cristas mesial e distal bordam a fossa lingual.",
  },
  {
    id: "q5",
    prompt: "No dente 11, a face mesial está em relação a:",
    choices: [
      { id: "midline", label: "Linha média / dente 21" },
      { id: "lateral", label: "Incisivo lateral 12" },
      { id: "canine", label: "Canino" },
    ],
    correctId: "midline",
    explanation: "Mesial do 11 aponta para a linha média (contato com o 21).",
  },
  {
    id: "q6",
    prompt: "Qual ângulo incisal é mais arredondado?",
    choices: [
      { id: "DI", label: "Distoincisal" },
      { id: "MI", label: "Mesioincisal" },
      { id: "equal", label: "Os dois iguais" },
    ],
    correctId: "DI",
    explanation: "O ângulo distoincisal é naturalmente mais arredondado que o mesial.",
  },
  {
    id: "q7",
    prompt: "A bossa vestibular concentra-se no:",
    choices: [
      { id: "cerv", label: "Terço cervical" },
      { id: "mid", label: "Terço médio" },
      { id: "inc", label: "Terço incisal" },
    ],
    correctId: "cerv",
    explanation: "A maior convexidade vestibular fica no terço cervical.",
  },
  {
    id: "q8",
    prompt: "A concavidade lingual (fossa) deve ser:",
    choices: [
      { id: "shallow", label: "Rasa e central, entre as cristas" },
      { id: "deep", label: "Profunda até o cíngulo" },
      { id: "flat", label: "Plana, sem depressão" },
    ],
    correctId: "shallow",
    explanation: "A fossa é ampla e rasa; cristas e cíngulo permanecem.",
  },
  {
    id: "q9",
    prompt: "Uma “quina artificial” indica:",
    choices: [
      { id: "abrupt", label: "Transição abrupta que precisa suavizar" },
      { id: "anatomy", label: "Detalhe anatômico desejável" },
      { id: "measure", label: "Linha de medida da régua" },
    ],
    correctId: "abrupt",
    explanation: "Quinas artificiais são arestas bruscas; a luz rasante as revela.",
  },
  {
    id: "q10",
    prompt: "Excesso de desgaste no cíngulo resulta em:",
    choices: [
      { id: "lost", label: "Perda do volume cervical lingual" },
      { id: "boss", label: "Bossa vestibular aumentada" },
      { id: "width", label: "Coroa mais larga" },
    ],
    correctId: "lost",
    explanation: "Desgaste excessivo no cíngulo apaga o volume que deveria ser preservado.",
  },
];
