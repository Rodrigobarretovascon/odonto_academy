import type { SculptureStep } from "../types/tooth";

export type AnimPhase =
  | "instruments"
  | "measure"
  | "thirds"
  | "grid"
  | "faces"
  | "proximal-draw"
  | "rough-cut"
  | "second-cut"
  | "round"
  | "vestibular"
  | "lingual"
  | "cingulum"
  | "cervix"
  | "cusps"
  | "occlusal"
  | "root"
  | "detail"
  | "polish";

export interface ScriptStep extends SculptureStep {
  animPhase: AnimPhase;
}

type ToothKind = "incisor" | "canine" | "premolar" | "molar";
type Jaw = "upper" | "lower";

function step(
  id: number,
  title: string,
  animPhase: AnimPhase,
  instructions: string[],
  alert?: string,
): ScriptStep {
  return { id, title, animPhase, instructions, alert };
}

/** Técnica regressiva — Incisivo central superior (FDI 11 ou 21).
 * Materiais: apenas bloco de cera + Lecron.
 * Textos só do dente atual (sem citar o contralateral).
 */
export function upperCentralIncisorScript(
  toothNumber: number,
  measures?: { altura?: string; md?: string; vl?: string },
): ScriptStep[] {
  const fdi = toothNumber === 21 ? 21 : 11;
  const name =
    fdi === 11
      ? "incisivo central superior direito (FDI 11)"
      : "incisivo central superior esquerdo (FDI 21)";
  const altura = measures?.altura ?? "10,5 mm";
  const md = measures?.md ?? "8,5 mm";
  const vl = measures?.vl ?? "7,0 mm";
  const mesialHint =
    fdi === 11
      ? "No dente 11, a mesial fica voltada para a linha média; a distal fica para o lado do incisivo lateral."
      : "No dente 21, a mesial fica voltada para a linha média; a distal fica para o lado do incisivo lateral.";

  return [
    step(1, "Preparar o bloco e orientar as faces", "faces", [
      `Você vai esculpir o ${name}. Materiais: só bloco de cera e Lecron.`,
      `Use os valores da tabela oferecida acima: altura da coroa ${altura}, mesiodistal ${md} e vestíbulo-lingual ${vl}. Marque esses valores no bloquinho com o Lecron e esculture seguindo essa tabela.`,
      "Com a ponta do Lecron, marque a altura nas quatro faces do bloco. Cada face do bloquinho corresponde a uma face do dente: vestibular (V), lingual (L), mesial (M) e distal (D). Mantenha as linhas alinhadas.",
      `Determine primeiro a face vestibular (para frente). A oposta é a lingual. As laterais são mesial e distal. ${mesialHint} Mesial e distal NÃO são iguais — defina isso agora para a anatomia ficar correta.`,
    ], `Materiais: cera + Lecron. Use os valores da tabela acima (${altura} · MD ${md} · VL ${vl}). Confira V / L / M / D na imagem antes de remover volume.`),

    step(2, "Desenhar as proximais e fazer a redução grosseira", "rough-cut", [
      "Nesta etapa o trabalho começa na face MESIAL (M) — veja o selo “FACE EM TRABALHO: MESIAL” na imagem. Depois repita o mesmo raciocínio na face DISTAL (D).",
      "É interessante começar pelas proximais. Com o Lecron, desenhe o perfil na face mesial (o “acidente”): a inclinação e a região do cíngulo, partindo da vestibular. O desenho é só um esboço — ele guia a remoção de cera e deve deixar margem de segurança (faixa verde na imagem).",
      "Ainda com o Lecron, retire a cera vermelha (fora da margem), acompanhando o formato do desenho. Mantenha a cera regular — remova em camadas limpas, sem lascar. O terço incisal sai com mais facilidade; o cuidado maior começa no terço cervical — nunca retire fundo de uma vez perto do colo.",
      "O que você tirar na face mesial precisa refletir na face distal. A distal é menor e mais empinada: dá para tirar um pouco mais de cera nela, sem exagerar a diferença. Confira se as duas laterais estão coerentes antes de seguir.",
      "Desenhe também as bordas mesial e distal nas faces vestibular e lingual. As duas faces convergem para cervical: comece a reduzir a cera respeitando essa convergência. Forçar demais no colo fratura a cera — preserve volume nessa região frágil.",
      "Na lingual há formação do cíngulo. Há muito excesso de cera, mas não retire em linha reta: se ficar reto, a peça parece “poltrona”. O dente natural tem cíngulo — remova um pouco a mais onde precisa até a forma lembrar o dente. Ao fim desta etapa você já tem um esboço grosseiro.",
    ], "Face em foco: MESIAL (depois DISTAL). Margem de segurança (verde). Cervical = zona de risco. Só Lecron na cera."),

    step(3, "Arredondar a macroforma com o Lecron", "round", [
      "Agora o trabalho deixa de ser remoção grande e passa a ser arredondamento com o Lecron: dente não tem quina quadrada. Comece a arredondar bordas e o cíngulo — a margem de cera ainda pode estar generosa.",
      "Observe a bossa vestibular: ela ainda pode estar um pouco alta, no terço médio. A forma ainda é vaga — é nesta fase que entra o que você aprendeu na aula de anatomia. Desgaste a borda mesial arredondando e jogue a bossa um pouco mais para cervical.",
      `O dente é convexo, não plano. Para criar essa convexidade, faça desgastes controlados na vestibular com o Lecron. Na distal, faça um pouco mais de desgaste (mais passes) do que na mesial: assim a assimetria do ${fdi} fica correta.`,
      "Lembre da lingual: região côncava no médio-incisal e cíngulo convexo no cervical. Na vestibular, delimite a linha cervical bem redondinha com o Lecron. Remova as aparas de cera da superfície para enxergar bem o colo.",
      "Saia da estrutura macro das primeiras remoções até a peça ter “carinha” de dente — ainda sem detalhes finos. Depois disso é que se define a anatomia.",
    ]),

    step(4, "Anatomia proximal e fossa lingual", "lingual", [
      "Entre na mesial com o Lecron: deixe-a mais côncava e depois convexa em direção ao incisal. Isso ajuda a criar o efeito do cíngulo por trás. Prepare bem essa proximal.",
      "Se o dente estiver largo no sentido vestíbulo-lingual em relação à medida da tabela, retire um pouco mais de cera nessa espessura até a proporção melhorar.",
      "Na lingual, marque a crista marginal. Remova a região interna (fossa) em camadas finas com o Lecron. Arredonde as margens da fossa sem perder as cristas — preserve as cristas marginais.",
      `Ao fim desta etapa a peça já deve lembrar o ${name}, ainda sem todos os detalhes de borda e sulcos.`,
    ], "Cristas marginais se preservam; a fossa se escava no centro — só Lecron."),

    step(5, "Borda incisal, proporção e detalhes vestibulares", "detail", [
      "Com o Lecron, defina a anatomia da borda: a mesial é mais comprida, com ângulo mais próximo de 90°. A distal é menor e mais arredondada. Deixe esses dois ângulos claros.",
      `Olhe a proporção usando as medidas da página (altura ${altura}, MD ${md}): se estiver largo demais em relação à altura, tire um pouco de cera dos lados. Se depois ficar muito quadrado, ajuste no cervical — não deixe ângulo reto no dente. Arredonde tudo até a cara ficar mais natural.`,
      "Lembre das duas depressões (sulcos de desenvolvimento) e das mamelões. Desgaste de leve com o Lecron pensando nesses detalhes: o relevo deve ser discreto, nunca exagerado.",
      "Se o dente ficou comprido demais, acerte a altura conforme a tabela. Ao remover cera, você pode perder a cervical lingual e o cíngulo — redesenhe com cuidado. Na mesial proximal, recupere a concavidade cervical se ela sumiu.",
    ]),

    step(6, "Refino, alisamento com Lecron e revisão final", "polish", [
      "A face lingual pode ter ficado bagunçada depois dos ajustes — redesenhe com o Lecron com mais cuidado, porque já não há muita cera para tirar. Arredonde margens e ângulos; defina melhor a crista marginal. A mesial deve continuar maior que a distal; elimine ângulos retos.",
      "Com passes leves do Lecron, alise a superfície e quebre os ângulos restantes até a cera ficar mais uniforme e acetinada ao toque visual.",
      "Revise faces, ângulos, proporção (conforme as medidas da tabela), colo, fossa e detalhes. Faça só refiles mínimos de cera onde ainda houver quina ou assimetria.",
      `Resultado esperado: ${name} didático pronto. Materiais usados: cera + Lecron.`,
    ]),
  ];
}

