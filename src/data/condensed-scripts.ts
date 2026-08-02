/**
 * Roteiros condensados no estilo das videoaulas de escultura (técnica regressiva).
 * Tom oral: tabela → faces → proximais → arredondar → detalhes → (sulcos) → refino.
 * Materiais na app: cera + Lecron. Textos só do dente aberto.
 */

import type { AnimPhase } from "./sculpture-scripts";

export type ToothKind = "incisor" | "canine" | "premolar" | "molar";
export type Jaw = "upper" | "lower";

export interface CondensedMeasures {
  altura?: string;
  md?: string;
  vl?: string;
}

export interface CondensedStep {
  id: number;
  title: string;
  animPhase: AnimPhase;
  instructions: string[];
  alert?: string;
}

function neighborHint(n: number, kind: ToothKind): string {
  if (kind === "incisor" && n % 10 === 1) {
    return `No dente ${n}, a mesial fica voltada para a linha média; a distal fica para o lado do incisivo lateral.`;
  }
  if (kind === "incisor" && n % 10 === 2) {
    return `No dente ${n}, a mesial fica voltada para o central; a distal fica para o canino.`;
  }
  if (kind === "canine") {
    return `No dente ${n}, a mesial fica voltada para o lateral; a distal fica para o primeiro pré-molar.`;
  }
  if (kind === "premolar" && n % 10 === 4) {
    return `No dente ${n}, a mesial fica voltada para o canino; a distal fica para o segundo pré-molar.`;
  }
  if (kind === "premolar") {
    return `No dente ${n}, a mesial fica voltada para o primeiro pré-molar; a distal fica para o primeiro molar.`;
  }
  if (kind === "molar" && n % 10 === 6) {
    return `No dente ${n}, a mesial fica voltada para o segundo pré-molar; a distal fica para o segundo molar.`;
  }
  return `No dente ${n}, a mesial fica voltada para o primeiro molar; a distal fica para o terceiro molar (quando presente).`;
}

