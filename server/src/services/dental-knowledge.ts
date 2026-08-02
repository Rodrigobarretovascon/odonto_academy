/**
 * Base de conhecimento educacional — odontologia geral (todas as áreas).
 * Escultura em cera é um dos temas, não o único.
 * Usada pelo assistente GB Dental (retrieval + LLM opcional).
 */

import { EXTRA_KNOWLEDGE, type KnowledgeChunk } from "./knowledge/index.js";

export type { KnowledgeChunk };

const CORE_KNOWLEDGE: KnowledgeChunk[] = [
  {
    id: "nomenclatura-fdi",
    title: "Nomenclatura FDI e faces do dente",
    tags: ["fdi", "nomenclatura", "faces", "vestibular", "lingual", "mesial", "distal", "oclusal", "incisal"],
    body: `A nomenclatura FDI identifica cada dente permanente com dois dígitos: 1º = quadrante (1 superior direito, 2 superior esquerdo, 3 inferior esquerdo, 4 inferior direito); 2º = posição de 1 a 8 a partir da linha média.
Faces: vestibular (V, para fora/frente), lingual (L, para dentro — em superiores também chamada palatina clinicamente, mas no GB Dental usamos lingual), mesial (M, para a linha média), distal (D, afastada da linha média), oclusal (posteriores) ou incisal (anteriores).
Mesial e distal NÃO são iguais: a distal costuma ser mais convexa/arredondada. Sempre defina V/L/M/D no bloco antes de remover cera.`,
  },
  {
    id: "tecnica-regressiva",
    title: "Técnica regressiva de escultura em cera",
    tags: ["escultura", "cera", "regressiva", "ceroplastia", "passo", "roteiro", "técnica", "tecnica"],
    body: `A técnica regressiva parte de um bloco de cera e remove material até a anatomia. Sequência didática do GB Dental:
1) Preparar bloco e orientar faces com medidas da tabela.
2) Desenhar proximais e redução grosseira (começar pela mesial, margem de segurança).
3) Arredondar macroforma com Lecron (sem quinas).
4) Anatomia proximal/lingual (e esboço de cúspides nos posteriores).
5) Proporção e detalhes.
6) Posteriores: sulcos e fossas oclusais (traçado leve → aprofundar em camadas).
7) Refino e alisamento.
Materiais nestas páginas: bloco de cera + Lecron. Remova aos poucos — é mais fácil tirar do que devolver volume.`,
  },
  {
    id: "margem-seguranca",
    title: "Margem de segurança e colo",
    tags: ["margem", "segurança", "seguranca", "colo", "cervical", "fratura", "verde", "vermelho"],
    body: `Na redução grosseira, desenhe o perfil deixando margem de segurança (faixa verde didática). O vermelho é o excesso a remover. O terço cervical é zona de risco: forçar demais no colo fratura a cera. Tire aparas para enxergar o término cervical. Nas imagens-guia: verde = preservar; vermelho = remover.`,
  },
  {
    id: "incisivo-central-superior",
    title: "Incisivo central superior (11/21)",
    tags: ["11", "21", "incisivo", "central", "superior", "mamelão", "mamelao", "cíngulo", "cingulo"],
    body: `Incisivo central superior: maior do grupo dos incisivos, coroa alargada (MD ≈ 80% da altura). Ângulo mésio-incisal próximo de 90°; disto-incisal mais arredondado. Mesial mais comprida que a distal. Vestibular com mamelões e sulcos de desenvolvimento discretos. Lingual: fossa entre cristas marginais e cíngulo no terço cervical. Medidas típicas de referência: altura ~10,5 mm, MD ~8,5 mm, VL ~7,0 mm (use a tabela da página).`,
  },
  {
    id: "incisivo-lateral-superior",
    title: "Incisivo lateral superior (12/22)",
    tags: ["12", "22", "lateral", "incisivo", "superior"],
    body: `Incisivo lateral superior: mais estreito que o central; lembra um central “comprimido”. Distal bem arredondada e inclinada. Ângulo mésio-incisal mais definido. Fossa lingual menor; cíngulo proporcionalmente marcado. Preserve cristas marginais.`,
  },
  {
    id: "incisivos-inferiores",
    title: "Incisivos inferiores (31/32/41/42)",
    tags: ["31", "32", "41", "42", "incisivo", "inferior", "central", "lateral"],
    body: `Incisivo central inferior: o mais estreito e compacto; mesial e distal quase simétricas. Lateral inferior: um pouco mais largo na borda; distal levemente mais arredondada. Detalhes vestibulares sutis — não force mamelões profundos. Fossa e cíngulo discretos.`,
  },
  {
    id: "caninos",
    title: "Caninos (13/23/33/43)",
    tags: ["13", "23", "33", "43", "canino", "cúspide", "cuspide", "pentágono", "pentagono", "lança"],
    body: `Canino superior: cúspide única; contorno vestibular em pentágono (“casinha/lança”). Distal mais curta e inclinada que a mesial. Na vestibular é muito convexo — no corte grosseiro não tire demais no terço médio. Lingual: cristas marginais + crista intermediária. Canino inferior: mais estreito/alongado; cúspide mais aguda; cristas linguais menos marcadas.`,
  },
  {
    id: "pre-molares",
    title: "Pré-molares",
    tags: ["14", "15", "24", "25", "34", "35", "44", "45", "pré-molar", "pre-molar", "premolar"],
    body: `1º pré-molar superior: duas cúspides (V > L); oclusal hexagonal irregular; sulco central MD e fossas. 2º pré-molar superior: cúspides mais simétricas; oclusal mais oval. 1º pré-molar inferior: cúspide vestibular dominante; lingual pequena; sulco mesiolingual característico. 2º pré-molar inferior: cúspides mais equilibradas (pode ter 2 ou 3); sulco em Y ou H.`,
  },
  {
    id: "molares-superiores",
    title: "Molares superiores",
    tags: ["16", "17", "26", "27", "molar", "superior", "carabelli", "crista", "oblíqua", "obliqua"],
    body: `1º molar superior: quatro cúspides (MV, ML, DV, DL) + possível cúspide de Carabelli na ML; crista oblíqua DV–ML (preservar). Sulco central, fossas e sulcos vestibulares/linguais. 2º molar superior: padrão semelhante, mais compacto; DL frequentemente menor.`,
  },
  {
    id: "molares-inferiores",
    title: "Molares inferiores",
    tags: ["36", "37", "46", "47", "molar", "inferior", "y", "cinco"],
    body: `1º molar inferior: cinco cúspides (3 V + 2 L); padrão oclusal em Y. 2º molar inferior: quatro cúspides; oclusal mais retangular/cruzada. Convergência acentuada para lingual. Sulcos rasos e limpos com Lecron.`,
  },
  {
    id: "oclusal-sulcos",
    title: "Como esculpir sulcos oclusais",
    tags: ["oclusal", "sulco", "sulcos", "fossa", "fossas", "cúspide", "crista"],
    body: `FACE EM TRABALHO: OCLUSAL. 1) Esboce cúspides sem aprofundar. 2) Risque o traçado dos sulcos principais em linhas leves. 3) Aprofunde em camadas finas e regulares. 4) Preserve pontas de cúspide e cristas marginais. 5) Confira o padrão do dente (central, Y, cruz, crista oblíqua). Não exagerue a profundidade — sulco limpo, sem farpas.`,
  },
  {
    id: "instrumentos-escultura",
    title: "Instrumentos de escultura",
    tags: ["instrumento", "instrumentos", "lecron", "le cron", "estilete", "régua", "regua", "polimento"],
    body: `No roteiro GB Dental destas páginas: bloco de cera e Lecron. O Lecron serve para marcar, cortar/raspar, arredondar, escavar fossa e sulcos, e alisar. Em outras técnicas clássicas também aparecem estilete, régua, Rollemberg/Hollenback, escova e meia fina para polimento — mas aqui priorize cera + Lecron conforme o passo a passo da página.`,
  },
  {
    id: "proporcao-estetica",
    title: "Proporção e estética do sorriso (conceito)",
    tags: ["proporção", "proporcao", "estética", "estetica", "sorriso", "largura", "altura", "80%"],
    body: `No central superior, a largura mesiodistal aproxima-se de cerca de 80% da altura da coroa. Laterais são menores; caninos dão suporte de canto. Em restaurações estéticas, proporção, eixo, zenit gengival e textura de superfície importam tanto quanto cor. Na escultura didática, confira sempre a tabela de medidas da página.`,
  },
  {
    id: "periodonto-basico",
    title: "Periodonto e contorno proximal",
    tags: ["periodonto", "gengiva", "contato", "proximal", "saúde", "saude", "colo"],
    body: `O contorno proximal correto (côncavo no cervical → convexo ao contato) ajuda a preservar o periodonto e o ponto de contato. Excesso de contorno ou ângulos retos prejudicam a higiene. Na escultura, modele a transição proximal com cuidado e recupere a concavidade cervical se ela sumir nos ajustes.`,
  },
  {
    id: "oclusao-basica",
    title: "Noções de oclusão",
    tags: ["oclusão", "oclusao", "contato", "guia", "canina", "mútua", "mutua"],
    body: `Oclusão é a relação entre arcadas em função. Conceitos úteis: contatos cêntricos estáveis, guias (canina ou função de grupo), evitar interferências oclusais. Em molares/pré-molares esculpidos, a morfologia oclusal (cúspides, fossas, sulcos) deve permitir contatos coerentes — por isso não destrua cristas marginais nem aprofunde fossas em excesso.`,
  },
  {
    id: "carie-basico",
    title: "Cárie — conceitos básicos",
    tags: ["cárie", "carie", "biofilme", "desmineralização", "desmineralizacao", "restauração", "restauracao"],
    body: `Cárie é doença biofilme-açúcar mediada: ácidos desmineralizam esmalte/dentina. Prevenção: higiene, flúor, controle de dieta. Tratamento depende da extensão (remineralização, restauração, endodontia). O assistente educa conceitos; diagnóstico e plano de tratamento exigem avaliação clínica presencial.`,
  },
  {
    id: "endodontia-basico",
    title: "Endodontia — visão geral",
    tags: ["endodontia", "canal", "polpa", "necrose", "tratamento", "raiz"],
    body: `Endodontia trata a polpa e os canais radiculares. Indicações típicas: pulpites irreversíveis, necrose, abscesso de origem endodôntica. Etapas gerais: acesso, instrumentação, irrigação, obturação e restauração coronária. Anatomia do canal varia por dente — molares são mais complexos. Não substitui avaliação clínica.`,
  },
  {
    id: "periodontia-basico",
    title: "Periodontia — visão geral",
    tags: ["periodontia", "gengivite", "periodontite", "placa", "cálculo", "calculo", "bolsa"],
    body: `Gengivite: inflamação reversível da gengiva por biofilme. Periodontite: perda de inserção e osso, com bolsas. Tratamento: controle de biofilme, raspagem, às vezes cirurgia. Fatores de risco: higiene, tabaco, diabetes. Educação e prevenção são centrais.`,
  },
  {
    id: "protese-basico",
    title: "Prótese e reabilitação — visão geral",
    tags: ["prótese", "protese", "coroa", "ponte", "implante", "faceta", "reabilitação", "reabilitacao"],
    body: `Prótese devolve função e estética: unitárias (coroa), parciais, totais, sobre implantes; facetas e onlays. O preparo e a anatomia oclusal/proximal influenciam longevidade. A escultura em cera treina exatamente essa leitura anatômica para enceramento e restaurações.`,
  },
  {
    id: "radiologia-basico",
    title: "Radiologia odontológica — noções",
    tags: ["radiografia", "raio", "x", "periapical", "panorâmica", "panoramica", "rx"],
    body: `Radiografias auxiliares: periapical (dente e periápice), interproximal/bite-wing (cáries proximais e cristas), panorâmica (visão ampla). Interpretação exige correlação clínica. O assistente explica conceitos; laudo formal é ato profissional.`,
  },
  {
    id: "anestesia-basico",
    title: "Anestesia local — noções",
    tags: ["anestesia", "anestésico", "anestesico", "infiltração", "infiltracao", "bloqueio", "lidocaína", "lidocaina"],
    body: `Anestesia local permite procedimentos com conforto. Técnicas comuns: infiltração e bloqueios regionais (ex.: alveolar inferior). Considerar dose máxima, vasoconstritor, histórico médico e contraindicações. Somente profissional habilitado administra — aqui o foco é compreensão teórica.`,
  },
  {
    id: "urgencia-basico",
    title: "Urgências odontológicas — orientação educacional",
    tags: ["urgência", "urgencia", "dor", "abscesso", "trauma", "avulsão", "avulsao"],
    body: `Dor intensa, abscesso, trauma e avulsão exigem atendimento presencial. Em avulsão de dente permanente: reimplante imediato se possível, ou conservar em leite/soro e buscar atendimento rápido. O assistente não faz triagem clínica completa nem prescreve medicamentos.`,
  },
  {
    id: "etica-limites",
    title: "Limites do assistente educacional",
    tags: ["diagnóstico", "diagnostico", "prescrição", "prescricao", "receita", "tratar", "medicamento", "limites"],
    body: `O assistente do GB Dental é educacional em odontologia ampla: anatomia, clínica, especialidades e também escultura. Não substitui professor, dentista ou avaliação presencial. Não prescreve medicamentos nem fecha diagnóstico clínico. Em dúvida de saúde, oriente busca a profissional.`,
  },
  {
    id: "gb-materiais-pagina",
    title: "Materiais do passo a passo GB Dental",
    tags: ["gb", "materiais", "cera", "lecron", "tabela", "medida"],
    body: `Nas páginas de escultura do app: use os valores da tabela oferecida (altura, MD, VL), marque com Lecron e siga as etapas. Imagens-guia mostram a face em trabalho. Link típico: /app/escultura/{FDI}. Para outras dúvidas de odontologia, pergunte livremente à assistente.`,
  },
  {
    id: "mapa-especialidades",
    title: "Mapa das especialidades odontológicas",
    tags: ["especialidade", "especialidades", "odontologia", "áreas", "areas", "mapa"],
    body: `Áreas clássicas: dentística (restaurações), endodontia (canais), periodontia (gengiva/osso), prótese (reabilitação), ortodontia (alinhamento), cirurgia bucomaxilofacial, odontopediatria, radiologia, estomatologia/patologia, implantodontia, oclusão/DTM, odontologia preventiva e saúde coletiva. A assistente explica conceitos de todas; escultura em cera é módulo didático extra do GB Dental.`,
  },
  {
    id: "histologia-dental",
    title: "Tecidos dentários — esmalte, dentina, polpa e cemento",
    tags: ["esmalte", "dentina", "polpa", "cemento", "histologia", "tecido", "tecidos"],
    body: `Esmalte: tecido mineralizado mais duro do corpo, acelular, sofre desmineralização por ácidos. Dentina: tubular, sensível, produzida pelos odontoblastos. Polpa: tecido conjuntivo com nervos e vasos — inflamação = pulpite. Cemento: cobre a raiz e ancora o ligamento periodontal. Cemento-esmalte (JCE) é marco clínico e radiográfico.`,
  },
  {
    id: "erupcao-dentição",
    title: "Erupção e dentições",
    tags: ["erupção", "erupcao", "decidua", "decídua", "permanente", "dentição", "denticao", "cronologia"],
    body: `Dentição decídua: 20 dentes; erupção tipicamente entre ~6 meses e 2,5 anos. Permanente: 32 dentes; primeiros permanentes (~6 anos) e troca até adolescência. Cronologia varia; atraso ou assimetria marcante merece avaliação. Nomenclatura decídua FDI usa quadrantes 5–8.`,
  },
  {
    id: "dentistica-restauradora",
    title: "Dentística restauradora",
    tags: ["dentística", "dentistica", "restauração", "restauracao", "resina", "amálgama", "amalgama", "adesivo", "classe"],
    body: `Dentística restaura forma, função e estética. Preparos clássicos (Black) e abordagem moderna mínima invasiva. Materiais: resina composta (adesiva), ionômero de vidro, amálgama (ainda ensinado), cerâmicas indiretas. Princípios: isolamento, adesão, contorno, ponto de contato, oclusão e polimento. Classes I–VI descrevem localização da lesão/preparo.`,
  },
  {
    id: "materiais-dentarios",
    title: "Materiais odontológicos — visão geral",
    tags: ["material", "materiais", "resina", "cimento", "ionômero", "ionomero", "cerâmica", "ceramica", "zirônia", "zirconia"],
    body: `Materiais comuns: resinas compostas (fotopolimerizáveis), cimentos (fosfato de zinco, ionômero, resinosos), cerâmicas e zircônia em prótese, ligas metálicas, alginato/silicone em moldagem. Escolha depende de indicação, carga oclusal, estética e isolamento. Propriedades-chave: resistência, adesão, biocompatibilidade e estabilidade dimensional.`,
  },
  {
    id: "ortodontia-basico",
    title: "Ortodontia — conceitos básicos",
    tags: ["ortodontia", "aparelho", "alinhador", "má-oclusão", "ma-oclusao", "classe", "angle", "bracket"],
    body: `Ortodontia corrige má-oclusão e alinhamento. Classificação de Angle (Classes I, II, III) descreve relação molar/canina. Aparelhos fixos, removíveis e alinhadores. Diagnóstico envolve models, fotos, radiografias e análise facial. Força excessiva pode reabsorver raiz — planejamento é essencial. Conteúdo educacional; plano ortodôntico é individual.`,
  },
  {
    id: "cirurgia-basico",
    title: "Cirurgia oral — noções",
    tags: ["cirurgia", "extração", "extracao", "exodontia", "siso", "terceiro", "molar", "sutura"],
    body: `Exodontia simples vs. cirúrgica (retidos, raízes curvas, sisos). Avaliação prévia: anamnese, imagem, risco de nervo alveolar/lingual em inferiores. Cuidados pós: hemostasia, higiene suave, evitar esforço no local conforme orientação. Complicações possíveis: alveolite, infecção, parestesia — exigem retorno clínico.`,
  },
  {
    id: "implantodontia-basico",
    title: "Implantodontia — visão geral",
    tags: ["implante", "implantes", "osseointegração", "osseointegracao", "carga", "pilar"],
    body: `Implante osseointegrado substitui raiz perdida. Etapas típicas: planejamento (clínico + tomografia), instalação, osseointegração, reabilitação protética. Sucesso depende de osso, higiene, oclusão e saúde sistêmica (ex.: tabaco, diabetes controlada). Não é “parafuso mágico”: manutenção periodontal/peri-implantar é contínua.`,
  },
  {
    id: "odontopediatria-basico",
    title: "Odontopediatria — noções",
    tags: ["odontopediatria", "criança", "crianca", "infantil", "decíduo", "deciduo", "selante", "flúor", "fluor"],
    body: `Foco em prevenção, manejo comportamental e tratamento da dentição decídua/mista. Selantes, flúor tópico, orientação aos responsáveis. Trauma dentário é frequente. Pulpotomia/pulpectomia em decíduos seguem indicações próprias. Comunicação lúdica e consentimento dos responsáveis são centrais.`,
  },
  {
    id: "estomatologia-basico",
    title: "Estomatologia e lesões bucais",
    tags: ["estomatologia", "lesão", "lesao", "afta", "úlcera", "ulcera", "leucoplasia", "mucosa", "biopsia", "biópsia"],
    body: `Estomatologia avalia mucosa, língua, lábios e glândulas. Aftas comuns costumam ser autolimitadas; úlceras persistentes (>2 semanas), leucoplasias e eritroplasias merecem investigação. Biópsia quando indicada. Nunca “fechar” diagnóstico de câncer ou doença sistêmica só por chat — orientar avaliação presencial.`,
  },
  {
    id: "farmacologia-basico",
    title: "Farmacologia odontológica — noções",
    tags: ["farmacologia", "antibiótico", "antibiotico", "analgésico", "analgesico", "anti-inflamatório", "antiinflamatorio", "aine"],
    body: `Na odontologia, analgésicos/AINEs e, em infecções selecionadas, antibióticos fazem parte do arsenal clínico. Indicação, dose, interação e alergia são decisão do profissional. Resistência antimicrobiana exige uso racional. A assistente explica classes e conceitos — não monta receita.`,
  },
  {
    id: "prevencao-higiene",
    title: "Prevenção e higiene bucal",
    tags: ["prevenção", "prevencao", "higiene", "escova", "fio", "dental", "flúor", "fluor", "biofilme"],
    body: `Base da saúde bucal: remoção mecânica do biofilme (escova + fio), flúor, dieta com menos açúcar frequente, visitas regulares. Técnica de escovação e limpeza interdental importam mais que “força”. Enxaguatórios são adjuvantes, não substitutos. Educação do paciente é parte do tratamento.`,
  },
  {
    id: "dtm-oclusao",
    title: "DTM e disfunção temporomandibular",
    tags: ["dtm", "atm", "articulação", "articulacao", "mandíbula", "mandibula", "bruxismo", "ranger"],
    body: `DTM envolve músculos, ATM e estruturas associadas: dor, estalos, limitação de abertura. Bruxismo (ranger/apertar) pode sobrecarregar. Abordagem multidisciplinar: educação, placas em casos selecionados, fisioterapia, controle de fatores. Evite “autotratamento” agressivo; avaliação clínica é necessária.`,
  },
  {
    id: "anamnese-exame",
    title: "Anamnese e exame clínico",
    tags: ["anamnese", "exame", "clínico", "clinico", "histórico", "historico", "sinais", "sintomas"],
    body: `Anamnese: queixa principal, história médica/odontológica, medicamentos, alergias, hábitos. Exame: inspeção extra/intraoral, palpação, percussão, vitalidade quando indicada, periodonto e oclusão. Sempre correlacionar com exames de imagem. Documentação clara protege paciente e profissional.`,
  },
  {
    id: "biosseguranca",
    title: "Biossegurança no consultório",
    tags: ["biossegurança", "biosseguranca", "EPI", "esterilização", "esterilizacao", "infecção", "infeccao", "luva"],
    body: `EPIs, lavagem/antissepsia das mãos, barreira, desinfecção de superfícies e esterilização de instrumentais são obrigatórios. Cadeia asséptica reduz infecção cruzada. Descarte de perfurocortantes em recipiente adequado. Normas sanitárias locais devem ser seguidas.`,
  },
  {
    id: "anatomia-cabeça",
    title: "Anatomia de cabeça e pescoço (resumo útil)",
    tags: ["anatomia", "nervo", "trigêmeo", "trigemeo", "alveolar", "artéria", "arteria", "músculo", "musculo"],
    body: `Nervo trigêmeo (V) inerva dentes e face; ramos maxilar e mandibular são críticos em anestesia. Nervo alveolar inferior e lingual: risco em cirurgia de sisos inferiores. Músculos da mastigação: masseter, temporal, pterigóideos. Irrigação: ramos da artéria maxilar. Conhecer trajetos evita acidentes e explica sintomas.`,
  },
  {
    id: "tomografia-imagem",
    title: "Tomografia e exames de imagem avançados",
    tags: ["tomografia", "cbct", "tc", "cone", "beam", "imagem"],
    body: `CBCT (tomografia cone beam) oferece cortes 3D para implantes, canais complexos, dentes retidos e lesões. Maior dose que periapical — indicação criteriosa (ALARA). Não substitui exame clínico. Interpretação exige treinamento.`,
  },
  {
    id: "saude-coletiva",
    title: "Odontologia em saúde coletiva",
    tags: ["coletiva", "SUS", "saúde", "saude", "pública", "publica", "epidemiologia", "promoção", "promocao"],
    body: `Saúde coletiva foca promoção, prevenção e acesso. Fluoretação da água, programas escolares, vigilância de cárie/periodontite. Determinantes sociais influenciam doença bucal. O dentista também atua em equipe multiprofissional e políticas públicas.`,
  },
  {
    id: "etica-profissional",
    title: "Ética e exercício profissional",
    tags: ["ética", "etica", "CRO", "prontuário", "prontuario", "consentimento", "sigilo"],
    body: `Exercício regulamentado (inscrição no CRO), sigilo, consentimento informado, prontuário completo e publicidade responsável. Procedimentos fora da competência ou sem habilitação são infração. A assistente educa — não orienta burlar normas.`,
  },
];