/** Técnica regressiva — Incisivo central inferior (FDI 41/31). */
export function lowerCentralIncisorScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais e medidas reais × macromodelo (1,5×)", "measure", [
      "Instrumentos: bloco de cera, Lecron afiado, estilete, escova, meia fina e régua milimetrada.",
      "Medidas reais aproximadas do central inferior: altura de coroa ~8,5 mm, vestíbulo-lingual (VL) ~5,7 mm, mésio-distal (MD) ~5,4 mm.",
      "Para macromodelo didático (×1,5): altura ≈ 13 mm, VL ≈ 8,6 mm, MD ≈ 8,2 mm.",
      "Marque a altura com margem de segurança (~14 mm) — o excesso será removido nas fases de convergência e acabamento.",
      "O central inferior é o dente mais estreito da arcada; compacto e simétrico, com pouca diferenciação mesial/distal.",
    ]),
    step(2, "Centralização no bloco e identificação das faces", "faces", [
      "Defina vestibular, lingual, mesial e distal conforme o dente esculpido (ex.: FDI 41 — mesial voltada para linha média).",
      "Em bloco de ~20 mm de VL: com MD alvo de ~8,2 mm, centralize deixando ~6 mm de margem total (~3 mm de cada lado).",
      "Use ~5 mm de cada lado como margem de trabalho segura — permite correções sem comprometer o bloco.",
      "Marque leve inclinação mesial para cervical: com o tempo, desgaste funcional encurta levemente a borda mesio-incisal.",
      "Confira que as quatro faces estão corretamente orientadas antes de qualquer desenho.",
    ]),
    step(3, "Quadriculado em terços e esboço vestibular", "grid", [
      "Divida a altura em três terços iguais (~4,3 mm cada no macromodelo de 13 mm).",
      "Na vestibular, esboce contorno retangular com inclinação cervical — o terço cervical inclina-se para a linha de colo.",
      "O central inferior é visualmente 'quadrado': bordas mesial e distal quase paralelas, sem a curvatura acentuada dos superiores.",
      "Trace o esboço com traços leves; mantenha margem de segurança em todas as bordas.",
      "Antes de cortar, confira proporção altura/largura com a régua.",
    ]),
    step(4, "Corte proximal e obtenção do retângulo base", "rough-cut", [
      "Em vista proximal, VL alvo ≈ 8,6–9 mm: centralize no bloco de 20 mm (~5 mm de margem de cada lado).",
      "Corte o retângulo base no sentido vestíbulo-lingual, respeitando o esboço proximal.",
      "Após o corte proximal, o esquema vestibular 'cai' — refaça o quadriculado e o desenho retangular na vestibular.",
      "Vestibular: quase reta até o terço médio, depois inclina suavemente; lingual: côncava com cíngulo proeminente no cervical.",
      "Preserve volume nas bordas incisais — remoção excessiva compromete a altura final.",
    ]),
    step(5, "Forma geométrica e convergências com Lecron", "round", [
      "Ajuste mesial e distal para ficarem proporcionais — a mesial costuma ser esculpida primeiro e ficar ligeiramente 'melhor'.",
      "Incline levemente para lingual, aproximando o perfil ao cíngulo — convergência vestíbulo-lingual característica.",
      "Com o Lecron, aplique convergência mésio-distal e cérvico-incisal — o central inferior é convexo nos dois sentidos.",
      "Reduza gradualmente a margem de segurança até a proporção altura/largura corresponder ao padrão.",
      "Verifique que a borda incisal está levemente arredondada, não reta como uma faca.",
    ]),
    step(6, "Cristas marginais, lingual e polimento final", "polish", [
      "Crista marginal lingual: bem sutil — desgaste leve com Lecron, sem aprofundar demais; apenas sugira a elevação.",
      "Defina o cíngulo lingual — proeminente no central inferior, mais marcado que nos superiores.",
      "Arredonde a borda incisal; incline levemente a mesial conforme a 'idade' simulada do dente.",
      "Remova farpas de cera com escova; polimento final com meia fina em movimentos circulares suaves.",
      "Confira o resultado em todas as vistas — central inferior deve parecer compacto, simétrico e levemente inclinado para lingual.",
    ]),
  ];
}

/** Técnica regressiva — Incisivo lateral superior (FDI 12/22). */
export function upperLateralIncisorScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais e medidas (×1,5)", "measure", [
      "Instrumentos: bloco de cera, Lecron/esculpidor afiado, estilete, escova, meia fina e régua.",
      "Medidas reais aproximadas: altura ~9 mm, MD ~7 mm, VL ~6 mm.",
      "Macromodelo (×1,5): altura ≈ 14 mm (marque ~15 mm com margem), MD ≈ 10 mm, VL ≈ 9 mm.",
      "Centralize no bloco de ~20 mm: sobra ~11 mm → ~5–5,5 mm de cada lado como margem de segurança.",
      "O lateral superior é visualmente um central 'comprimido' — mais estreito e com distal inclinada.",
    ]),
    step(2, "Identificação das faces e desenho proximal", "proximal-draw", [
      "Marque vestibular, distal, lingual e mesial (ex.: FDI 12 — mesial para linha média).",
      "Comece pela vista proximal: centralize com ~5 mm de cada lado; aplique quadriculado em terços.",
      "Vestibular quase encostada no limite do bloco; lingual com concavidade iniciando no terço médio e retornando ao cíngulo cervical.",
      "Mesial: convergência a partir do ponto marcado; distal: inclinação mais acentuada e arredondada.",
      "Preserve margem de erro no desenho — linhas leves permitem correção.",
    ]),
    step(3, "Primeira redução: cortes grosseiros paralelos", "rough-cut", [
      "Corte vestibular e lingual com atenção ao paralelismo entre os lados — evite inclinar uma face mais que a outra.",
      "Trabalhe em camadas finas próximo às linhas de contorno; corte profundo apenas na zona central de excesso.",
      "Ajuste a mesial se ficou menos definida que a distal — ambas devem ser visualmente equivalentes em qualidade de contorno.",
      "Confira simetria vestíbulo-lingual em vista incisal antes de avançar.",
    ]),
    step(4, "Desenho vestibular e segunda sequência de cortes", "second-cut", [
      "Na vestibular (MD ≈ 10 mm): marque 5 | 10 | 5 no bloco de 20 mm e divida a altura em terços.",
      "Mesial mais reta e próxima à linha vertical; distal inclinada e arredondada — não toca a borda incisal da mesma forma.",
      "Corte seguindo o esboço até obter a figura geométrica característica do lateral — trapézio assimétrico.",
      "A distoincisal deve ser visivelmente menor e mais arredondada que a mesioincisal.",
      "Compare com o padrão: o lateral parece 'puxado' para distal na parte incisal.",
    ]),
    step(5, "Convergências e convexidades com Lecron", "vestibular", [
      "Troque o estilete pelo Lecron afiado. O lateral é mais convexo que o central, tanto MD quanto cérvico-incisal.",
      "Desgaste contando passadas — remova camadas finas e confira a cada 3–4 movimentos.",
      "Retire a margem de segurança gradualmente, mantendo proporção altura/largura.",
      "Ângulo mesio-incisal mais definido e 'vivo'; disto-incisal arredondado e menor — diferenciação típica do 12/22.",
      "Verifique convergência vestíbulo-lingual: lingual mais estreito que vestibular.",
    ]),
    step(6, "Proximais, fossa lingual, sulcos e polimento", "polish", [
      "Proximais levemente côncavas no terço cervical — melhoram contorno vestibular/lingual e simulam embrasure.",
      "Defina cristas marginais mesial e distal na lingual; fossa lingual entre elas, mais rasa que no central.",
      "Sulcos de desenvolvimento podem ser bipartidos ou tripartidos — comece sutil, aprofunde só se o padrão exigir.",
      "Limpe farpas de cera; polimento final com meia fina.",
      "Confira contralateral: 12 e 22 devem ser espelhados — distal sempre voltada para fora da arcada.",
    ]),
  ];
}

