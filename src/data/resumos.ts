export type ResumoItem = {
  id: string;
  title: string;
  preview: string;
  body: string;
  topic: string;
};

export const RESUMOS: ResumoItem[] = [
  {
    id: "r-faces",
    title: "Faces do dente",
    preview: "Vestibular, lingual/palatina, mesial, distal e incisal/oclusal — o mapa básico para estudar e esculpir.",
    body: "Cada dente permanente apresenta faces orientadas no arco. A vestibular olha para lábios ou bochechas; a lingual/palatina para a cavidade oral interna; mesial e distal relacionam-se à linha média; a face de mastigação é incisal (anteriores) ou oclusal (posteriores). [Revisão odontológica pendente antes de uso clínico definitivo.]",
    topic: "Anatomia",
  },
  {
    id: "r-periodonto",
    title: "Periodonto em uma página",
    preview: "Gengiva, ligamento, cemento e osso alveolar trabalham juntos para sustentar o dente.",
    body: "O periodonto de inserção e proteção inclui gengiva, ligamento periodontal, cemento e osso alveolar. Alterações inflamatórias podem evoluir de gengivite para periodontite. [Placeholder educacional — validar com profissional.]",
    topic: "Periodonto",
  },
  {
    id: "r-fdi",
    title: "Numeração FDI",
    preview: "Dois dígitos: quadrante + posição. Ex.: 23 = canino superior esquerdo.",
    body: "No sistema FDI permanente, os quadrantes 1 e 2 são superiores (direita e esquerda do paciente); 3 e 4, inferiores. O segundo dígito conta a partir da linha média (1 central … 8 terceiro molar).",
    topic: "Geral",
  },
];
