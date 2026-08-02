import type { DentalSculptureLesson, SculptureStepDef } from "../../types/sculpture";
import { CENTRAL_UPPER_ANATOMY, SCULPTURE_TOOLS } from "../toolDefinitions";
import { toolActionsForStep } from "../tool-actions-central-upper";
import { STEP_META } from "../stepMeta";

const s = (
  order: number,
  partial: Omit<
    SculptureStepDef,
    | "id"
    | "order"
    | "toolActions"
    | "practice"
    | "stepNarration"
    | "category"
    | "visualMode"
    | "why"
    | "narrationCues"
    | "practiceOutcomes"
    | "protectedRegionIds"
  >,
): SculptureStepDef => {
  const actions = toolActionsForStep(order);
  const meta = STEP_META[order];
  return {
    id: `s${String(order).padStart(2, "0")}`,
    order,
    ...partial,
    stepNarration: partial.narration
      ? { text: partial.narration }
      : undefined,
    toolActions: actions.length ? actions : undefined,
    practice: actions.length
      ? { enabled: true, guideDefault: "partial", idealPathId: actions[0]?.id, tolerance: 0.18 }
      : undefined,
    category: meta?.category,
    visualMode: meta?.visualMode,
    why: meta?.why,
    narrationCues: meta?.narrationCues,
    practiceOutcomes: meta?.practiceOutcomes,
    protectedRegionIds: meta?.protectedRegionIds,
  };
};