/** Técnica regressiva — Incisivo lateral inferior (FDI 42/32). */
export function lowerLateralIncisorScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais e medidas (×1,5)", "measure", [
      "Instrumentos: cera, Lecron afiado, estilete, escova, meia fina e régua.",
      "Medidas reais: altura ~7 mm → macromodelo ~13 mm (marque com margem); VL ~6 mm → ~9 mm; MD ~5,5 mm → ~8–9 mm.",
      "No bloco de 20 mm VL: deixe ~5,5 mm de cada lado como margem de segurança.",
      "O lateral inferior é ligeiramente maior que o central inferior — mais alto e mais largo incisalmente.",
      "A distal fica visivelmente mais baixa que a mesial — característica de desgaste funcional assimétrico.",
    ]),
    step(2, "Faces e desenho proximal (comece pela mesial)", "proximal-draw", [
      "Defina vestibular, mesial, distal e lingual (ex.: FDI 42 — mesial para linha média).",
      "Comece pela mesial: quadriculado e contorno com bossa vestibular; no limite cervical-médio inclina e termina ~no meio do terço médio.",
      "Lingual côncava com cíngulo proeminente; vestibular convexa.",
      "Corte deixando o desenho visível com margem de segurança — não remova linhas de referência cedo demais.",
      "Espelhe corretamente: 42 (lado direito) vs 32 (lado esquerdo) — mesial sempre para linha média.",
    ]),
    step(3, "Desenho vestibular e corte geométrico", "rough-cut", [
      "MD alvo ≈ 9 mm: centralize (~5 mm de cada lado) e quadricule a altura (~4 mm por terço em 13 mm).",
      "Mesial sobe até o meio do terço médio; distal posicionada um pouco mais baixa — inclinação assimétrica típica.",
      "Corte já angulando para afilar a silhueta; busque a forma geométrica antes da anatomia fina.",
      "Vestibular mais convexa que no central inferior; incisal ligeiramente mais larga.",
      "Confira que a distal não ficou grossa demais — lateral inferior tem distal fina e inclinada.",
    ]),
    step(4, "Convexidades e convergências com Lecron", "vestibular", [
      "Vestibular bem convexa nos sentidos cérvico-incisal e mésio-distal — mais acentuada que no central.",
      "Diferença dimensional: incisal um pouco mais larga que o central inferior; mesial maior que distal.",
      "Proximais: cervical ligeiramente côncava (região gengival) e convexa na borda incisal.",
      "Detalhes dos inferiores são pouco marcados — o esboço geométrico já carrega boa parte da anatomia.",
      "Reduza margem de segurança gradualmente, verificando proporções a cada etapa.",
    ]),
    step(5, "Cristas, cíngulo, cervical e polimento", "polish", [
      "Crista marginal lingual um pouco mais marcada que no central inferior, ainda assim sutil.",
      "Defina o cíngulo e a margem cervical em todas as faces — transição contínua, sem degraus.",
      "Arredonde ângulos retos remanescentes; confirme mesial maior e mais alta que distal.",
      "Limpe farpas, confira anatomia em todas as vistas e faça polimento final com meia fina.",
      "Compare com o central inferior lado a lado — o lateral deve parecer ligeiramente mais alto e assimétrico.",
    ]),
  ];
}

/** Técnica regressiva — Canino superior (FDI 13/23). */
export function upperCanineScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais e medidas (×1,5)", "measure", [
      "Instrumentos: bloco de cera, Lecron afiado, estilete, curvinha, meia fina e escova.",
      "Medidas reais: altura ~10,5 mm, VL ~8,4 mm, MD ~7,9 mm.",
      "Macromodelo (×1,5): altura ≈ 15,8 mm, VL ≈ 12,6 mm, MD ≈ 11,9 mm — marque ~16 mm com margem.",
      "O canino superior é o dente mais convexo da arcada anterior — bossa vestibular proeminente.",
      "Centralize no bloco considerando VL ≈ 12,6 mm em bloco de 20 mm (~3,5 mm de margem de cada lado).",
    ]),
    step(2, "Faces, desenho proximal e bossa vestibular", "proximal-draw", [
      "FDI 13/23: marque vestibular, distal, lingual e mesial.",
      "Na proximal: bossa vestibular ultrapassa levemente o terço cervical e termina na divisão médio-incisal.",
      "Desenhe o cíngulo lingual — projeção cervical que complementa a bossa vestibular.",
      "Atenção: não corte fundo demais no centro do terço médio vestibular no início — preserve volume para a convexidade.",
      "Confira que a cúspide (ponta) está posicionada ligeiramente distal ao eixo central do dente.",
    ], "Remover volume central cedo demais impede a bossa vestibular — erro comum no canino."),
    step(3, "Figura geométrica vestibular — pentágono ('casinha')", "rough-cut", [
      "Na vestibular (MD ≈ 12 mm): centralize e desenhe pentágono — base cervical larga, dois lados convergentes, ápice incisal na cúspide.",
      "Mesial mais longa e reta; distal mais curta e inclinada — formato de 'lança' ou 'gota'.",
      "Corte o pentágono com margem de segurança — não retire reto a área central (reservada para crista intermediária).",
      "A cúspide deve ser evidente já nesta fase, mesmo sem detalhes.",
      "Confira inclinação mesial/distal: mesial mais alta, distal mais baixa.",
    ]),
    step(4, "Vestibular e proximais com Lecron", "vestibular", [
      "Desgaste mais na distal que na mesial — reforça o formato de lança característico.",
      "Arredonde a vestibular em todos os sentidos; convexidade acentuada no terço médio (bossa).",
      "Proximais: côncavas no cervical (embrasure) e convexas na borda incisal/cúspide.",
      "Confira: mesial visivelmente maior que distal; ângulo distal mais baixo que mesial.",
      "Corrija assimetrias agora — depois do polimento as correções ficam difíceis.",
    ]),
    step(5, "Lingual — cristas marginais e crista intermediária", "lingual", [
      "Desenhe cristas marginais mesial e distal na lingual — delimitam a fossa central.",
      "Escalone a crista intermediária (média) que se dirige à ponta do canino — forma o ápice da cúspide.",
      "Preserve a elevação central; refine o corte incisal somente após definir as três cristas.",
      "A fossa lingual do canino é rasa, entre as cristas — não aprofunde excessivamente.",
      "Arredonde margens retas e remova farpas para visualizar a anatomia.",
    ]),
    step(6, "Acabamento, verificação e polimento", "polish", [
      "Refine contornos até aproximar o padrão anatômico — canino deve ser o dente mais 'pontudo' da arcada.",
      "Verifique eixo: cúspide ligeiramente distal; inclinação para lingual.",
      "Confira bossa vestibular em vista mesial — deve ser a mais proeminente dos dentes anteriores superiores.",
      "Polimento final com meia fina; limpe todas as faces.",
    ]),
  ];
}

