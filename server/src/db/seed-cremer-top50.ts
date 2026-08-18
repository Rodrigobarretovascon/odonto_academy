/**
 * 50 itens mais procurados (perfil revenda Dental Cremer) — Gabriela Barreto Dental.
 *
 * Uso: npm run seed:cremer --prefix server
 */
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { query } from "./pool.js";
import { migrateSchema, nextProductCode, slugify } from "./migrate.js";
import { upsertInventory, upsertPrice } from "../services/stock.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../../.env") });
dotenv.config();

const ROOT = resolve(__dirname, "../../../public");
const PRODUCTS_DIR = join(ROOT, "uploads/products");

type ProductSeed = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price_cents: number;
  promo_price_cents?: number | null;
  badge: string | null;
  featured: boolean;
  sort_order: number;
  stock_qty: number;
  characteristics: string[];
  applications: string[];
};

/** Top 50 — consumo clínico / laboratório (mais buscados em e-commerce odontológico). */
const PRODUCTS: ProductSeed[] = [
  {
    slug: "luvas-procedimento-m",
    name: "Luvas de Procedimento — Tam. M",
    subtitle: "Caixa c/ 100 · látex com pó",
    description:
      "Luvas de procedimento descartáveis, tamanho M. Alta procura em consultórios e clínicas. Embalagem com 100 unidades.",
    price_cents: 2890,
    badge: "Essencial",
    featured: true,
    sort_order: 100,
    stock_qty: 200,
    characteristics: ["100 un.", "Tam. M", "Descartável"],
    applications: ["Atendimento", "Clínica geral", "Estágio"],
  },
  {
    slug: "luvas-nitrilo-m",
    name: "Luvas de Nitrilo — Tam. M",
    subtitle: "Caixa c/ 100 · sem pó · azul",
    description:
      "Luvas de nitrilo sem pó, hipoalergênicas. Ideal para quem evita látex. Caixa com 100 unidades, tamanho M.",
    price_cents: 4590,
    badge: "Mais vendido",
    featured: true,
    sort_order: 101,
    stock_qty: 150,
    characteristics: ["Nitrilo", "Sem pó", "100 un."],
    applications: ["Procedimentos", "Cirurgia", "Clínica"],
  },
  {
    slug: "mascara-cirurgica-tripla",
    name: "Máscara Cirúrgica Tripla",
    subtitle: "Caixa c/ 50 · elástico",
    description:
      "Máscara descartável de três camadas com elástico. Proteção básica para atendimento diário.",
    price_cents: 1990,
    badge: null,
    featured: false,
    sort_order: 102,
    stock_qty: 180,
    characteristics: ["50 un.", "Tripla camada", "Elástico"],
    applications: ["Atendimento", "EPI", "Consultório"],
  },
  {
    slug: "alcool-70-spray",
    name: "Álcool 70% Spray",
    subtitle: "500 ml · antisséptico",
    description:
      "Álcool etílico 70% em spray para desinfecção de superfícies e mãos (conforme protocolo da clínica).",
    price_cents: 1890,
    badge: null,
    featured: false,
    sort_order: 103,
    stock_qty: 90,
    characteristics: ["500 ml", "70%", "Spray"],
    applications: ["Biossegurança", "Superfícies", "EPI"],
  },
  {
    slug: "sugador-saliva-descartavel",
    name: "Sugador de Saliva Descartável",
    subtitle: "Pacote c/ 100 · flexível",
    description:
      "Sugadores salivares descartáveis, flexíveis e confortáveis. Item de altíssimo giro na clínica.",
    price_cents: 2490,
    badge: "Essencial",
    featured: true,
    sort_order: 104,
    stock_qty: 220,
    characteristics: ["100 un.", "Flexível", "Descartável"],
    applications: ["Atendimento", "Restauração", "Profilaxia"],
  },
  {
    slug: "babador-descartavel",
    name: "Babador Descartável",
    subtitle: "Pacote c/ 100 · com elástico",
    description:
      "Babadores descartáveis com elástico, absorventes. Proteção do paciente em consultas e procedimentos.",
    price_cents: 3290,
    badge: null,
    featured: false,
    sort_order: 105,
    stock_qty: 160,
    characteristics: ["100 un.", "Elástico", "Absorvente"],
    applications: ["Consulta", "Clínica", "Estética"],
  },
  {
    slug: "resina-composta-a2",
    name: "Resina Composta A2",
    subtitle: "Seringa 4 g · micropartículas",
    description:
      "Resina composta fotopolimerizável cor A2 — uma das cores mais usadas em restaurações anteriores e posteriores.",
    price_cents: 8990,
    badge: "Mais vendido",
    featured: true,
    sort_order: 106,
    stock_qty: 80,
    characteristics: ["Cor A2", "4 g", "Fotopolimerizável"],
    applications: ["Restauração", "Estética", "Clínica geral"],
  },
  {
    slug: "resina-composta-a1",
    name: "Resina Composta A1",
    subtitle: "Seringa 4 g · micropartículas",
    description:
      "Resina composta fotopolimerizável cor A1, indicada para dentes claros e restaurações estéticas.",
    price_cents: 8990,
    badge: null,
    featured: false,
    sort_order: 107,
    stock_qty: 70,
    characteristics: ["Cor A1", "4 g", "Fotopolimerizável"],
    applications: ["Restauração", "Estética", "Anterior"],
  },
  {
    slug: "adesivo-universal",
    name: "Adesivo Universal",
    subtitle: "Frasco 5 ml · single bottle",
    description:
      "Sistema adesivo universal (self-etch / total-etch). Alta adesão em esmalte e dentina.",
    price_cents: 18990,
    badge: "Essencial",
    featured: true,
    sort_order: 108,
    stock_qty: 45,
    characteristics: ["5 ml", "Universal", "Single bottle"],
    applications: ["Restauração", "Adesão", "Resina"],
  },
  {
    slug: "acido-fosforico-37",
    name: "Ácido Fosfórico 37%",
    subtitle: "Seringa 2,5 ml · condicionador",
    description:
      "Condicionador ácido fosfórico 37% em seringa com pontas aplicadoras. Etapa clássica do protocolo adesivo.",
    price_cents: 2990,
    badge: null,
    featured: false,
    sort_order: 109,
    stock_qty: 100,
    characteristics: ["37%", "2,5 ml", "Seringa"],
    applications: ["Condicionamento", "Adesão", "Resina"],
  },
  {
    slug: "ionomero-vidro-restaurador",
    name: "Ionômero de Vidro Restaurador",
    subtitle: "Pó + líquido · kit",
    description:
      "Ionômero de vidro para restaurações e bases. Liberação de flúor e boa adesão química.",
    price_cents: 12990,
    badge: null,
    featured: false,
    sort_order: 110,
    stock_qty: 40,
    characteristics: ["Pó + líquido", "Flúor", "Restaurador"],
    applications: ["Restauração", "Base", "Pediatria"],
  },
  {
    slug: "cimento-ionomero-lutamento",
    name: "Cimento de Ionômero — Lutamento",
    subtitle: "Kit pó + líquido",
    description:
      "Cimento de ionômero de vidro para cimentação de coroas, inlays e onlays.",
    price_cents: 14990,
    badge: null,
    featured: false,
    sort_order: 111,
    stock_qty: 35,
    characteristics: ["Lutamento", "Kit", "Ionômero"],
    applications: ["Prótese", "Cimentação", "Coroas"],
  },
  {
    slug: "cimento-resinoso-dual",
    name: "Cimento Resinoso Dual",
    subtitle: "Pasta base + catalisador",
    description:
      "Cimento resinoso de cura dual para cimentação adesiva de peças protéticas e pinos.",
    price_cents: 28990,
    badge: "Premium",
    featured: true,
    sort_order: 112,
    stock_qty: 25,
    characteristics: ["Cura dual", "Adesivo", "Alta resistência"],
    applications: ["Prótese", "Pinos", "Facetas"],
  },
  {
    slug: "anestesico-lidocaina-2",
    name: "Anestésico Lidocaína 2% c/ Epinefrina",
    subtitle: "Tubetes · cx c/ 50",
    description:
      "Anestésico local lidocaína 2% com epinefrina 1:100.000. Um dos mais utilizados na clínica diária. Venda conforme legislação vigente.",
    price_cents: 8990,
    badge: "Mais vendido",
    featured: true,
    sort_order: 113,
    stock_qty: 60,
    characteristics: ["50 tubetes", "Lidocaína 2%", "Epinefrina"],
    applications: ["Anestesia", "Cirurgia", "Clínica"],
  },
  {
    slug: "agulha-gengival-30g",
    name: "Agulha Gengival 30G Curta",
    subtitle: "Caixa c/ 100 · descartável",
    description:
      "Agulhas gengivais 30G curtas para anestesia infiltrativa. Alta precisão e conforto.",
    price_cents: 4590,
    badge: null,
    featured: false,
    sort_order: 114,
    stock_qty: 90,
    characteristics: ["30G", "100 un.", "Curta"],
    applications: ["Anestesia", "Infiltrativa", "Clínica"],
  },
  {
    slug: "algodao-rolo",
    name: "Algodão em Rolo",
    subtitle: "Pacote · uso clínico",
    description:
      "Rolos de algodão hidrófilo para isolamento relativo e absorção durante o atendimento.",
    price_cents: 1590,
    badge: null,
    featured: false,
    sort_order: 115,
    stock_qty: 200,
    characteristics: ["Hidrófilo", "Rolo", "Clínico"],
    applications: ["Isolamento", "Atendimento", "Profilaxia"],
  },
  {
    slug: "gaze-esteril",
    name: "Gaze Estéril 7,5x7,5",
    subtitle: "Pacote c/ 10 · 13 fios",
    description:
      "Compressas de gaze estéril 7,5 x 7,5 cm para procedimentos e curativos bucais.",
    price_cents: 1290,
    badge: null,
    featured: false,
    sort_order: 116,
    stock_qty: 250,
    characteristics: ["Estéril", "7,5x7,5", "13 fios"],
    applications: ["Cirurgia", "Curativo", "Exodontia"],
  },
  {
    slug: "lencol-borracha-medio",
    name: "Lençol de Borracha Médio",
    subtitle: "Caixa c/ 36 · latex",
    description:
      "Lençóis de borracha para isolamento absoluto, espessura média. Essencial em endodontia e adesivos.",
    price_cents: 6990,
    badge: "Essencial",
    featured: true,
    sort_order: 117,
    stock_qty: 55,
    characteristics: ["36 un.", "Médio", "Isolamento"],
    applications: ["Endodontia", "Restauração", "Isolamento absoluto"],
  },
  {
    slug: "kit-grampos-isolamento",
    name: "Kit Grampos de Isolamento",
    subtitle: "Jogo básico · aço inox",
    description:
      "Conjunto de grampos para lençol de borracha em aço inox. Cobertura dos dentes mais usados.",
    price_cents: 24990,
    badge: null,
    featured: false,
    sort_order: 118,
    stock_qty: 20,
    characteristics: ["Inox", "Kit básico", "Autoclavável"],
    applications: ["Isolamento", "Endodontia", "Restauração"],
  },
  {
    slug: "arco-young",
    name: "Arco de Young",
    subtitle: "Plástico · adulto",
    description:
      "Arco de Young para sustentação do lençol de borracha. Leve e confortável.",
    price_cents: 1990,
    badge: null,
    featured: false,
    sort_order: 119,
    stock_qty: 70,
    characteristics: ["Plástico", "Adulto", "Leve"],
    applications: ["Isolamento absoluto", "Endodontia", "Clínica"],
  },
  {
    slug: "brocas-diamantadas-kit-fg",
    name: "Kit Brocas Diamantadas FG",
    subtitle: "12 pontas · alta rotação",
    description:
      "Kit sortido de brocas diamantadas FG para preparo cavitário e acabamento. Autoclaváveis.",
    price_cents: 18990,
    badge: "Mais vendido",
    featured: true,
    sort_order: 120,
    stock_qty: 50,
    characteristics: ["12 pontas", "FG", "Diamantadas"],
    applications: ["Preparo", "Acabamento", "Clínica"],
  },
  {
    slug: "brocas-carbide-kit",
    name: "Kit Brocas Carbide",
    subtitle: "10 un. · corte rápido",
    description:
      "Brocas carbide para corte em metal, resina e provisórios. Alta eficiência de corte.",
    price_cents: 14990,
    badge: null,
    featured: false,
    sort_order: 121,
    stock_qty: 45,
    characteristics: ["10 un.", "Carbide", "Corte rápido"],
    applications: ["Provisórios", "Metal", "Ajuste"],
  },
  {
    slug: "discos-lixa-sof-lex",
    name: "Discos de Lixa para Acabamento",
    subtitle: "Kit sortido · granulações",
    description:
      "Discos abrasivos para acabamento e polimento de resinas. Várias granulações.",
    price_cents: 7990,
    badge: null,
    featured: false,
    sort_order: 122,
    stock_qty: 60,
    characteristics: ["Sortido", "Acabamento", "Polimento"],
    applications: ["Resina", "Estética", "Polimento"],
  },
  {
    slug: "fita-matriz-metalica",
    name: "Fita Matriz Metálica",
    subtitle: "Rolo · aço inox",
    description:
      "Fita matriz metálica para restaurações classe II. Contorno e selamento proximal.",
    price_cents: 2490,
    badge: null,
    featured: false,
    sort_order: 123,
    stock_qty: 85,
    characteristics: ["Metálica", "Rolo", "Inox"],
    applications: ["Classe II", "Restauração", "Posterior"],
  },
  {
    slug: "cunhas-madeira-kit",
    name: "Cunhas de Madeira — Kit",
    subtitle: "Sortidas · anatômicas",
    description:
      "Cunhas de madeira anatômicas para adaptação de matriz em restaurações posteriores.",
    price_cents: 1990,
    badge: null,
    featured: false,
    sort_order: 124,
    stock_qty: 100,
    characteristics: ["Madeira", "Sortidas", "Anatômicas"],
    applications: ["Matriz", "Classe II", "Restauração"],
  },
  {
    slug: "pasta-profilatica",
    name: "Pasta Profilática",
    subtitle: "Pote 90 g · menta",
    description:
      "Pasta para profilaxia com granulometria adequada e sabor menta. Uso com escova Robinson.",
    price_cents: 3490,
    badge: null,
    featured: false,
    sort_order: 125,
    stock_qty: 75,
    characteristics: ["90 g", "Menta", "Profilaxia"],
    applications: ["Limpeza", "Profilaxia", "Clareamento prévio"],
  },
  {
    slug: "escova-robinson-kit",
    name: "Escova Robinson — Kit",
    subtitle: "12 un. · taça / ponta",
    description:
      "Escovas Robinson para profilaxia e polimento, encaixe CA. Kit misto taça e ponta.",
    price_cents: 2990,
    badge: null,
    featured: false,
    sort_order: 126,
    stock_qty: 90,
    characteristics: ["12 un.", "CA", "Taça/ponta"],
    applications: ["Profilaxia", "Polimento", "Clínica"],
  },
  {
    slug: "fluor-gel-acido",
    name: "Flúor Gel Ácido",
    subtitle: "Pote 200 ml · neutro/ácido",
    description:
      "Gel fluoretado para aplicação tópica em moldeiras. Prevenção de cáries.",
    price_cents: 4590,
    badge: null,
    featured: false,
    sort_order: 127,
    stock_qty: 50,
    characteristics: ["200 ml", "Tópico", "Prevenção"],
    applications: ["Prevenção", "Pediatria", "Profilaxia"],
  },
  {
    slug: "clareador-dental-16",
    name: "Clareador Dental 16%",
    subtitle: "Kit caseiro · seringas",
    description:
      "Gel clareador de peróxido de carbamida 16% para uso supervisionado em moldeiras.",
    price_cents: 8990,
    badge: "Estética",
    featured: true,
    sort_order: 128,
    stock_qty: 40,
    characteristics: ["16%", "Caseiro", "Seringas"],
    applications: ["Clareamento", "Estética", "Consultório"],
  },
  {
    slug: "barreira-gengival",
    name: "Barreira Gengival Fotopolimerizável",
    subtitle: "Seringa 2 g · proteção",
    description:
      "Barreira gengival fotopolimerizável para proteção de tecidos moles no clareamento de consultório.",
    price_cents: 6990,
    badge: null,
    featured: false,
    sort_order: 129,
    stock_qty: 45,
    characteristics: ["2 g", "Fotopolimerizável", "Proteção"],
    applications: ["Clareamento", "Estética", "Consultório"],
  },
  {
    slug: "alginato-tipo-ii",
    name: "Alginato Tipo II",
    subtitle: "Pote 453 g · presa regular",
    description:
      "Alginato para moldagens de estudo e trabalho. Presa regular, boa elasticidade e detalhe.",
    price_cents: 5990,
    badge: "Mais vendido",
    featured: true,
    sort_order: 130,
    stock_qty: 65,
    characteristics: ["453 g", "Tipo II", "Presa regular"],
    applications: ["Moldagem", "Estudo", "Prótese"],
  },
  {
    slug: "silicone-adicao-kit",
    name: "Silicone de Adição — Kit",
    subtitle: "Pesada + leve · putty/wash",
    description:
      "Kit de silicone de adição (putty + wash) para moldagens de alta precisão em prótese e estética.",
    price_cents: 34990,
    badge: "Premium",
    featured: true,
    sort_order: 131,
    stock_qty: 18,
    characteristics: ["Putty + wash", "Alta precisão", "Kit"],
    applications: ["Prótese", "Facetas", "Coroas"],
  },
  {
    slug: "gesso-pedra-tipo-iii",
    name: "Gesso Pedra Tipo III",
    subtitle: "Saco 1 kg · amarelo",
    description:
      "Gesso pedra tipo III para modelos de estudo e trabalhos protéticos de rotina.",
    price_cents: 3990,
    badge: null,
    featured: false,
    sort_order: 132,
    stock_qty: 80,
    characteristics: ["1 kg", "Tipo III", "Modelos"],
    applications: ["Laboratório", "Modelos", "Prótese"],
  },
  {
    slug: "gesso-especial-tipo-iv",
    name: "Gesso Especial Tipo IV",
    subtitle: "Saco 1 kg · alta resistência",
    description:
      "Gesso tipo IV de alta resistência para modelos definitivos e trabalhos de precisão.",
    price_cents: 6990,
    badge: null,
    featured: false,
    sort_order: 133,
    stock_qty: 40,
    characteristics: ["1 kg", "Tipo IV", "Alta resistência"],
    applications: ["Laboratório", "Prótese", "Modelos definitivos"],
  },
  {
    slug: "cera-utilidade",
    name: "Cera Utilidade",
    subtitle: "Caixa · lâminas",
    description:
      "Cera utilidade em lâminas para contenção de moldagens, registros e usos laboratoriais.",
    price_cents: 2490,
    badge: null,
    featured: false,
    sort_order: 134,
    stock_qty: 70,
    characteristics: ["Lâminas", "Utilidade", "Laboratório"],
    applications: ["Moldagem", "Registro", "Laboratório"],
  },
  {
    slug: "cera-escultura-blocos",
    name: "Cera para Escultura — 10 Blocos",
    subtitle: "72 g · maleável",
    description:
      "Cera para escultura odontológica com boa maleabilidade e estabilidade. Embalagem com 10 blocos (72 g).",
    price_cents: 2690,
    badge: "Escultura",
    featured: true,
    sort_order: 135,
    stock_qty: 90,
    characteristics: ["10 blocos", "72 g", "Maleável"],
    applications: ["Escultura em cera", "Laboratório", "Estudo"],
  },
  {
    slug: "espatula-lecron-1",
    name: "Espátula Lecron Nº 1",
    subtitle: "Aço inox · golgran-style",
    description:
      "Espátula Lecron número 1 para manipulação e acabamento de cera. Aço inoxidável.",
    price_cents: 1990,
    badge: null,
    featured: false,
    sort_order: 136,
    stock_qty: 60,
    characteristics: ["Inox", "Nº 1", "Autoclavável"],
    applications: ["Escultura", "Cera", "Laboratório"],
  },
  {
    slug: "espatula-hollemback-3s",
    name: "Espátula Hollemback 3S",
    subtitle: "Aço inox · dual",
    description:
      "Instrumento Hollemback 3S para escultura e acabamento de restaurações.",
    price_cents: 3490,
    badge: null,
    featured: false,
    sort_order: 137,
    stock_qty: 40,
    characteristics: ["Inox", "3S", "Dual"],
    applications: ["Restauração", "Escultura", "Acabamento"],
  },
  {
    slug: "kit-exame-clinico",
    name: "Kit Exame Clínico",
    subtitle: "Espelho + sonda + pinça",
    description:
      "Kit básico de exame: espelho bucal, sonda exploradora e pinça clínica. Aço inox.",
    price_cents: 8990,
    badge: "Essencial",
    featured: true,
    sort_order: 138,
    stock_qty: 55,
    characteristics: ["3 peças", "Inox", "Autoclavável"],
    applications: ["Exame", "Consulta", "Estágio"],
  },
  {
    slug: "sonda-periodontal-who",
    name: "Sonda Periodontal WHO",
    subtitle: "Marcações coloridas · inox",
    description:
      "Sonda periodontal com marcações tipo WHO para avaliação de bolsas e sangramento.",
    price_cents: 4590,
    badge: null,
    featured: false,
    sort_order: 139,
    stock_qty: 35,
    characteristics: ["WHO", "Inox", "Periodontia"],
    applications: ["Periodontia", "Diagnóstico", "Clínica"],
  },
  {
    slug: "fotopolimerizador-led-sem-fio",
    name: "Fotopolimerizador LED Sem Fio",
    subtitle: "Alta intensidade · bateria",
    description:
      "Fotopolimerizador LED sem fio, alta intensidade, display e bateria recarregável. Item top de giro.",
    price_cents: 54900,
    badge: "Mais vendido",
    featured: true,
    sort_order: 140,
    stock_qty: 20,
    characteristics: ["LED", "Sem fio", "Recarregável"],
    applications: ["Resina", "Adesivo", "Clareamento"],
  },
  {
    slug: "microaplicadores",
    name: "Microaplicadores Descartáveis",
    subtitle: "Pacote c/ 100 · finos",
    description:
      "Microbrush descartáveis para aplicação precisa de adesivos, ácidos e primers.",
    price_cents: 2990,
    badge: null,
    featured: false,
    sort_order: 141,
    stock_qty: 120,
    characteristics: ["100 un.", "Finos", "Descartável"],
    applications: ["Adesivo", "Ácido", "Endodontia"],
  },
  {
    slug: "limas-endo-kit-25mm",
    name: "Kit Limas Endodônticas 25 mm",
    subtitle: "K-file · sortidas",
    description:
      "Kit de limas tipo K 25 mm em calibres sortidos para instrumentação endodôntica.",
    price_cents: 12990,
    badge: "Endo",
    featured: true,
    sort_order: 142,
    stock_qty: 30,
    characteristics: ["25 mm", "K-file", "Sortidas"],
    applications: ["Endodontia", "Instrumentação", "Canal"],
  },
  {
    slug: "cones-guta-percha",
    name: "Cones de Guta-Percha",
    subtitle: "Caixa · calibres sortidos",
    description:
      "Cones de guta-percha para obturação de canais. Calibres mais usados no dia a dia.",
    price_cents: 4990,
    badge: null,
    featured: false,
    sort_order: 143,
    stock_qty: 50,
    characteristics: ["Guta", "Sortidos", "Obturação"],
    applications: ["Endodontia", "Obturação", "Canal"],
  },
  {
    slug: "cones-papel-absorvente",
    name: "Cones de Papel Absorvente",
    subtitle: "Caixa · sortidos",
    description:
      "Pontas de papel absorvente para secagem do canal antes da obturação.",
    price_cents: 2990,
    badge: null,
    featured: false,
    sort_order: 144,
    stock_qty: 70,
    characteristics: ["Papel", "Sortidos", "Secagem"],
    applications: ["Endodontia", "Secagem", "Canal"],
  },
  {
    slug: "hipoclorito-sodico-25",
    name: "Hipoclorito de Sódio 2,5%",
    subtitle: "Frasco 500 ml · irrigação",
    description:
      "Solução de hipoclorito de sódio 2,5% para irrigação endodôntica.",
    price_cents: 2490,
    badge: null,
    featured: false,
    sort_order: 145,
    stock_qty: 55,
    characteristics: ["2,5%", "500 ml", "Irrigação"],
    applications: ["Endodontia", "Irrigação", "Desinfecção"],
  },
  {
    slug: "edta-17-gel",
    name: "EDTA 17% Gel",
    subtitle: "Seringa · quelante",
    description:
      "Gel de EDTA 17% para remoção de smear layer e abertura dentinária em endodontia.",
    price_cents: 3990,
    badge: null,
    featured: false,
    sort_order: 146,
    stock_qty: 40,
    characteristics: ["17%", "Gel", "Quelante"],
    applications: ["Endodontia", "Smear layer", "Canal"],
  },
  {
    slug: "fio-sutura-seda-3-0",
    name: "Fio de Sutura Seda 3-0",
    subtitle: "Caixa · agulha cortante",
    description:
      "Fio de sutura de seda 3-0 com agulha, para procedimentos cirúrgicos bucais.",
    price_cents: 4590,
    badge: null,
    featured: false,
    sort_order: 147,
    stock_qty: 45,
    characteristics: ["Seda 3-0", "Agulha", "Cirúrgico"],
    applications: ["Cirurgia", "Exodontia", "Sutura"],
  },
  {
    slug: "lamina-bisturi-15",
    name: "Lâmina de Bisturi Nº 15",
    subtitle: "Caixa c/ 100 · estéril",
    description:
      "Lâminas de bisturi número 15 estéreis, encaixe universal. Cirurgia oral e periodontia.",
    price_cents: 3990,
    badge: null,
    featured: false,
    sort_order: 148,
    stock_qty: 60,
    characteristics: ["Nº 15", "100 un.", "Estéril"],
    applications: ["Cirurgia", "Periodontia", "Incisão"],
  },
  {
    slug: "cabo-bisturi-n3",
    name: "Cabo de Bisturi Nº 3",
    subtitle: "Inox · universal",
    description:
      "Cabo de bisturi número 3 em aço inox para lâminas descartáveis.",
    price_cents: 2990,
    badge: null,
    featured: false,
    sort_order: 149,
    stock_qty: 40,
    characteristics: ["Nº 3", "Inox", "Autoclavável"],
    applications: ["Cirurgia", "Periodontia", "Instrumental"],
  },
];