function anatomyNotes(kind: ToothKind, jaw: Jaw, n: number): {
  crown: string;
  rough: string;
  round: string;
  detail: string;
  lingual: string;
  occlusal?: string;
} {
  const pos = n % 10;

  if (kind === "incisor" && pos === 1 && jaw === "upper") {
    return {
      crown:
        "Incisivo central superior: coroa alargada (MD ≈ 80% da altura). Ângulo mésio-incisal próximo de 90°; distal mais arredondado.",
      rough:
        "Na lingual há formação do cíngulo — não retire em linha reta (senão vira “poltrona”). Deixe margem de segurança.",
      round:
        "Bossa vestibular tende ao terço cervical. Desgaste um pouco mais na distal do que na mesial. Convexidade, não plano.",
      detail:
        "Mamelões e sulcos de desenvolvimento discretos na vestibular. Mesial mais comprida que a distal.",
      lingual: "Fossa lingual entre cristas marginais; cíngulo no terço cervical.",
    };
  }
  if (kind === "incisor" && pos === 1 && jaw === "lower") {
    return {
      crown:
        "Incisivo central inferior: o mais estreito e compacto da arcada. Mesial e distal bem parecidas — diferença sutil.",
      rough:
        "Formato quase retangular no esboço. Inclinação para lingual já começa a aparecer. Margem de segurança generosa.",
      round:
        "Bem convexo no mésio-distal e no cérvico-incisal. Como a margem costuma ser grande, agora é hora de deixar proporcional.",
      detail:
        "Poucos detalhes vestibulares. Borda ligeiramente arredondada; com o tempo a mesial desgasta um pouco mais.",
      lingual: "Cíngulo discreto; fossa lingual rasa — não aprofunde demais.",
    };
  }
  if (kind === "incisor" && pos === 2 && jaw === "upper") {
    return {
      crown:
        "Incisivo lateral superior: mais estreito que o central; lembra um central “comprimido”. Distal bem arredondada e inclinada.",
      rough:
        "Na vestibular o desenho quase encosta no limite; na lingual a concavidade começa no terço médio e volta ao cíngulo. Margem de segurança.",
      round:
        "Mais arredondado e menor que o central. Convexidade MD e VL. Distal recebe mais desgaste/arredondamento.",
      detail:
        "Ângulo mésio-incisal mais definido; disto-incisal bem arredondado e menor. Sulcos vestibulares discretos.",
      lingual: "Fossa menor; cíngulo proporcionalmente marcado. Preserve cristas marginais.",
    };
  }
  if (kind === "incisor" && pos === 2) {
    return {
      crown:
        "Incisivo lateral inferior: um pouco mais largo que o central inferior na borda. Distal levemente mais baixa/arredondada.",
      rough:
        "Comece pela mesial se preferir (como nas aulas). Esboço com margem — depois ajusta proporção.",
      round:
        "Convexo no cérvico-incisal e no MD. Diferença para o central: borda um pouco mais larga.",
      detail: "Detalhes inferiores são sutis — não force mamelões profundos.",
      lingual: "Fossa e cíngulo discretos; cristas marginais leves.",
    };
  }
  if (kind === "canine" && jaw === "upper") {
    return {
      crown:
        "Canino superior: cúspide única; contorno vestibular em pentágono (“casinha”). Distal mais curta e inclinada que a mesial.",
      rough:
        "É muito convexo na vestibular — no corte grosseiro, NÃO tire demais no terço médio (pode perder a “lança”). Margem de segurança maior no centro.",
      round:
        "Desgaste bem mais na distal do que na mesial. A ponta da cúspide precisa ficar evidente; mesial fica mais comprida que a distal.",
      detail:
        "Braços mesial e distal da cúspide. Ponta ligeiramente distal. Crista lingual intermediária + duas fossas rasas.",
      lingual:
        "Cristas marginais + crista intermediária no meio (não é igual ao central). Preserve a elevação central que forma a ponta.",
    };
  }
  if (kind === "canine") {
    return {
      crown:
        "Canino inferior: cúspide única mais estreita e alongada; também em pentágono. Eixo ligeiramente inclinado.",
      rough:
        "Corte proximal e depois vestibular/lingual. Deixe margem — a ponta da cúspide ainda vai ser refinada.",
      round:
        "Defina bem a ponta. Desgaste bem mais na distal. Convexidade cérvico-incisal e MD.",
      detail: "Cúspide mais aguda que no superior. Distal mais convexa. Cristas linguais discretas.",
      lingual: "Cristas marginais existem, mas são menos marcadas que no superior — não aprofunde fossas.",
    };
  }
  if (kind === "premolar" && jaw === "upper" && pos === 4) {
    return {
      crown:
        "1º pré-molar superior: duas cúspides (V maior que L); oclusal em hexágono irregular. Convergência para lingual.",
      rough:
        "Comece pelas proximais (mesial). Reduza VL respeitando que lingual é mais estreito. Margem de segurança.",
      round:
        "Arredonde arestas. Cúspide vestibular mais alta — não iguale as duas ainda.",
      detail: "Ajuste altura V > L. Cristas marginais. Ainda sem sulco profundo.",
      lingual: "Cúspide lingual menor; convergência para lingual em vista oclusal.",
      occlusal:
        "Sulco central mésio-distal; fossas mesial e distal; sulcos suplementares leves. Preserve cristas marginais e pontas de cúspide. Sulcos rasos e limpos com a ponta do Lecron.",
    };
  }
  if (kind === "premolar" && jaw === "upper") {
    return {
      crown:
        "2º pré-molar superior: cúspides V e L mais simétricas; oclusal mais oval/redonda que o 14/24.",
      rough: "Proximais primeiro; convergência VL mais suave que no primeiro pré-molar.",
      round: "Volumes das cúspides parecidos. Arredonde sem criar quinas.",
      detail: "Sulco central ainda não — só proporção e contorno das cúspides.",
      lingual: "Cúspide lingual proporcional à vestibular.",
      occlusal:
        "Sulco central curto; fossas mesial e distal; padrão mais simétrico. Não aprofunde demais.",
    };
  }
  if (kind === "premolar" && pos === 4) {
    return {
      crown:
        "1º pré-molar inferior: cúspide vestibular dominante; lingual pequena. Oclusal inclinada para lingual.",
      rough: "Não iguale a cúspide lingual à vestibular no corte grosseiro. Margem de segurança.",
      round: "Mantenha V bem maior. Arredonde convergências.",
      detail: "Cúspide V dominante; lingual baixa. Prepare oclusal sem sulco fundo ainda.",
      lingual: "Cúspide lingual baixa — típico deste dente.",
      occlusal:
        "Sulco mesiolingual característico; fossas; cristas triangulares. Preserve a cúspide V. Sulcos rasos com Lecron.",
    };
  }
  if (kind === "premolar") {
    return {
      crown:
        "2º pré-molar inferior: cúspides mais equilibradas (pode ter 2 ou 3 cúspides). Oclusal mais circular.",
      rough: "Proximais e contorno oclusal com margem. Lingual(is) mais desenvolvidas que no 34/44.",
      round: "Equilibre cúspides sem quinas. Forma mais circular em vista oclusal.",
      detail: "Prepare cúspides; sulcos vêm na etapa oclusal.",
      lingual: "Cúspide(s) lingual(is) mais altas que no primeiro pré-molar inferior.",
      occlusal:
        "Sulco central em Y ou H conforme o tipo; fossas; cristas marginais. Sulcos limpos e rasos.",
    };
  }
  if (kind === "molar" && jaw === "upper" && pos === 6) {
    return {
      crown:
        "1º molar superior: quatro cúspides (MV, ML, DV, DL) + possível Carabelli; crista oblíqua DV–ML.",
      rough:
        "Reduza distal e vestibular primeiro; esboce o contorno. Preserve volume para a crista oblíqua.",
      round: "Arredonde cúspides e faces. Ainda sem sulcos profundos.",
      detail: "Altura relativa das cúspides; crista oblíqua esboçada. Carabelli só se indicar.",
      lingual: "Cúspides linguais; Carabelli na mesiolingual (opcional didático).",
      occlusal:
        "Sulco central, sulcos vestibulares e linguais, fossa central e fossas M/D. Preserve a crista oblíqua. Sulcos limpos e rasos — ponta do Lecron em camadas finas, como nas videoaulas de oclusal.",
    };
  }
  if (kind === "molar" && jaw === "upper") {
    return {
      crown:
        "2º molar superior: quatro cúspides (DL frequentemente menor); oclusal mais losangular/compacta.",
      rough: "Mesma lógica do 16/26, em escala menor. Margem de segurança.",
      round: "Cúspide DL reduzida com frequência — não force volume onde não há.",
      detail: "Proporção compacta; prepare oclusal sem aprofundar sulcos ainda.",
      lingual: "Cúspides linguais menores que no primeiro molar.",
      occlusal:
        "Sulcos e fossas do padrão molar superior, menores. Não aprofunde demais a fossa central.",
    };
  }
  if (kind === "molar" && pos === 6) {
    return {
      crown:
        "1º molar inferior: cinco cúspides (3 V + 2 L); sulco vestibular em Y na oclusal.",
      rough:
        "Convergência acentuada para lingual. Reduza excesso distal/vestibular com margem.",
      round: "Cinco volumes de cúspide esboçados; sem sulco fundo ainda.",
      detail: "Defina as cinco cúspides. O padrão em Y vem na etapa de sulcos.",
      lingual: "Duas cúspides linguais volumosas.",
      occlusal:
        "Sulco longitudinal + sulcos vestibulares e linguais formando Y; fossas. Cinco cúspides bem definidas. Sulcos rasos e regulares com Lecron — marque o traçado antes de aprofundar.",
    };
  }
  return {
    crown:
      "2º molar inferior: quatro cúspides; oclusal mais retangular/simétrica que o 36/46.",
    rough: "Convergência para lingual; esboço grosseiro com margem.",
    round: "Quatro cúspides; forma mais cruzada/retangular.",
    detail: "Proporção das quatro cúspides antes dos sulcos.",
    lingual: "Duas cúspides linguais.",
    occlusal:
      "Sulcos em cruz (+) ou padrão similar; fossas centrais. Sulcos limpos, sem excesso de profundidade.",
  };
}