/** Técnica regressiva — Canino inferior (FDI 43/33). */
export function lowerCanineScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais e medidas (×1,5)", "measure", [
      "Instrumentos: bloco, Lecron afiado, estilete, régua, meia fina e escova.",
      "Medidas reais: altura ~11 mm, VL ~7,8 mm, MD ~7,7 mm.",
      "Macromodelo (×1,5): altura ~16–16,5 mm; MD ≈ 11,4 mm; VL ≈ 11,7–12 mm.",
      "O canino inferior é mais alto e estreito que o superior — cúspide muito marcada.",
      "Desgaste funcional reduz a distal mais que a mesial — incorpore essa assimetria no desenho.",
    ]),
    step(2, "Vestibular e forma pentagonal", "proximal-draw", [
      "FDI 43/33: marque faces. A vestibular delimita as proximais.",
      "MD ≈ 11,4 mm no bloco de ~20 mm → ~4 mm de cada lado com margem de segurança.",
      "Quadriculado em terços; desenhe mesial mais alta e distal mais baixa/curta.",
      "Forma pentagonal ('casinha') como no superior, porém com proporções mais alongadas.",
      "Corte inicial com margem — preserve volume central para crista intermediária.",
    ]),
    step(3, "Corte vestíbulo-lingual e esboço de cúspide", "rough-cut", [
      "VL ≈ 12 mm: ~4–4,5 mm de margem de cada lado no bloco.",
      "Corte vestibular e lingual com atenção ao desenho — superfícies inclinadas convergem para lingual.",
      "Esboce bossa vestibular e cíngulo lingual; alivie a região da cúspide sem definir ainda.",
      "A lingual é mais côncava que a vestibular é convexa — contraste acentuado.",
      "Confira que a cúspide aponta ligeiramente para distal.",
    ]),
    step(4, "Anatomia vestibular — ponta e proximais", "vestibular", [
      "Com Lecron: convexidade cérvico-incisal e mésio-distal; defina bem a ponta do canino.",
      "Desgaste significativamente mais na distal — simula desgaste funcional ao longo dos anos.",
      "Proximais: cervical côncava, convexa na borda incisal; ajuste largura se estiver excessiva.",
      "Mesial deve ser visivelmente mais longa e alta que distal.",
      "Verifique contorno em vista incisal — formato de losango arredondado.",
    ]),
    step(5, "Lingual, cristas e polimento final", "polish", [
      "Cristas marginais existem mas são pouco definidas — delimite com suavidade, sem sulcos profundos.",
      "Aproveite a margem de segurança para aprofundar fossa lingual e depois suavizar.",
      "Confira simetria da cúspide (mesial vs distal) — distal deve estar visivelmente desgastada.",
      "Defina colo anatômico; limpe farpas e polimento final.",
      "Compare com o canino superior — inferior é mais estreito e com distal mais desgastada.",
    ]),
  ];
}

/** Técnica regressiva — Primeiro pré-molar superior (FDI 14/24). */
export function upperFirstPremolarScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais, medidas e preparo do bloco (×1,5)", "measure", [
      "Instrumentos: bloco de cera, Lecron afiado, estilete, espátula 7, Rollemberg 3/3S, régua e padrão de referência.",
      "Medidas reais aproximadas: altura ~8,5 mm, VL ~7 mm, MD ~7 mm (entre cúspides).",
      "Macromodelo (×1,5): altura ≈ 13 mm, VL ≈ 10,5 mm, MD ≈ 10,5 mm — marque com margem de ~1 mm.",
      "O primeiro pré-molar superior tem duas cúspides funcionais: vestibular (maior) e lingual (menor).",
      "Centralize no bloco de ~20 mm VL; reserve espaço para margem em todas as faces.",
    ]),
    step(2, "Identificação das faces e quadriculado", "faces", [
      "Marque vestibular, lingual, mesial, distal e oclusal — cinco faces de trabalho.",
      "Defina a linha cervical em todo o perímetro; divida a altura em terços (oclusal, médio, cervical).",
      "Na oclusal, esboce a orientação das duas cúspides: vestibular mais volumosa, lingual mais baixa.",
      "Mesial e distal convergem ligeiramente para lingual — anote essa inclinação nas faces proximais.",
      "Confira orientação FDI: 14/24 com cúspide vestibular voltada para vestíbulo.",
    ]),
    step(3, "Desenho proximal e redução grosseira", "proximal-draw", [
      "Em vista mesial, trace contorno com cúspide vestibular mais alta e lingual mais baixa — perfil em degrau suave.",
      "Transfira o desenho para distal por projeção paralela.",
      "Reduza volume externo ao perfil no sentido vestíbulo-lingual — primeira sequência de corte.",
      "Corte também no sentido mésio-distal, respeitando convergência para lingual.",
      "Aprofunde o limite cervical antes dos cortes volumosos — evita fraturas na base.",
    ]),
    step(4, "Redução por faces — vestibular e lingual", "rough-cut", [
      "Vestibular: convexidade acentuada no terço médio; inclinação da cúspide vestibular para mesial.",
      "Lingual: mais plana que vestibular; cúspide lingual ocupa ~1/3 da largura oclusal.",
      "Reduza geometricamente cada face antes de detalhar cúspides — técnica regressiva por planos.",
      "Mantenha espessura oclusal uniforme — compare com régua entre cúspides.",
      "Confira convergência: lingual mais estreito que vestibular em vista oclusal.",
    ]),
    step(5, "Delimitação das cúspides", "cusps", [
      "Na oclusal, desenhe contorno das duas cúspides: vestibular (larger, triangular) e lingual (menor, arredondada).",
      "Eleve as cúspides removendo cera ao redor — técnica regressiva: o que fica é a cúspide.",
      "Crista vestibular inclinada mesialmente; crista lingual mais curta e centralizada.",
      "Defina o sulco central (fossa mesio-vestibular) entre as cúspides — profundidade uniforme.",
      "A cúspide vestibular do 14 é a mais proeminente dos pré-molares superiores.",
    ], "Cúspide vestibular excessivamente alta compromete o padrão oclusal e contatos prematuros."),
    step(6, "Anatomia oclusal — fossas, sulcos e cristas triangulares", "occlusal", [
      "Escave a fossa central com Lecron fino — profundidade uniforme, paredes inclinadas.",
      "Defina sulco mesial e sulco distal separando as cúspides das faces proximais.",
      "Cristas triangulares: mesial e distal conectam cúspides vestibular e lingual — inclinação para fossa central.",
      "Sulco vestibular (borda vestibular da cúspide vestibular) — marque com traço fino.",
      "Evite sulcos profundos demais — dificultam polimento e enfraquecem visualmente as cúspides.",
    ]),
    step(7, "Proximais, colo e acabamento", "detail", [
      "Proximais: côncavas no cervical (embrasure) com contato oclusal em terço incisal da coroa.",
      "Defina colo anatômico com Rollemberg — linha sinuosa contínua.",
      "Ajuste inclinação das cúspides: vestibular ligeiramente para mesial, lingual centrada.",
      "Revise proporções em vista oclusal — forma de losango com cúspide vestibular deslocada para mesial.",
    ]),
    step(8, "Polimento final", "polish", [
      "Remova farpas de cera em sulcos e fossas com escova fina.",
      "Polimento com meia fina — movimentos que acompanham direção das cristas.",
      "Confira brilho uniforme; sulcos devem permanecer visíveis após polimento.",
      "Compare com padrão de referência em todas as cinco faces.",
    ]),
  ];
}