function ensurePlaceholderSvg(slug: string, title: string, dest: string) {
  if (existsSync(dest)) return;
  const short = title.length > 42 ? `${title.slice(0, 40)}…` : title;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FBF7F1"/>
      <stop offset="100%" stop-color="#E6DED2"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <circle cx="640" cy="140" r="90" fill="#D4B98A" opacity="0.35"/>
  <path d="M400 210c-70 0-120 55-120 130 0 95 70 170 120 230 50-60 120-135 120-230 0-75-50-130-120-130z" fill="none" stroke="#0B1D3A" stroke-width="10"/>
  <text x="400" y="620" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#0B1D3A">${escapeXml(short)}</text>
  <text x="400" y="660" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" letter-spacing="3" fill="#9A8558">GABRIELA BARRETO DENTAL</text>
</svg>`;
  writeFileSync(dest, svg, "utf8");
  void slug;
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function seedProducts() {
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  console.log(`\nImportando ${PRODUCTS.length} produtos (top Cremer / revenda)…`);
  for (const p of PRODUCTS) {
    const imageFile = `${p.slug}.svg`;
    const localPath = join(PRODUCTS_DIR, imageFile);
    ensurePlaceholderSvg(p.slug, p.name, localPath);
    const image_url = `/uploads/products/${imageFile}`;

    const existing = await query<{ id: number }>(`SELECT id FROM products WHERE slug = $1`, [p.slug]);
    let id: number;
    if (existing.rows[0]) {
      id = existing.rows[0].id;
      await query(
        `UPDATE products SET
           name=$2, subtitle=$3, description=$4, type='physical', access_days=0,
           image_url=$5, badge=$6, featured=$7, sort_order=$8,
           characteristics=$9, applications=$10, active=true, updated_at=NOW()
         WHERE id=$1`,
        [
          id,
          p.name,
          p.subtitle,
          p.description,
          image_url,
          p.badge,
          p.featured,
          p.sort_order,
          p.characteristics,
          p.applications,
        ],
      );
      console.log(`  ~ ${p.slug}`);
    } else {
      const code = await nextProductCode();
      const inserted = await query<{ id: number }>(
        `INSERT INTO products (
           code, slug, name, subtitle, description, type, access_days, image_url, badge,
           featured, sort_order, characteristics, applications, active
         ) VALUES ($1,$2,$3,$4,$5,'physical',0,$6,$7,$8,$9,$10,$11,true)
         RETURNING id`,
        [
          code,
          slugify(p.slug) || p.slug,
          p.name,
          p.subtitle,
          p.description,
          image_url,
          p.badge,
          p.featured,
          p.sort_order,
          p.characteristics,
          p.applications,
        ],
      );
      id = inserted.rows[0].id;
      console.log(`  + ${p.slug} (${code})`);
    }
    await upsertPrice(id, p.price_cents, p.promo_price_cents ?? null);
    await upsertInventory(id, p.stock_qty);
  }
}

async function main() {
  if (PRODUCTS.length !== 50) {
    throw new Error(`Esperado 50 produtos, veio ${PRODUCTS.length}`);
  }
  console.log("Seed top 50 Dental Cremer (revenda GBD)…");
  await migrateSchema();
  await seedProducts();
  console.log("\nConcluído: 50 produtos ativos na loja.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