export const DENTAL_KNOWLEDGE: KnowledgeChunk[] = [...CORE_KNOWLEDGE, ...EXTRA_KNOWLEDGE];

export interface ToothContext {
  number: string;
  name: string;
  measures: string;
  anatomy: string;
  sculptureTips: string;
}

const TOOTH_CARD: Record<string, Omit<ToothContext, "number">> = {
  "11": {
    name: "Incisivo central superior direito",
    measures: "Altura 10,5 mm · MD 8,5 mm · VL 7,0 mm",
    anatomy: "Coroa alargada; MI ~90°; DI arredondado; fossa + cíngulo lingual.",
    sculptureTips: "Comece proximais pela mesial; não deixe lingual em “poltrona”; refine MI ≠ DI.",
  },
  "21": {
    name: "Incisivo central superior esquerdo",
    measures: "Altura 10,5 mm · MD 8,5 mm · VL 7,0 mm",
    anatomy: "Espelho do 11; mesial à linha média.",
    sculptureTips: "Mesmo roteiro do 11, com mesial/distal coerentes ao lado esquerdo.",
  },
  "12": {
    name: "Incisivo lateral superior direito",
    measures: "Altura 9,0 mm · MD 6,5 mm · VL 6,0 mm",
    anatomy: "Mais estreito que o central; distal bem arredondada.",
    sculptureTips: "Não copie o volume do 11; distal mais inclinada/arredondada.",
  },
  "13": {
    name: "Canino superior direito",
    measures: "Altura 10,5 mm · MD 7,9 mm · VL 8,4 mm",
    anatomy: "Cúspide única; pentágono vestibular; crista lingual intermediária.",
    sculptureTips: "Preserve a “lança”; desgaste mais na distal; não iguale braços M/D.",
  },
  "14": {
    name: "1º pré-molar superior direito",
    measures: "Altura 8,5 mm · MD 7,0 mm · VL 9,0 mm",
    anatomy: "V > L; sulco central; fossas M/D.",
    sculptureTips: "Etapa extra de sulcos oclusais; preserve cristas e pontas.",
  },
  "15": {
    name: "2º pré-molar superior direito",
    measures: "Altura 8,0 mm · MD 7,0 mm · VL 8,5 mm",
    anatomy: "Cúspides mais simétricas; oclusal oval.",
    sculptureTips: "Sulco central mais curto; não aprofunde demais.",
  },
  "16": {
    name: "1º molar superior direito",
    measures: "Altura 7,5 mm · MD 10,5 mm · VL 11,0 mm",
    anatomy: "4 cúspides + possível Carabelli; crista oblíqua DV–ML.",
    sculptureTips: "Preserve crista oblíqua; sulcos rasos; fossa central controlada.",
  },
  "17": {
    name: "2º molar superior direito",
    measures: "Altura 7,0 mm · MD 10,0 mm · VL 10,0 mm",
    anatomy: "Padrão molar superior mais compacto; DL menor com frequência.",
    sculptureTips: "Mesma lógica do 16 em escala menor.",
  },
  "46": {
    name: "1º molar inferior direito",
    measures: "Altura 7,5 mm · MD 11,0 mm · VL 10,5 mm",
    anatomy: "5 cúspides; padrão em Y.",
    sculptureTips: "Marque o Y antes de aprofundar; 5 cúspides bem definidas.",
  },
  "36": {
    name: "1º molar inferior esquerdo",
    measures: "Altura 7,5 mm · MD 11,0 mm · VL 10,5 mm",
    anatomy: "5 cúspides; padrão em Y (espelho do 46).",
    sculptureTips: "Mesma sequência do 46 com orientação do lado esquerdo.",
  },
};