/** Técnica regressiva — Segundo pré-molar superior (FDI 15/25). */
export function upperSecondPremolarScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais, medidas e preparo (×1,5)", "measure", [
      "Instrumentos: bloco de cera, Lecron afiado, estilete, espátula 7, Rollemberg, régua e padrão.",
      "Medidas reais: altura ~8,5 mm, VL ~7 mm, MD ~7 mm.",
      "Macromodelo (×1,5): altura ≈ 13 mm, VL ≈ 10,5 mm, MD ≈ 10,5 mm.",
      "O segundo pré-molar superior tem cúspides vestibular e lingual mais simétricas que o primeiro — oclusal mais quadrada.",
      "Centralize no bloco; marque linha cervical e terços.",
    ]),
    step(2, "Faces, quadriculado e esboço oclusal", "faces", [
      "Identifique vestibular, lingual, mesial, distal e oclusal.",
      "Divida altura em terços; na oclusal esboce duas cúspides de tamanho mais equilibrado.",
      "O 15/25 apresenta oclusal mais quadrada que o 14/24 — cúspides vestibular e lingual de volumes parecidos.",
      "Marque convergência vestíbulo-lingual nas proximais.",
      "Confira orientação no bloco antes de cortar.",
    ]),
    step(3, "Desenho proximal e primeira redução", "proximal-draw", [
      "Perfil proximal: cúspides vestibular e lingual de alturas similares — diferente do degrau do primeiro pré-molar.",
      "Transfira contorno mesial→distal por linhas paralelas.",
      "Reduza volume externo ao perfil — corte grosseiro vestíbulo-lingual e mésio-distal.",
      "Aprofunde cervical; preserve volume oclusal para cúspides.",
    ]),
    step(4, "Redução por faces vestibular e lingual", "rough-cut", [
      "Vestibular convexa; lingual levemente côncava — contraste mais suave que no primeiro pré-molar.",
      "Reduza geometricamente; busque formato trapezoidal em vista proximal.",
      "Espessura oclusal uniforme; convergência para lingual perceptível em vista oclusal.",
      "Arredonde transições cervicais antes de esculpir cúspides.",
    ]),
    step(5, "Delimitação das cúspides", "cusps", [
      "Desenhe contorno oclusal: forma mais quadrada/retangular que o 14 — cúspides quase equivalentes.",
      "Eleve ambas as cúspides removendo cera periférica — alturas similares.",
      "Sulco central (fossa) menos profundo que no primeiro pré-molar.",
      "Cristas mesial e distal conectam cúspides com inclinação suave.",
      "Verifique simetria vestíbulo-lingual das cúspides.",
    ]),
    step(6, "Anatomia oclusal — fossa central e sulcos", "occlusal", [
      "Fossa central pequena e arredondada — escavação superficial com Lecron.",
      "Sulcos mesial e distal delimitam contato proximal; sulco vestibular marca borda da cúspide vestibular.",
      "Cristas triangulares menos acentuadas que no 14 — oclusal mais plana globalmente.",
      "Mantenha paredes de sulco inclinadas; evite 'vales' profundos.",
    ]),
    step(7, "Detalhes proximais, colo e polimento", "polish", [
      "Proximais com concavidade cervical; contato oclusal no terço oclusal.",
      "Colo anatômico com Rollemberg; revise convergências.",
      "Limpe farpas; polimento final com meia fina.",
      "Compare 15 com 14: segundo pré-molar deve parecer mais simétrico e quadrado.",
    ]),
  ];
}

/** Técnica regressiva — Primeiro pré-molar inferior (FDI 44/34). */
export function lowerFirstPremolarScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais, medidas e preparo (×1,5)", "measure", [
      "Instrumentos: bloco de cera, Lecron, estilete, espátula 7, Rollemberg, régua e padrão.",
      "Medidas reais: altura ~8,5 mm, VL ~7,5 mm, MD ~8 mm.",
      "Macromodelo (×1,5): altura ≈ 13 mm, VL ≈ 11 mm, MD ≈ 12 mm.",
      "O primeiro pré-molar inferior tem cúspide vestibular grande e cúspide lingual muito pequena (rudimentar).",
      "A cúspide vestibular é inclinada para mesial — característica funcional de guia lateral.",
    ]),
    step(2, "Identificação das faces e esboço", "faces", [
      "Marque vestibular, lingual, mesial, distal e oclusal.",
      "Linha cervical e terços; esboce oclusal com cúspide vestibular dominante e lingual mínima.",
      "Convergência acentuada para lingual — palatal/lingual bem mais estreito que vestibular.",
      "Centralize no bloco de ~20 mm; margem de segurança em MD e VL.",
    ]),
    step(3, "Desenho proximal e redução grosseira", "proximal-draw", [
      "Perfil proximal: cúspide vestibular alta e inclinada; cúspide lingual quase imperceptível — degrau acentuado.",
      "Transfira desenho mesial→distal.",
      "Primeira redução: corte vestíbulo-lingual e mésio-distal externo ao perfil.",
      "Aprofunde cervical; preserve volume vestibular para a cúspide principal.",
    ], "A cúspide lingual do 44 é rudimentar — não esculpir volume excessivo nessa região."),
    step(4, "Redução vestibular e lingual", "rough-cut", [
      "Vestibular muito convexa — bossa no terço médio; inclinação da cúspide para mesial.",
      "Lingual quase plana ou levemente côncava; cúspide lingual ocupa área mínima.",
      "Reduza por planos; busque perfil assimétrico vestíbulo-lingual.",
      "Confira inclinação mesial da cúspide vestibular — guia na lateralidade mandibular.",
    ]),
    step(5, "Delimitação das cúspides", "cusps", [
      "Cúspide vestibular: grande, triangular, inclinada mesialmente — domina a oclusal.",
      "Cúspide lingual: pequena, arredondada, posicionada distalmente — quase um tubérculo.",
      "Sulco central obliquo (fossa) separa as cúspides com inclinação disto-vestibular.",
      "Remova cera ao redor para elevar cúspides — técnica regressiva.",
    ]),
    step(6, "Anatomia oclusal", "occlusal", [
      "Fossa central obliqua; sulco mesial e distal delimitam contatos proximais.",
      "Crista mesial da cúspide vestibular inclinada — função de deslizamento lateral.",
      "Sulco vestibular marca borda externa da cúspide vestibular.",
      "Evite cúspide lingual proeminente — no 44 ela é vestigial.",
    ]),
    step(7, "Proximais, colo e polimento", "polish", [
      "Proximais côncavas no cervical; contato oclusal no terço superior.",
      "Colo anatômico; revise inclinação mesial da cúspide vestibular.",
      "Polimento final; confira função de guia — cúspide vestibular deve parecer 'angulada' para mesial.",
    ]),
  ];
}

/** Técnica regressiva — Segundo pré-molar inferior (FDI 45/35). */
export function lowerSecondPremolarScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais, medidas e preparo (×1,5)", "measure", [
      "Instrumentos: bloco de cera, Lecron, estilete, espátula 7, Rollemberg, régua e padrão.",
      "Medidas reais: altura ~9 mm, VL ~9 mm, MD ~11 mm.",
      "Macromodelo (×1,5): altura ≈ 13,5 mm, VL ≈ 13,5 mm, MD ≈ 16,5 mm.",
      "O segundo pré-molar inferior tem oclusal mais quadrada — cúspides vestibular e lingual mais equilibradas que o 44.",
      "Centralize no bloco; marque margens generosas em MD (dente mais largo).",
    ]),
    step(2, "Faces, quadriculado e esboço oclusal", "faces", [
      "Identifique as cinco faces; linha cervical e terços.",
      "Esboce oclusal quadrada com duas cúspides de volumes similares e sulco central transversal.",
      "Convergência vestíbulo-lingual moderada — menos acentuada que no 44.",
      "Marque orientação FDI 45/35.",
    ]),
    step(3, "Desenho mesial, vestibular e redução grosseira", "proximal-draw", [
      "Comece pela face mesial: perfil com cúspides vestibular e lingual de alturas parecidas.",
      "Desenhe vestibular: convexidade moderada; cúspide vestibular centrada.",
      "Reduza volume externo ao perfil — corte grosseiro em todas as direções.",
      "Aprofunde cervical; preserve volume oclusal.",
    ]),
    step(4, "Redução por faces — vestibular, lingual e proximais", "rough-cut", [
      "Vestibular convexa; lingual levemente côncava — simetria maior que no primeiro pré-molar inferior.",
      "Proximais: convergência para lingual; contato oclusal amplo.",
      "Reduza geometricamente; busque formato trapezoidal regular.",
      "Confira largura MD — 45 é o pré-molar inferior mais largo.",
    ]),
    step(5, "Delimitação das cúspides", "cusps", [
      "Duas cúspides de tamanho equivalente — vestibular e lingual.",
      "Sulco central transversal (fossa) divide a oclusal em mesial e distal.",
      "Cristas mesial e distal conectam cúspides com inclinação suave para a fossa.",
      "Eleve cúspides por remoção periférica de cera.",
    ]),
    step(6, "Anatomia oclusal e convexidades", "occlusal", [
      "Fossa central arredondada; sulcos mesial, distal e vestibular delimitam cristas.",
      "Oclusal globalmente mais plana que no 44 — cúspides menos inclinadas.",
      "Cristas triangulares presentes mas suaves.",
      "Verifique forma quadrada em vista oclusal.",
    ]),
    step(7, "Acabamento, colo e polimento final", "polish", [
      "Defina colo anatômico; proximais côncavas no cervical.",
      "Revise simetria vestíbulo-lingual — característica distintiva do 45 vs 44.",
      "Limpe farpas; polimento com meia fina.",
      "Compare com 44: segundo pré-molar deve parecer mais simétrico e quadrado.",
    ]),
  ];
}

