import type { CommonErrorId } from "../lib/proceduralIncisor";

export type CommonErrorDef = {
  id: CommonErrorId;
  title: string;
  description: string;
  reason: string;
  howToFix: string;
  relatedStep: number;
};

export const COMMON_ERRORS: CommonErrorDef[] = [
  {
    id: "too-wide",
    title: "Dente muito largo",
    description: "Largura mesiodistal exagerada em relação à altura.",
    reason: "Excesso proximal não removido ou marcações iniciais largas demais.",
    howToFix: "Reveja convergência e proporção (fases 6 e 19).",
    relatedStep: 19,
  },
  {
    id: "too-narrow",
    title: "Dente muito estreito",
    description: "Coroa afilada demais no sentido MD.",
    reason: "Cortes grosseiros ultrapassaram a linha de segurança.",
    howToFix: "Não há como repor cera — evite na fase 4; use margem.",
    relatedStep: 4,
  },
  {
    id: "thin-cervical",
    title: "Cervical muito fina",
    description: "Colo excessivamente constrito.",
    reason: "Convergência exagerada ou recuperação cervical incompleta.",
    howToFix: "Trabalhe com passes leves nas fases 6 e 21.",
    relatedStep: 21,
  },
  {
    id: "flat-vestibular",
    title: "Vestibular plana",
    description: "Falta a bossa e a convexidade cervical.",
    reason: "Desgaste uniforme sem preservar o terço cervical.",
    howToFix: "Reveja a fase 10 (bossa vestibular).",
    relatedStep: 10,
  },
  {
    id: "too-square",
    title: "Dente muito quadrado",
    description: "Contornos sem convergência e ângulos duros.",
    reason: "Arredondamento geral e DI insuficientes.",
    howToFix: "Fases 9 e 18 — arredonde DI e suavize quinas.",
    relatedStep: 9,
  },
  {
    id: "symmetric-md",
    title: "Distal igual à mesial",
    description: "Assimetria natural apagada.",
    reason: "Forçar simetria espelhada nas inspeções.",
    howToFix: "Na fase 18, compare MI mais angular e DI mais redondo.",
    relatedStep: 18,
  },
  {
    id: "no-cingulum",
    title: "Cíngulo removido",
    description: "Volume cervical lingual ausente.",
    reason: "Desgaste lingual sem proteção do cíngulo.",
    howToFix: "Fases 7 e 17 — preserve e integre o volume.",
    relatedStep: 17,
  },
  {
    id: "shallow-fossa",
    title: "Concavidade lingual rasa",
    description: "Fossa quase plana.",
    reason: "Poucas passagens com a colher do Lecron.",
    howToFix: "Fase 15 — aprofundamento controlado no centro.",
    relatedStep: 15,
  },
  {
    id: "deep-fossa",
    title: "Concavidade lingual profunda demais",
    description: "Fossa excessiva ameaçando cristas.",
    reason: "Pressão alta ou muitas passagens no centro.",
    howToFix: "Pare cedo; preserve cristas (fase 16).",
    relatedStep: 16,
  },
  {
    id: "lost-crests",
    title: "Cristas marginais apagadas",
    description: "Bordas laterais da fossa niveladas.",
    reason: "Desgaste atingiu as regiões protegidas.",
    howToFix: "Trabalhe só no centro da fossa.",
    relatedStep: 16,
  },
  {
    id: "deep-sulci",
    title: "Sulcos vestibulares profundos",
    description: "Riscos acentuados na V.",
    reason: "Movimentos de sulco com pressão alta.",
    howToFix: "Fase 20 — sulcos rasos e sutis.",
    relatedStep: 20,
  },
  {
    id: "over-polish",
    title: "Acabamento excessivo",
    description: "Detalhes anatômicos suavizados demais.",
    reason: "Meia fina usada como instrumento de escultura.",
    howToFix: "Fase 24 — apenas irregularidades mínimas.",
    relatedStep: 24,
  },
];