/** Roteiro condensado — técnica regressiva, tom de videoaula. */
export function condensedSculptureScript(
  toothNumber: number,
  kind: ToothKind,
  jaw: Jaw,
  name: string,
  measures?: CondensedMeasures,
): CondensedStep[] {
  const altura = measures?.altura ?? "—";
  const md = measures?.md ?? "—";
  const vl = measures?.vl ?? "—";
  const notes = anatomyNotes(kind, jaw, toothNumber);
  const hasOcclusal = kind === "premolar" || kind === "molar";
  const topName = kind === "incisor" || kind === "canine" ? "incisal" : "oclusal";

  const steps: CondensedStep[] = [
    {
      id: 1,
      title: "Preparar o bloco e orientar as faces",
      animPhase: "faces",
      instructions: [
        `Agora vamos esculpir o ${name} (FDI ${toothNumber}) pela técnica regressiva — a partir do bloco de cera. Materiais nesta página: bloco de cera e Lecron.`,
        `Olhe a tabela oferecida acima: altura da coroa ${altura}, mesiodistal ${md} e vestíbulo-lingual ${vl}. Marque esses valores no bloquinho com o Lecron — a tabela guia toda a escultura.`,
        "Com a ponta do Lecron, marque a altura nas quatro faces. Cada face do bloquinho é uma face do dente: vestibular (V), lingual (L), mesial (M) e distal (D). As linhas precisam se encontrar (como um “anel”).",
        `Determine primeiro a vestibular (para frente). A oposta é a lingual. ${neighborHint(toothNumber, kind)} Mesial e distal NÃO são iguais — defina isso agora, senão a anatomia fica invertida.`,
        notes.crown,
      ],
      alert: `Cera + Lecron. Tabela: ${altura} · MD ${md} · VL ${vl}. Confira V / L / M / D na imagem antes de remover volume.`,
    },
    {
      id: 2,
      title: "Desenhar as proximais e fazer a redução grosseira",
      animPhase: "rough-cut",
      instructions: [
        "É interessante começar pelas proximais. Nesta etapa o foco é a face MESIAL (M) — veja o selo na imagem. Depois repita o raciocínio na DISTAL (D).",
        "Com o Lecron, desenhe o perfil proximal (o “acidente”): inclinações e volumes principais. O desenho é só esboço e deve deixar margem de segurança (faixa verde).",
        "Retire a cera vermelha (fora da margem) em camadas limpas — sem lascar. O terço oclusal/incisal sai mais fácil; o cuidado maior é no cervical: nunca retire fundo de uma vez perto do colo.",
        "O que tirar na mesial precisa refletir na distal, respeitando a anatomia deste dente (distal costuma ser mais convexa, arredondada ou mais inclinada).",
        "Nas faces vestibular e lingual, marque a convergência para cervical. Forçar demais no colo fratura a cera.",
        notes.rough,
      ],
      alert: "FACE EM TRABALHO: MESIAL (depois DISTAL). Margem verde. Cervical = zona de risco.",
    },
    {
      id: 3,
      title: "Arredondar a macroforma com o Lecron",
      animPhase: "round",
      instructions: [
        "Agora sai o corte grande e entra o arredondamento: dente não tem quina quadrada. Arredonde arestas e ângulos com o Lecron — a margem ainda pode estar generosa.",
        "É nesta fase que entra o que você viu na aula de anatomia: convergências, convexidades e o eixo do dente.",
        notes.round,
        `Na distal, em geral há um pouco mais de desgaste do que na mesial — confira no ${toothNumber}.`,
        "Delimite a linha cervical contínua e redonda. Tire as aparas para enxergar o colo. Chegue a uma “carinha” de dente — ainda sem detalhes finos.",
      ],
    },
    {
      id: 4,
      title: hasOcclusal
        ? "Anatomia proximal, lingual e preparação oclusal"
        : "Anatomia proximal e fossa lingual",
      animPhase: "lingual",
      instructions: [
        "Trabalhe a proximal mesial: deixe côncava no cervical e convexa em direção ao terço oclusal/incisal — isso ajuda o contorno e o contato.",
        `Se estiver largo no sentido VL em relação à tabela (${vl}), retire cera com cuidado até a proporção melhorar.`,
        notes.lingual,
        hasOcclusal
          ? `Na face ${topName}, esboce só o contorno das cúspides. Ainda NÃO aprofunde sulcos — isso tem etapa própria, como nas videoaulas de oclusal.`
          : "Marque as cristas marginais e escave a fossa no centro em camadas finas. Preserve as cristas — a fossa é o vermelho didático do meio.",
        `Ao fim, a peça já deve lembrar o ${name}, ainda sem os detalhes finais.`,
      ],
      alert: hasOcclusal
        ? "Cúspides esboçadas; sulcos oclusais vêm na próxima etapa específica."
        : "Cristas se preservam; fossa se escava no centro.",
    },
    {
      id: 5,
      title: hasOcclusal
        ? "Proporção, cúspides e detalhes macro"
        : "Borda incisal, proporção e detalhes vestibulares",
      animPhase: "detail",
      instructions: [
        notes.detail,
        `Confira proporção com a tabela (altura ${altura}, MD ${md}). Se estiver largo demais, tire dos lados; se ficar “quadrado”, arredonde — dente não tem ângulo reto.`,
        hasOcclusal
          ? "Ajuste altura relativa das cúspides e convergências. Mantenha a cera regular e limpa para enxergar anatomia."
          : "Refine ângulos mesial/distal da borda e detalhes vestibulares discretos (nunca exagerados).",
        "Se perder o colo ou o contorno lingual nos ajustes, redesenhe com o Lecron — com cuidado, porque já sobra menos cera.",
      ],
    },
  ];

  if (hasOcclusal && notes.occlusal) {
    steps.push({
      id: 6,
      title: "Sulcos e fossas na oclusal",
      animPhase: "occlusal",
      instructions: [
        `FACE EM TRABALHO: OCLUSAL — agora vem o desenho dos sulcos do ${name}, no mesmo espírito das videoaulas: primeiro o traçado, depois o aprofundamento.`,
        "Com a ponta do Lecron, marque os sulcos principais em linhas leves (só risco, sem cortar fundo).",
        notes.occlusal,
        "Aprofunde em camadas finas e regulares. Sulco limpo, sem farpas — cúspides e cristas ficam lisas.",
        "Verde didático = preservar (cristas marginais e pontas de cúspide). Vermelho = fundo do sulco/fossa.",
        "Confira em vista oclusal se o padrão está coerente com este dente — sem exagerar a profundidade.",
      ],
      alert: "Sulcos rasos e limpos. Preserve cúspides e cristas. Só Lecron.",
    });
    steps.push({
      id: 7,
      title: "Refino, alisamento com Lecron e revisão final",
      animPhase: "polish",
      instructions: [
        "Limpe as aparas — sem enxergar bem, a anatomia “some”. Revise todas as faces.",
        "Com passes leves do Lecron, alise até a cera ficar uniforme e acetinada. Quebre quinas restantes.",
        "Confira tabela, colo, oclusal (sulcos) e simetria mesial/distal.",
        `Resultado esperado: ${name} (FDI ${toothNumber}) didático pronto. Materiais: cera + Lecron.`,
      ],
    });
  } else {
    steps.push({
      id: 6,
      title: "Refino, alisamento com Lecron e revisão final",
      animPhase: "polish",
      instructions: [
        "A lingual pode ter ficado bagunçada depois dos ajustes — redesenhe com cuidado (pouca cera sobrando).",
        "Passes leves do Lecron: alise, quebre ângulos, deixe a superfície mais acetinada.",
        "Revise faces, ângulos, proporção (tabela), colo e detalhes. Só refiles mínimos onde ainda houver quina.",
        `Resultado esperado: ${name} (FDI ${toothNumber}) didático pronto. Materiais: cera + Lecron.`,
      ],
    });
  }

  return steps;
}

export function phaseCountFor(kind: ToothKind): number {
  return kind === "premolar" || kind === "molar" ? 7 : 6;
}

/** FDI “modelo” de imagem (direita) para reutilizar arte no contralateral. */
export function imageSourceFdi(toothNumber: number): number {
  const map: Record<number, number> = {
    21: 11,
    22: 12,
    23: 13,
    24: 14,
    25: 15,
    26: 16,
    27: 17,
    31: 41,
    32: 42,
    33: 43,
    34: 44,
    35: 45,
    36: 46,
    37: 47,
  };
  return map[toothNumber] ?? toothNumber;
}