/** Técnica regressiva — Primeiro molar superior (FDI 16/26). */
export function upperFirstMolarScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais, medidas e preparo do bloco (×1,5)", "measure", [
      "Instrumentos: bloco de cera (~25–30 mm), Lecron afiado, estilete, espátula 7, Rollemberg 3/3S, régua e padrão.",
      "Medidas reais: altura ~10,5 mm, VL ~11 mm, MD ~10,5 mm.",
      "Macromodelo (×1,5): altura ≈ 16 mm, VL ≈ 16,5 mm, MD ≈ 16 mm — marque com margem.",
      "O primeiro molar superior possui quatro cúspides funcionais, oblique ridge e padrão oclusal complexo.",
      "Use bloco generoso — molares exigem volume para quatro cúspides e fossa central.",
    ]),
    step(2, "Marcação de altura, largura e faces", "faces", [
      "Marque linha cervical; divida coroa em terços (oclusal, médio, cervical).",
      "Identifique vestibular, lingual, mesial, distal e oclusal.",
      "Na oclusal, esboce posição das quatro cúspides: MV, MP, DP, DV (mesio-vestibular, mesio-lingual, disto-lingual, disto-vestibular).",
      "Mesial e distal convergem para lingual; vestibular mais largo que lingual.",
      "Centralize no bloco; confira orientação FDI 16/26.",
    ]),
    step(3, "Cortes iniciais — distal, vestibular e esboço geral", "rough-cut", [
      "Comece pelo corte distal: reduza excesso no sentido vestíbulo-lingual.",
      "Corte vestibular: convexidade acentuada; preserve volume para cúspides MV e DV.",
      "Esboce contorno externo da coroa — forma trapezoidal em vista proximal.",
      "Aprofunde cervical em todo o perímetro antes de cortes volumosos.",
      "Use estilete para linhas guia finas; Lecron para remoção de volume.",
    ]),
    step(4, "Delimitação externa e redução por faces", "second-cut", [
      "Delimite contorno externo da coroa em todas as faces — segunda sequência de corte.",
      "Lingual: convexidade menor que vestibular; cúspides linguais (MP, DP) mais baixas.",
      "Proximais: côncavas no cervical; área de contato oclusal ampla.",
      "Reduza geometricamente cada face; busque silhueta de molar antes dos detalhes oclusais.",
      "Confira proporções MD vs VL em vista oclusal — ligeiramente mais largo MD.",
    ]),
    step(5, "Escultura das cúspides", "cusps", [
      "Desenhe contorno das quatro cúspides na oclusal — MV e DV maiores; MP e DP menores.",
      "Eleve cúspides removendo cera periférica — técnica regressiva.",
      "Cristas mesial e distal conectam cúspides homônimas (MV-MP e DV-DP).",
      "Oblique ridge (crista oblíqua): conecta cúspide disto-vestibular à mesio-lingual — marca registrada do molar superior.",
      "Cúspide de Carabelli (mesio-lingual): pequena elevação ou sulco na MP — detalhe anatômico do 16/26.",
    ], "A crista oblíqua é referência anatômica essencial — sua ausência compromete a identificação do molar superior."),
    step(6, "Escultura lingual e fossa central", "lingual", [
      "Lingual: cúspides MP e DP menos volumosas; fossa central profunda entre as quatro cúspides.",
      "Escave fossa central com Lecron fino — profundidade uniforme, paredes inclinadas.",
      "Sulcos mesial, distal e obliquo delimitam cristas triangulares.",
      "Defina crista oblíqua com traço visível mas não profundo demais.",
    ]),
    step(7, "Anatomia oclusal — sulcos, fossas e cristas triangulares", "occlusal", [
      "Sulco central (fossa) no centro da oclusal; sulcos secundários irradiam para cada cúspide.",
      "Cristas triangulares: mesial (MV-MP), distal (DV-DP), vestibular (MV-DV) e obliqua (DV-MP).",
      "Sulcos devem ter profundidade uniforme — evite 'cavidades' irregulares.",
      "Verifique padrão em H ou Y modificado — característico do molar superior.",
      "Confira contatos proximais: mesial e distal com área oclusal ampla.",
    ]),
    step(8, "Colo, detalhes e polimento final", "polish", [
      "Colo anatômico com Rollemberg; proximais côncavas no cervical.",
      "Revise quatro cúspides em vista oclusal — MV e DV devem ser as mais proeminentes.",
      "Limpe farpas em sulcos; polimento cuidadoso preservando anatomia oclusal.",
      "Compare com padrão: primeiro molar superior é o maior dente da arcada.",
    ]),
  ];
}

/** Técnica regressiva — Segundo molar superior (FDI 17/27). */
export function upperSecondMolarScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais, medidas e preparo (×1,5)", "measure", [
      "Instrumentos: bloco de cera, Lecron, estilete, espátula 7, Rollemberg, régua e padrão.",
      "Medidas reais: altura ~10 mm, VL ~11 mm, MD ~10 mm.",
      "Macromodelo (×1,5): altura ≈ 15 mm, VL ≈ 16,5 mm, MD ≈ 15 mm.",
      "O segundo molar superior é ligeiramente menor que o primeiro; oclusal mais redonda.",
      "Quatro cúspides presentes, porém cúspide disto-vestibular (DL) pode ser reduzida ou ausente.",
    ]),
    step(2, "Faces, quadriculado e esboço oclusal", "faces", [
      "Marque cinco faces; linha cervical e terços.",
      "Esboce oclusal mais arredondada que o 16 — contorno menos retangular.",
      "Posicione quatro cúspides; DL (disto-lingual) pode ser menor.",
      "Convergência vestíbulo-lingual; centralize no bloco.",
    ]),
    step(3, "Desenho proximal e redução grosseira", "proximal-draw", [
      "Perfil proximal arredondado — transição suave entre cúspides.",
      "Transfira mesial→distal; reduza volume externo ao perfil.",
      "Corte vestibular e lingual; aprofunde cervical.",
      "Preserve volume oclusal para quatro cúspides.",
    ]),
    step(4, "Redução por faces e contorno externo", "rough-cut", [
      "Vestibular convexa; lingual menos volumosa.",
      "Contorno externo arredondado — diferente do trapezoidal do 16.",
      "Proximais côncavas no cervical; contato oclusal amplo.",
      "Confira tamanho relativo: 17 ligeiramente menor que 16.",
    ]),
    step(5, "Delimitação das cúspides", "cusps", [
      "Quatro cúspides: MV, MP, DP, DV — DL reduzida ou fundida com DP.",
      "Eleve cúspides por remoção periférica; oclusal mais curta MD que no 16.",
      "Crista oblíqua presente mas menos acentuada.",
      "Fossa central arredondada — padrão oclusal mais compacto.",
    ]),
    step(6, "Anatomia oclusal", "occlusal", [
      "Fossa central e sulcos secundários; cristas triangulares mais curtas.",
      "Sulcos menos profundos que no 16 — oclusal globalmente mais plana.",
      "Verifique forma arredondada em vista oclusal.",
      "Cúspide de Carabelli ausente ou muito reduzida no 17.",
    ]),
    step(7, "Colo, detalhes e polimento", "polish", [
      "Colo anatômico; proximais com concavidade cervical.",
      "Revise proporções vs 16 — segundo molar deve parecer ligeiramente menor e mais redondo.",
      "Polimento final; limpe sulcos.",
    ]),
  ];
}