export function getToothContext(toothNumber?: string): ToothContext | null {
  if (!toothNumber) return null;
  const n = String(toothNumber);
  const card = TOOTH_CARD[n];
  if (card) return { number: n, ...card };

  const pos = Number(n) % 10;
  const kind =
    pos === 1 || pos === 2
      ? "incisivo"
      : pos === 3
        ? "canino"
        : pos === 4 || pos === 5
          ? "pré-molar"
          : "molar";
  return {
    number: n,
    name: `Dente FDI ${n} (${kind})`,
    measures: "Consulte a tabela da página de escultura.",
    anatomy: `Revise anatomia específica do ${kind} na aula e no roteiro do app.`,
    sculptureTips: `Abra /app/escultura/${n} e siga as etapas com a face em trabalho.`,
  };
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

const STOPWORDS = new Set([
  "que",
  "qual",
  "quais",
  "como",
  "para",
  "por",
  "com",
  "uma",
  "uns",
  "das",
  "dos",
  "nas",
  "nos",
  "pelo",
  "pela",
  "sobre",
  "entre",
  "quando",
  "onde",
  "porque",
  "pois",
  "mais",
  "menos",
  "muito",
  "muita",
  "pode",
  "podem",
  "seria",
  "sendo",
  "esse",
  "essa",
  "este",
  "esta",
  "isso",
  "aqui",
  "ainda",
  "tambem",
  "depois",
  "antes",
  "fazer",
  "explica",
  "explique",
  "fale",
  "diga",
  "quero",
  "saber",
  "duvida",
  "pergunta",
]);

/** Sinônimos / expansões para recuperar mais trechos e depois filtrar. */
const QUERY_EXPAND: Record<string, string[]> = {
  carie: ["carie", "biofilme", "desmineralizacao", "fluor", "selante"],
  canal: ["endodontia", "polpa", "necrose", "raiz", "pulpite", "obturacao"],
  endodontia: ["canal", "polpa", "necrose", "obturacao", "pulpite", "irrigacao", "hipoclorito"],
  pulpite: ["endodontia", "polpa", "dor", "canal", "vitalidade"],
  gengiva: ["periodontia", "gengivite", "periodontite", "placa", "periodonto"],
  periodontite: ["periodontia", "gengivite", "bolsa", "osso", "insercao", "periodonto"],
  gengivite: ["periodontia", "periodontite", "placa", "biofilme", "sangramento"],
  implante: ["implantes", "osseointegracao", "protese", "peri", "cbct"],
  ortodontia: ["aparelho", "angle", "oclusao", "alinhador", "classe"],
  angle: ["ortodontia", "classe", "molar", "oclusao"],
  radiografia: ["radiologia", "periapical", "panoramica", "rx", "bitewing", "cbct"],
  cbct: ["tomografia", "radiologia", "implante", "cone"],
  tomografia: ["cbct", "radiologia", "cone"],
  anestesia: ["bloqueio", "infiltracao", "lidocaina", "trigemeo", "alveolar", "nai"],
  alveolar: ["anestesia", "bloqueio", "nai", "mandibular"],
  escultura: ["cera", "lecron", "regressiva", "ceroplastia", "roteiro"],
  cera: ["escultura", "lecron", "regressiva"],
  oclusao: ["contato", "guia", "dtm", "cuspide", "canina", "interferencia"],
  protese: ["coroa", "faceta", "implante", "reabilitacao", "preparo", "chanfro"],
  extracao: ["cirurgia", "exodontia", "siso"],
  siso: ["cirurgia", "terceiro", "molar", "exodontia", "retido"],
  anatomia: ["faces", "fdi", "esmalte", "dentina", "incisivo", "molar"],
  fdi: ["nomenclatura", "faces", "quadrante"],
  bruxismo: ["dtm", "atm", "oclusao"],
  antibiotico: ["farmacologia", "infeccao", "aine"],
  dor: ["urgencia", "abscesso", "pulpite", "endodontia", "analgesico"],
  resina: ["dentistica", "adesao", "composta", "black"],
  adesao: ["resina", "dentistica", "acido", "primer"],
  black: ["classe", "cavidade", "dentistica", "preparo"],
  trauma: ["avulsao", "reimplante", "urgencia"],
  selante: ["prevencao", "odontopediatria", "fluor", "carie"],
};

function expandTokens(tokens: string[]): Set<string> {
  const out = new Set(tokens);
  for (const tok of tokens) {
    const extra = QUERY_EXPAND[tok];
    if (extra) for (const e of extra) out.add(normalizeText(e));
  }
  return out;
}

export interface ScoredChunk {
  chunk: KnowledgeChunk;
  score: number;
}

function toothKindTags(toothNumber: string): string[] {
  const pos = Number(toothNumber) % 10;
  if (pos === 1 || pos === 2) return ["incisivo", "anterior"];
  if (pos === 3) return ["canino", "anterior"];
  if (pos === 4 || pos === 5) return ["pre-molar", "premolar", "posterior"];
  return ["molar", "posterior"];
}

/**
 * Busca amplamente na base e filtra pelos trechos mais relevantes.
 * candidateLimit: quantos candidatos pontuar; limit: quantos devolver após filtro.
 */
export function retrieveKnowledgeScored(
  question: string,
  options?: {
    limit?: number;
    candidateLimit?: number;
    minScore?: number;
    toothNumber?: string;
  },
): ScoredChunk[] {
  const limit = options?.limit ?? 4;
  const candidateLimit = options?.candidateLimit ?? 12;
  const minScore = options?.minScore ?? 3;
  const toothNumber = options?.toothNumber?.trim();

  const rawTokens = tokenize(question);
  if (toothNumber) {
    rawTokens.push(toothNumber);
    rawTokens.push(...toothKindTags(toothNumber));
  }
  const tokens = expandTokens(rawTokens);
  if (!tokens.size) {
    return DENTAL_KNOWLEDGE.filter((c) =>
      ["mapa-especialidades", "etica-limites", "prevencao-higiene"].includes(c.id),
    ).map((chunk) => ({ chunk, score: 1 }));
  }

  const qNorm = normalizeText(question);

  const scored: ScoredChunk[] = DENTAL_KNOWLEDGE.map((chunk) => {
    let score = 0;
    const titleNorm = normalizeText(chunk.title);
    const bodyNorm = normalizeText(chunk.body);
    const tagNorms = chunk.tags.map((t) => normalizeText(t));

    // Match exato de tag
    for (const tag of tagNorms) {
      if (tokens.has(tag)) score += 5;
      else if ([...tokens].some((tok) => tag.includes(tok) || tok.includes(tag))) score += 3;
    }

    // Título
    for (const tok of tokens) {
      if (titleNorm.includes(tok)) score += 4;
    }

    // Corpo
    const bodyTokens = new Set(tokenize(`${chunk.title} ${chunk.body}`));
    let bodyHits = 0;
    for (const tok of tokens) {
      if (bodyTokens.has(tok) || bodyNorm.includes(tok)) bodyHits += 1;
    }
    score += bodyHits;

    // Frase / id no texto da pergunta
    if (qNorm.includes(normalizeText(chunk.id.replace(/-/g, " ")))) score += 4;
    for (const tag of tagNorms) {
      if (tag.length > 3 && qNorm.includes(tag)) score += 2;
    }

    // Boost FDI / grupo dentário selecionado
    if (toothNumber) {
      if (tagNorms.includes(toothNumber) || bodyNorm.includes(toothNumber)) score += 6;
      for (const kind of toothKindTags(toothNumber)) {
        if (tagNorms.includes(normalizeText(kind))) score += 2;
      }
    }

    // Escultura: se a pergunta não é de escultura, penaliza chunks só de cera
    const sculptureHeavy = /escultur|cera|lecron|regressiv|ceroplast/.test(
      `${chunk.id} ${chunk.tags.join(" ")}`,
    );
    const qSculpture = /escultur|cera|lecron|regressiv|sulco oclus|fase|roteiro/.test(qNorm);
    if (sculptureHeavy && !qSculpture) score -= 4;

    return { chunk, score };
  })
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    if (minScore > 1) {
      return retrieveKnowledgeScored(question, {
        limit,
        candidateLimit,
        minScore: 1,
        toothNumber,
      });
    }
    return DENTAL_KNOWLEDGE.filter((c) =>
      ["mapa-especialidades", "etica-limites", "prevencao-higiene"].includes(c.id),
    ).map((chunk) => ({ chunk, score: 1 }));
  }

  // Diversidade: evita vários trechos quase iguais no topo
  const picked: ScoredChunk[] = [];
  const usedPrefixes = new Set<string>();
  for (const item of scored.slice(0, candidateLimit)) {
    const prefix = item.chunk.id.split("-")[0] ?? item.chunk.id;
    if (usedPrefixes.has(prefix) && picked.length >= 2) continue;
    usedPrefixes.add(prefix);
    picked.push(item);
    if (picked.length >= limit) break;
  }

  return picked.length ? picked : scored.slice(0, limit);
}

/** Recupera trechos mais relevantes para a pergunta. */
export function retrieveKnowledge(question: string, limit = 5): KnowledgeChunk[] {
  return retrieveKnowledgeScored(question, { limit, candidateLimit: 14, minScore: 3 }).map(
    (s) => s.chunk,
  );
}

/** Detecta se a pergunta é sobre escultura/cera (para contextualizar o módulo do app). */
export function isSculptureQuestion(question: string): boolean {
  const q = normalizeText(question);
  return /escultur|cera|lecron|ceroplast|regressiv|sulco|fase|roteiro|bloco de cera|margem de seguranca/.test(
    q,
  );
}

/**
 * Extrai frases curtas e úteis de um trecho (para resposta local direta).
 */
export function extractKeyPoints(body: string, maxPoints = 3): string[] {
  const sentences = body
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim().replace(/\s+/g, " "))
    .filter((s) => s.length > 20 && s.length < 260);
  return sentences.slice(0, maxPoints);
}