const steps: SculptureStepDef[] = [
  s(1, {
    title: "Planejamento das dimensões",
    objective: "Determinar a altura da coroa e os limites gerais da escultura.",
    activeTool: "ruler",
    animPhase: "thirds",
    endBlend: 0.08,
    cameraFace: "V",
    instructions: [
      "Posicione o bloco verticalmente.",
      "Com a régua, determine a altura desejada da coroa.",
      "Faça uma marca de referência e transfira para as quatro faces.",
      "Una as marcas em uma linha contínua no perímetro.",
      "Confirme que a linha está na mesma altura em todas as faces.",
    ],
    anatomyNotes: ["A linha delimita a área ativa da escultura versus a base de apoio."],
    warnings: [
      "Marcações desalinhadas podem deixar uma face maior que a outra e comprometer a simetria.",
    ],
    commonErrors: ["Linha só em uma ou duas faces."],
    expectedResult: "Bloco com a altura da futura coroa delimitada em todas as faces.",
    narration:
      "Vamos delimitar a altura da coroa. A régua marca a referência e o traçado deve fechar o perímetro na mesma altura.",
    labels: ["altura", "perímetro"],
  }),
  s(2, {
    title: "Identificação e marcação das faces",
    objective: "Evitar que você se perca durante os desgastes.",
    activeTool: "scalpel",
    animPhase: "faces",
    endBlend: 0.1,
    cameraFace: "perspective",
    instructions: [
      "Defina a face vestibular e marque V.",
      "A face oposta é a lingual — marque P.",
      "Identifique mesial (M) e distal (D).",
      "No dente 11: mesial para a linha média; distal para o lateral.",
    ],
    anatomyNotes: [
      "Mesial e distal não são iguais: mesial mais reta, DI mais arredondado.",
      "Ângulo mesioincisal mais próximo de 90°; distoincisal mais suave.",
    ],
    warnings: [],
    commonErrors: ["Inverter mesial e distal no decorrer da escultura."],
    expectedResult: "Bloco com faces V, L, M e D identificadas de forma consistente.",
    labels: ["V", "P", "M", "D"],
  }),
  s(3, {
    title: "Desenho inicial do contorno proximal",
    objective: "Planejar o perfil do dente antes de retirar a cera.",
    activeTool: "scalpel",
    animPhase: "proximal-draw",
    endBlend: 0.18,
    cameraFace: "M",
    instructions: [
      "Selecione a face proximal mesial.",
      "Desenhe o perfil: incisal, convexidade V, cervical, perfil P e cíngulo.",
      "Repita na distal com transferência paralela.",
      "Deixe margem de segurança — não corte na linha definitiva ainda.",
    ],
    anatomyNotes: ["O desenho é limite de segurança para os cortes iniciais."],
    warnings: [],
    commonErrors: ["Desenhar só de um lado."],
    expectedResult: "Perfis proximais guiando a futura coroa, com margem de segurança.",
    protectHint: "Interior do contorno",
    removalHint: "Exterior (ainda não cortar na linha)",
  }),
  s(4, {
    title: "Primeiro desgaste grosseiro",
    objective: "Retirar os maiores excessos e formar o volume inicial da coroa.",
    activeTool: "scalpel",
    animPhase: "rough-cut",
    endBlend: 0.32,
    cameraFace: "M",
    instructions: [
      "Posicione o estilete fora da linha de segurança.",
      "Faça cortes pequenos e progressivos — nunca um único corte grande.",
      "Preserve margem ao redor da forma planejada.",
      "Atenção especial ao terço cervical.",
    ],
    anatomyNotes: [],
    warnings: ["Não faça força excessiva e não direcione a lâmina para os dedos."],
    commonErrors: ["Cortar exatamente sobre a linha definitiva e retirar cera demais."],
    expectedResult: "Esboço grosseiro da forma proximal da coroa.",
    removalHint: "Grandes excessos externos",
    protectHint: "Núcleo + margem de segurança",
  }),
  s(5, {
    title: "Controle da simetria proximal",
    objective: "Garantir desgaste proporcional entre mesial e distal.",
    activeTool: "scalpel",
    animPhase: "rough-cut",
    endBlend: 0.36,
    cameraFace: "I",
    instructions: [
      "Veja pela face incisal e compare os dois lados.",
      "Corrija diferenças excessivas de largura ou altura de corte.",
      "Preserve a diferença anatômica natural (distal um pouco mais curva).",
    ],
    anatomyNotes: [
      "Simetria não significa mesial = distal. Distal pode ser ligeiramente mais arredondada.",
    ],
    warnings: [],
    commonErrors: ["Forçar os dois lados idênticos e apagar a assimetria natural."],
    expectedResult: "Metades equilibradas, com assimetria anatômica sutil.",
  }),
  s(6, {
    title: "Convergência das faces para cervical",
    objective: "Criar o estreitamento cervical característico da coroa.",
    activeTool: "scalpel",
    animPhase: "second-cut",
    endBlend: 0.44,
    cameraFace: "V",
    instructions: [
      "Pela vestibular, marque contornos mesial e distal convergindo para o colo.",
      "Remova pequenos excessos laterais.",
      "Evite estreitar demais o terço cervical.",
      "Trabalhe alternando os dois lados.",
    ],
    anatomyNotes: [],
    warnings: ["A região cervical é mais fina e pode fraturar com força excessiva."],
    commonErrors: ["Estreitar o colo demais."],
    expectedResult: "Trapézio/convergência cervical visível na V.",
    removalHint: "Laterais excessivas",
    protectHint: "Terço cervical (cuidado)",
  }),
  s(7, {
    title: "Volume lingual e cíngulo (reserva)",
    objective: "Evitar face lingual reta e reservar volume para o cíngulo.",
    activeTool: "scalpel",
    animPhase: "lingual",
    endBlend: 0.5,
    cameraFace: "P",
    instructions: [
      "Gire para a lingual e identifique a região cervical.",
      "Preserve cera para o cíngulo.",
      "Retire excessos acima/ao redor criando transição curva.",
      "Não deixe a lingual plana.",
    ],
    anatomyNotes: [
      "A lingual tem cíngulo, concavidade, cristas marginais e transição para a incisal.",
    ],
    warnings: [],
    commonErrors: ["Desgastar toda a lingual em linha reta, eliminando o cíngulo."],
    expectedResult: "Volume cervical lingual preservado; face sem aspecto reto.",
    protectHint: "Cíngulo",
    removalHint: "Excesso plano lingual",
  }),
  s(8, {
    title: "Troca do estilete pelo Lecron",
    objective: "Passar dos cortes grosseiros para desgaste controlado.",
    activeTool: "lecron",
    animPhase: "round",
    endBlend: 0.52,
    cameraFace: "perspective",
    instructions: [
      "Guarde o estilete e selecione o Lecron.",
      "Observe as extremidades (afiada vs. de fábrica).",
      "Inicie movimentos curtos e controlados.",
      "Comece a remover a margem de segurança e a arredondar.",
    ],
    anatomyNotes: [],
    warnings: [],
    commonErrors: ["Continuar com cortes profundos de estilete nos detalhes."],
    expectedResult: "Instrumento correto em uso; margem de segurança em redução.",
  }),
  s(9, {
    title: "Arredondamento geral das bordas",
    objective: "Eliminar o aspecto retangular do bloco.",
    activeTool: "lecron",
    animPhase: "round",
    endBlend: 0.6,
    cameraFace: "perspective",
    instructions: [
      "Arredonde bordas mesial e distal.",
      "Suavize transições vestibuloproximais e palatoproximais.",
      "Verifique por vários ângulos.",
      "Mantenha volume para detalhes posteriores.",
    ],
    anatomyNotes: ["Transições entre faces devem ser contínuas — sem quinas artificiais."],
    warnings: [],
    commonErrors: ["Arredondar demais e perder volume anatômico."],
    expectedResult: "Coroa sem aspecto de caixa; quinas reduzidas.",
    removalHint: "Quinas artificiais",
  }),
  s(10, {
    title: "Posicionamento da bossa vestibular",
    objective: "Criar a convexidade vestibular com proeminência cervical correta.",
    activeTool: "lecron",
    animPhase: "vestibular",
    endBlend: 0.66,
    cameraFace: "M",
    instructions: [
      "Observe a V de perfil.",
      "Desgaste o excesso do terço médio.",
      "Mantenha maior convexidade no cervical.",
      "Afine gradualmente em direção ao incisal.",
    ],
    anatomyNotes: ["A face vestibular não deve ficar plana."],
    warnings: [],
    commonErrors: ["Deixar a vestibular plana ou inverter a bossa."],
    expectedResult: "Perfil V com bossa cervical e transição suave.",
  }),
  s(11, {
    title: "Linha cervical vestibular",
    objective: "Definir o limite cervical da coroa sem sulco profundo.",
    activeTool: "lecron",
    animPhase: "cervix",
    endBlend: 0.7,
    cameraFace: "V",
    instructions: [
      "Marque suavemente a linha cervical na V.",
      "Continue pelas proximais e una o perímetro.",
      "Arredonde sem criar degrau.",
      "Remova excessos externos ao limite.",
    ],
    anatomyNotes: [],
    warnings: [],
    commonErrors: ["Criar linha profunda com aspecto de corte ou degrau."],
    expectedResult: "Colo sinuoso contínuo e rasa definição.",
    narration:
      "O Lecron contorna suavemente o dente. O objetivo não é um corte profundo, e sim o limite da coroa.",
  }),
  s(12, {
    title: "Limpeza dos resíduos",
    objective: "Melhorar a visualização da anatomia.",
    activeTool: "brush",
    animPhase: "detail",
    endBlend: 0.7,
    cameraFace: "perspective",
    instructions: [
      "Passe a escova suavemente.",
      "Retire partículas soltas.",
      "Gire o modelo e reavalie proporções.",
    ],
    anatomyNotes: ["A escova não modifica anatomia — só limpa."],
    warnings: [],
    commonErrors: ["Usar a escova como instrumento de desgaste."],
    expectedResult: "Superfície limpa para inspeção.",
  }),
  s(13, {
    title: "Modelagem da face mesial",
    objective: "Contorno proximal com transição cervical–médio–incisal correta.",
    activeTool: "lecron",
    animPhase: "detail",
    endBlend: 0.74,
    cameraFace: "M",
    instructions: [
      "Câmera na mesial.",
      "Discreta concavidade cervical; convexidade no restante.",
      "Transição suave para a incisal.",
      "Confira perfis V e P.",
    ],
    anatomyNotes: ["A proximal não é totalmente reta."],
    warnings: [],
    commonErrors: ["Face mesial plana demais."],
    expectedResult: "Perfil mesial com curvaturas corretas.",
  }),
  s(14, {
    title: "Ajuste da espessura vestíbulo-lingual",
    objective: "Evitar dente excessivamente grosso.",
    activeTool: "lecron",
    animPhase: "detail",
    endBlend: 0.78,
    cameraFace: "I",
    instructions: [
      "Vista incisal: compare espessura VL com altura.",
      "Desgaste pouco nas áreas espessas.",
      "Alterne faces para não deformar o eixo.",
      "Preserve cíngulo e cristas.",
    ],
    anatomyNotes: ["Medidas nesta versão são proporcionais."],
    warnings: [],
    commonErrors: ["Remover demais e apagar o cíngulo."],
    expectedResult: "Espessura VL equilibrada.",
    protectHint: "Cíngulo e cristas",
  }),
  s(15, {
    title: "Construção da concavidade lingual",
    objective: "Criar o espaço côncavo da face lingual.",
    activeTool: "lecron",
    animPhase: "cingulum",
    endBlend: 0.84,
    cameraFace: "P",
    instructions: [
      "Centro da P em destaque para remoção.",
      "Preserve cíngulo e futuras cristas (verde).",
      "Camadas pequenas; aprofunde gradualmente.",
      "Suavize a transição para a borda incisal.",
    ],
    anatomyNotes: [],
    warnings: [],
    commonErrors: ["Desgastar toda a face por igual e apagar as cristas."],
    expectedResult: "Fossa rasa, ampla, delimitada.",
    removalHint: "Centro da fossa",
    protectHint: "Cíngulo + cristas",
  }),
  s(16, {
    title: "Formação das cristas marginais",
    objective: "Definir as bordas laterais da concavidade lingual.",
    activeTool: "lecron",
    animPhase: "cingulum",
    endBlend: 0.86,
    cameraFace: "P",
    instructions: [
      "Identifique trajetos das cristas mesial e distal.",
      "Desgaste o centro sem removê-las.",
      "Arredonde levemente; evite pontas altas.",
      "Faça-as convergirem ao cíngulo.",
    ],
    anatomyNotes: [],
    warnings: [],
    commonErrors: ["Cristas pontiagudas ou apagadas."],
    expectedResult: "Cristas contínuas integradas ao cíngulo.",
    labels: ["crista M", "crista D", "fossa", "cíngulo"],
  }),
  s(17, {
    title: "Definição do cíngulo",
    objective: "Dar forma anatômica ao volume cervical lingual.",
    activeTool: "lecron",
    animPhase: "cingulum",
    endBlend: 0.88,
    cameraFace: "P",
    instructions: [
      "Preserve volume cervical e arredonde.",
      "Integre às cristas e à fossa.",
      "Verifique em P e proximal.",
    ],
    anatomyNotes: ["Não deve parecer uma esfera colada."],
    warnings: [],
    commonErrors: ["Cíngulo esférico ou inexistente."],
    expectedResult: "Cíngulo perceptível, arredondado e integrado.",
  }),
  s(18, {
    title: "Diferenciação mesial × distal",
    objective: "Assimetria anatômica natural do central superior.",
    activeTool: "lecron",
    animPhase: "detail",
    endBlend: 0.9,
    cameraFace: "V",
    instructions: [
      "Defina o ângulo mesioincisal (~90°, sem ponta artificial).",
      "Arredonde mais o distoincisal.",
      "Compare os dois lados e corrija só o excesso.",
    ],
    anatomyNotes: [
      "Mesial: mais reta, MI definido, maior comprimento aparente.",
      "Distal: mais convexa, DI arredondado, aspecto ligeiramente menor.",
    ],
    warnings: [],
    commonErrors: ["Deixar os dois ângulos iguais."],
    expectedResult: "Assimetria MI/DI correta.",
  }),
  s(19, {
    title: "Correção das proporções gerais",
    objective: "Evitar dente largo, comprido ou quadrado demais.",
    activeTool: "lecron",
    animPhase: "detail",
    endBlend: 0.92,
    cameraFace: "V",
    instructions: [
      "Compare altura e largura na V.",
      "Ajuste proximais, arredonde se ficar quadrado, refine a incisal se preciso.",
      "Após correção maior, revise: colo, bossa, proximais, VL e lingual.",
    ],
    anatomyNotes: [],
    warnings: ["Correções grandes exigem revisão de toda a anatomia."],
    commonErrors: ["Ajustar só uma medida e esquecer o restante."],
    expectedResult: "Proporções equilibradas.",
  }),
  s(20, {
    title: "Sulcos e depressões vestibulares",
    objective: "Detalhes anatômicos da face vestibular.",
    activeTool: "lecron",
    animPhase: "detail",
    endBlend: 0.94,
    cameraFace: "V",
    instructions: [
      "Identifique três lóbulos e duas depressões discretas.",
      "Pressão leve; desgastes rasos.",
      "Suavize limites — sem riscos profundos.",
      "Avalie com luz lateral.",
    ],
    anatomyNotes: [],
    warnings: [],
    commonErrors: ["Sulcos profundos ou linhas artificiais."],
    expectedResult: "Variações suaves de luz e sombra na V.",
  }),
  s(21, {
    title: "Recuperação da linha cervical",
    objective: "Refazer limites perdidos em correções de proporção.",
    activeTool: "lecron",
    animPhase: "cervix",
    endBlend: 0.95,
    cameraFace: "V",
    instructions: [
      "Redesenhe a cervical na V e proximais.",
      "Redefina o limite lingual e integre ao cíngulo.",
      "Recupere concavidade cervical proximal se sumiu.",
    ],
    anatomyNotes: ["Com menos cera disponível, reconstrua com cuidado."],
    warnings: [],
    commonErrors: ["Ignorar a cervical após alargar/estreitar a coroa."],
    expectedResult: "Colo contínuo restaurado.",
  }),
  s(22, {
    title: "Refinamento da anatomia lingual",
    objective: "Corrigir a lingual após ajustes gerais.",
    activeTool: "lecron",
    animPhase: "cingulum",
    endBlend: 0.96,
    cameraFace: "P",
    instructions: [
      "Confira cíngulo e duas cristas.",
      "Corrija alturas relativas com remoções mínimas.",
      "Arredonde mais a transição distal.",
      "Revise em visão oblíqua.",
    ],
    anatomyNotes: [],
    warnings: ["Nesta fase há pouca margem — movimentos pequenos."],
    commonErrors: ["Remover demais e perder o cíngulo."],
    expectedResult: "Lingual harmônica e completa.",
  }),
  s(23, {
    title: "Eliminação das últimas quinas",
    objective: "Remover ângulos artificiais restantes.",
    activeTool: "lecron",
    animPhase: "round",
    endBlend: 0.97,
    cameraFace: "perspective",
    instructions: [
      "Gire lentamente e observe mudanças de luz.",
      "Arredonde linhas abruptas sem apagar detalhes.",
      "Confira V, L, M, D e I.",
    ],
    anatomyNotes: [],
    warnings: [],
    commonErrors: ["Apagar sulcos ou cristas ao ‘alisar demais’."],
    expectedResult: "Superfície sem quinas artificiais.",
  }),
  s(24, {
    title: "Acabamento com meia fina",
    objective: "Alisar a superfície e suavizar irregularidades mínimas.",
    activeTool: "nylon",
    animPhase: "polish",
    endBlend: 1,
    cameraFace: "perspective",
    instructions: [
      "Passe a meia fina com movimentos leves em todas as faces.",
      "Evite pressão e tempo excessivo numa só região.",
      "Limpe e faça a inspeção final.",
    ],
    anatomyNotes: ["Acabamento não substitui escultura correta."],
    warnings: [],
    commonErrors: [
      "Friccionar demais e apagar colo, sulcos, cristas, fossa ou cíngulo.",
    ],
    expectedResult: "Dente acetinado, detalhes preservados, pronto para inspeção.",
  }),
];