/** Técnica regressiva — Primeiro molar inferior (FDI 46/36). */
export function lowerFirstMolarScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais, medidas e preparo (×1,5)", "measure", [
      "Instrumentos: bloco de cera (~25–30 mm), Lecron, estilete, espátula 7, Rollemberg, régua e padrão.",
      "Medidas reais: altura ~11 mm, VL ~10 mm, MD ~11 mm.",
      "Macromodelo (×1,5): altura ≈ 16,5 mm, VL ≈ 15 mm, MD ≈ 16,5 mm.",
      "O primeiro molar inferior possui cinco cúspides: MB, DB, ML, DL e disto-lingual (DL) — padrão oclusal em + ou Y.",
      "É o maior dente da arcada inferior; centralize com margem generosa.",
    ]),
    step(2, "Marcação de faces e esboço oclusal", "faces", [
      "Identifique vestibular, lingual, mesial, distal e oclusal.",
      "Linha cervical e terços; esboce cinco cúspides na oclusal.",
      "Cúspides vestibulares (MB, DB) maiores; linguais (ML, DL) menores.",
      "Convergência acentuada para lingual — característica dos molares inferiores.",
    ]),
    step(3, "Cortes iniciais e redução grosseira", "rough-cut", [
      "Reduza excesso distal e vestibular — primeira sequência.",
      "Corte vestíbulo-lingual externo ao perfil; aprofunde cervical.",
      "Esboce contorno trapezoidal em vista proximal — vestibular mais largo.",
      "Preserve volume oclusal para cinco cúspides.",
    ]),
    step(4, "Redução por faces e contorno externo", "second-cut", [
      "Vestibular muito convexa; lingual mais côncava.",
      "Delimite contorno externo em todas as faces.",
      "Proximais côncavas no cervical; área de contato oclusal ampla.",
      "Confira convergência lingual — vista oclusal deve ser visivelmente mais estreita lingualmente.",
    ]),
    step(5, "Escultura das cinco cúspides", "cusps", [
      "Desenhe MB (mesio-vestibular), DB (disto-vestibular), ML (mesio-lingual), DL (disto-lingual) e cúspide disto-lingual.",
      "Cúspides vestibulares maiores e mais altas; linguais menores e mais baixas.",
      "Eleve cúspides por remoção periférica.",
      "Crista mesial conecta MB-ML; crista distal conecta DB-DL.",
      "Fossa central (fossa mesial e fossa distal) entre as cristas.",
    ], "O molar inferior tem cinco cúspides — confundir com quatro cúspides do superior é erro frequente."),
    step(6, "Anatomia oclusal — sulcos e cristas", "occlusal", [
      "Sulco central (+ ou Y) divide oclusal em mesial e distal.",
      "Cristas triangulares em cada quadrante; sulcos secundários delimitam cúspides.",
      "Fossa mesial e fossa distal — escavação com profundidade uniforme.",
      "Sulco vestibular e sulco lingual marcam bordas externas.",
      "Evite sulcos profundos demais — comprometem resistência visual do modelo.",
    ]),
    step(7, "Lingual, colo e polimento", "polish", [
      "Lingual: cúspides ML e DL menos proeminentes; concavidade cervical.",
      "Colo anatômico com Rollemberg.",
      "Revise cinco cúspides em vista oclusal — padrão em + deve ser reconhecível.",
      "Polimento final; compare com 36/46 contralateral.",
    ]),
  ];
}

/** Técnica regressiva — Segundo molar inferior (FDI 47/37). */
export function lowerSecondMolarScript(): ScriptStep[] {
  return [
    step(1, "Instrumentais, medidas e preparo (×1,5)", "measure", [
      "Instrumentos: bloco de cera, Lecron, estilete, espátula 7, Rollemberg, régua e padrão.",
      "Medidas reais: altura ~10 mm, VL ~9,5 mm, MD ~10 mm.",
      "Macromodelo (×1,5): altura ≈ 15 mm, VL ≈ 14 mm, MD ≈ 15 mm.",
      "O segundo molar inferior é menor que o 46; oclusal mais redonda — frequentemente quatro cúspides funcionais.",
      "Centralize no bloco; marque margens.",
    ]),
    step(2, "Faces e esboço oclusal", "faces", [
      "Marque cinco faces; linha cervical e terços.",
      "Esboce oclusal arredondada — quatro cúspides principais (ML e DL podem estar fundidas).",
      "Convergência para lingual; contorno menos trapezoidal que o 46.",
    ]),
    step(3, "Redução grosseira e contorno externo", "rough-cut", [
      "Corte distal e vestibular; reduza volume externo ao perfil.",
      "Aprofunde cervical; preserve oclusal.",
      "Contorno arredondado — diferente do primeiro molar inferior.",
    ]),
    step(4, "Redução por faces", "second-cut", [
      "Vestibular convexa; lingual côncava.",
      "Proximais com concavidade cervical.",
      "Delimite contorno externo; confira tamanho relativo vs 46.",
    ]),
    step(5, "Delimitação das cúspides", "cusps", [
      "Quatro cúspides funcionais: MB, DB, ML, DL — cúspide disto-lingual reduzida ou ausente.",
      "Eleve cúspides; oclusal mais compacta que no 46.",
      "Fossa central arredondada; cristas mesial e distal mais curtas.",
    ]),
    step(6, "Anatomia oclusal", "occlusal", [
      "Sulco central em + ou C modificado; sulcos menos profundos.",
      "Cristas triangulares suaves; oclusal globalmente mais plana.",
      "Verifique forma arredondada em vista oclusal.",
    ]),
    step(7, "Colo e polimento final", "polish", [
      "Colo anatômico; proximais côncavas.",
      "Revise vs 46 — segundo molar deve parecer menor e mais redondo.",
      "Polimento final com meia fina.",
    ]),
  ];
}

/** Fallback genérico (demais dentes não mapeados). */
export function genericScript(kind: ToothKind, innerFace: string): ScriptStep[] {
  const occlusal =
    kind === "molar" || kind === "premolar"
      ? [
          step(9, "Esculpindo a oclusal e os sulcos", "occlusal", [
            "Identifique as cúspides e o padrão oclusal do dente de referência.",
            "Escave os sulcos centrais com Lecron ou instrumento fino — profundidade uniforme em toda a extensão.",
            "Defina cristas triangulares e fossas centrais conforme a anatomia do dente.",
            "Mantenha paredes inclinadas e fossas arredondadas; evite sulcos muito profundos que enfraquecem visualmente o modelo.",
            "Confira contatos proximais e inclinação das cúspides antes do acabamento.",
          ]),
        ]
      : [];

  return [
    step(1, "Prepare e marque o bloco de cera", "measure", [
      "Selecione bloco com dimensões adequadas ao dente — considere fator ×1,5 se for macromodelo didático.",
      "Marque a linha cervical com régua em todo o perímetro do bloco.",
      "Divida a altura em terços e marque as faces antes de qualquer desbaste.",
      "Organize instrumentos: Lecron afiado, estilete, espátula 7, Rollemberg e meia fina.",
    ]),
    step(2, "Identifique e marque as faces", "faces", [
      "Defina vestibular, " + innerFace + ", mesial e distal.",
      kind === "molar" || kind === "premolar"
        ? "Oclusal — superfície de mastigação onde se esculpirão cúspides, fossas e sulcos."
        : "Incisal — borda de corte ou ápice de cúspide.",
      "Confira orientação no bloco conforme notação FDI.",
      "Marque convergências nas faces proximais antes de cortar.",
    ]),
    step(3, "Desenhe o perfil nas proximais", "proximal-draw", [
      "Trace o contorno nas faces mesial e distal com traços leves.",
      "Projete a curva vestibular e a linha cervical de forma contínua.",
      "Transfira o desenho mesial para distal por projeção paralela.",
      "Inclua no desenho a inclinação vestíbulo-lingual.",
    ]),
    step(4, "Faça o desgaste grosseiro", "rough-cut", [
      "Remova o excesso de cera fora do perfil desenhado — técnica regressiva.",
      "Aprofunde o limite cervical antes de cortes volumosos.",
      "Preserve volume para detalhes finais; trabalhe em camadas finas próximo às linhas.",
      "Confira resultado em vista proximal antes de avançar.",
    ]),
    step(5, "Forme a vestibular", "vestibular", [
      "Modele a convexidade vestibular conforme o dente de referência.",
      "Arredonde transições cervicais e incisais/oclusais.",
      "Aplique convergências cérvico-incisal e mésio-distal.",
    ]),
    step(6, `Esculpa a face ${innerFace}`, "lingual", [
      `Defina cristas e concavidades na face ${innerFace}.`,
      "Mantenha espessura uniforme entre vestibular e " + innerFace + ".",
      "Para pré-molares e molares, prepare a base para escultura oclusal.",
    ]),
    step(7, "Ajuste proporções e arredondamento", "round", [
      "Verifique simetria nas vistas mesial, distal e superior/incisal.",
      "Corrija inclinações, espessuras e convergências.",
      "Arredonde arestas vivas remanescentes.",
    ]),
    step(8, "Finalize os detalhes e polimento", "polish", [
      "Refine anatomia superficial — sulcos, cristas e colo anatômico.",
      "Remova farpas de cera; polimento final com escova e meia fina.",
    ]),
    ...occlusal,
  ];
}

import { condensedSculptureScript } from "./condensed-scripts";

export function sculptureScriptFor(
  number: number,
  kind: ToothKind,
  jaw: Jaw,
  measures?: { altura?: string; md?: string; vl?: string },
  toothName?: string,
): ScriptStep[] {
  // Dente 11/21: mantém o roteiro detalhado aprovado
  if (kind === "incisor" && jaw === "upper" && number % 10 === 1) {
    return upperCentralIncisorScript(number, measures);
  }

  const name = toothName ?? `dente FDI ${number}`;
  return condensedSculptureScript(number, kind, jaw, name, measures).map((s) =>
    step(s.id, s.title, s.animPhase, s.instructions, s.alert),
  );
}

/** Progresso visual da animação 3D por fase. */
export function blendForAnimPhase(phase: AnimPhase): number {
  const map: Record<AnimPhase, number> = {
    instruments: 0.05,
    measure: 0.08,
    thirds: 0.12,
    grid: 0.14,
    faces: 0.16,
    "proximal-draw": 0.22,
    "rough-cut": 0.38,
    "second-cut": 0.5,
    round: 0.62,
    vestibular: 0.7,
    lingual: 0.78,
    cingulum: 0.84,
    cervix: 0.88,
    cusps: 0.9,
    occlusal: 0.93,
    root: 0.94,
    detail: 0.97,
    polish: 1,
  };
  return map[phase];
}

export function captionForAnimPhase(phase: AnimPhase): string {
  const map: Record<AnimPhase, string> = {
    instruments: "Instrumentais e bloco",
    measure: "Medidas e planejamento",
    thirds: "Divisão em terços",
    grid: "Quadriculado e esboço",
    faces: "Marcações das faces",
    "proximal-draw": "Desenho proximal",
    "rough-cut": "Redução grosseira",
    "second-cut": "Segunda sequência de cortes",
    round: "Arredondamento",
    vestibular: "Modelagem vestibular",
    lingual: "Modelagem lingual",
    cingulum: "Fossa e cíngulo",
    cervix: "Colo anatômico",
    cusps: "Delimitação das cúspides",
    occlusal: "Anatomia oclusal",
    root: "Escultura da raiz",
    detail: "Detalhes anatômicos",
    polish: "Acabamento e polimento",
  };
  return map[phase];
}

/** Frases curtas sobrepostas na animação 3D (didática visual). */
export function explainersForAnimPhase(phase: AnimPhase): string[] {
  const map: Record<AnimPhase, string[]> = {
    instruments: [
      "Separe Lecron, Rollemberg, espátula 7, régua e meia fina",
      "Bloco de boa consistência = melhor polimento",
      "O padrão de gesso guia cada sequência de corte",
    ],
    measure: [
      "Anote altura, mesiodistal e vestíbulo-lingual",
      "No macromodelo multiplique por ~1,5",
      "Deixe margem de segurança antes de cortar",
    ],
    thirds: [
      "Divida a altura em terços iguais",
      "Circunde o bloco — linhas devem se encontrar",
      "Use Lecron afiado para marcar sem lascar",
    ],
    grid: [
      "Quadricule terços na face de trabalho",
      "O esboço grosseiro ainda mantém margem",
      "Compare com o desenho anatômico de referência",
    ],
    faces: [
      "V = vestibular · L = lingual",
      "M = mesial · D = distal",
      "Confirme o FDI (lado direito ou esquerdo)",
    ],
    "proximal-draw": [
      "Comece pela proximal (mesial ou distal)",
      "Projete linhas paralelas para a face oposta",
      "Vestibular convexa · lingual com fossa/cíngulo",
    ],
    "rough-cut": [
      "Aprofunde o cervical antes da redução",
      "Corte mésio-distal respeitando as linhas",
      "Perto do desenho: raspe, não corte fundo",
    ],
    "second-cut": [
      "Trapézio com grande base incisal (V–L)",
      "Proximais convergem para lingual",
      "Confira com o modelo de gesso",
    ],
    round: [
      "Elimine arestas e ângulos vivos",
      "Defina convergências e transições",
      "Ainda é macroanatomia — sem detalhes finos",
    ],
    vestibular: [
      "Convexidade cérvico-incisal e mésio-distal",
      "Bossa no terço cervical",
      "Mesial costuma ser mais reta que a distal",
    ],
    lingual: [
      "Fossa côncava nos terços médio-incisais",
      "Preserve cristas marginais",
      "Não fure a cera no fundo da fossa",
    ],
    cingulum: [
      "Espátula 7 modela a fossa",
      "Cíngulo com ~45° para lingual",
      "Ângulo mesio-incisal mais reto; distal arredondado",
    ],
    cervix: [
      "Colo = linha sinuosa côncavo-convexa",
      "Rollemberg nº 3 / 3S para refinar",
      "Limite claro entre coroa e raiz",
    ],
    cusps: [
      "Delimite cúspides antes dos sulcos profundos",
      "Preserve volume das pontas",
      "Compare altura entre cúspides do mesmo dente",
    ],
    occlusal: [
      "Sulcos centrais e fossas com profundidade uniforme",
      "Cristas triangulares e padrão oclusal do dente",
      "Evite sulcos em ‘buraco’ — paredes inclinadas",
    ],
    root: [
      "Corte a base do bloco com apoio firme",
      "Lecron afiado + Rollemberg no acabamento",
      "Raiz alinhada ao eixo da coroa",
    ],
    detail: [
      "Sulcos de desenvolvimento e lóbulos",
      "Proximais levemente côncavas no cervical",
      "Área de espelhamento na vestibular",
    ],
    polish: [
      "Remova farpas de cera para enxergar anatomia",
      "Meia fina + escova no polimento final",
      "Revise todas as faces antes de concluir",
    ],
  };
  return map[phase];
}

/** Faces em destaque na legenda da animação. */
export function highlightedFacesForPhase(phase: AnimPhase): Array<"V" | "L" | "M" | "D" | "O"> {
  switch (phase) {
    case "vestibular":
      return ["V"];
    case "lingual":
    case "cingulum":
      return ["L"];
    case "proximal-draw":
      return ["M", "D"];
    case "occlusal":
    case "cusps":
      return ["O"];
    case "faces":
    case "measure":
    case "thirds":
    case "grid":
      return ["V", "L", "M", "D"];
    default:
      return [];
  }
}