export const lessonIncisorCentralUpper: DentalSculptureLesson = {
  toothId: "incisor-central-upper",
  toothName: "Incisivo central superior",
  notation: "FDI 11 (direito) · espelhar para 21",
  fdi: 11,
  tools: SCULPTURE_TOOLS,
  anatomyStructures: CENTRAL_UPPER_ANATOMY,
  steps,
  quizPrompts: [
    { prompt: "Selecione a face vestibular.", answer: "V" },
    { prompt: "Selecione a face oposta à vestibular.", answer: "P" },
    { prompt: "Selecione a face mesial.", answer: "M" },
    { prompt: "Selecione a face distal.", answer: "D" },
  ],
  inspection: [
    {
      view: "V",
      title: "Vista vestibular",
      checks: [
        "Formato geral da coroa",
        "Convexidade e bossa",
        "Linha cervical",
        "Contornos M e D",
        "Ângulos MI e DI",
        "Sulcos de desenvolvimento",
        "Proporção altura × largura",
      ],
    },
    {
      view: "P",
      title: "Vista lingual",
      checks: [
        "Cíngulo",
        "Concavidade lingual",
        "Cristas marginais M e D",
        "Transição com a borda incisal",
        "Linha cervical lingual",
      ],
    },
    {
      view: "M",
      title: "Vista mesial",
      checks: [
        "Perfil vestibular convexo",
        "Perfil lingual",
        "Concavidade cervical",
        "Espessura da coroa",
        "Posição da borda incisal",
      ],
    },
    {
      view: "D",
      title: "Vista distal",
      checks: [
        "Maior arredondamento",
        "Perfil proximal",
        "Transição para a borda incisal",
        "Espessura VL",
      ],
    },
    {
      view: "I",
      title: "Vista incisal",
      checks: [
        "Equilíbrio entre os lados",
        "Espessura VL",
        "Relação V × P",
        "Ausência de excessos laterais",
        "Forma das cristas",
      ],
    },
  ],
};

export function getSculptureLesson(fdi: number): DentalSculptureLesson | null {
  const n = fdi % 10;
  const decade = Math.floor(fdi / 10);
  // 11/21 → central upper
  if ((decade === 1 || decade === 2) && n === 1) {
    return {
      ...lessonIncisorCentralUpper,
      fdi,
      notation:
        fdi === 21
          ? "FDI 21 (esquerdo) · espelhar mesial/distal a partir do 11"
          : lessonIncisorCentralUpper.notation,
      toothName:
        fdi === 21
          ? "Incisivo central superior esquerdo"
          : "Incisivo central superior direito",
    };
  }
  return null;
}
