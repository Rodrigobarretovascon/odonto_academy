export type NewsCategory =
  | "conteudo"
  | "plataforma"
  | "resumo"
  | "video"
  | "modelo-3d"
  | "produto";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string; // ISO date
  category: NewsCategory;
  href?: string;
};

/** Novidades gerenciáveis sem alterar páginas — acrescente itens aqui ou via API futura. */
export const NEWS_ITEMS: NewsItem[] = [
  {
    id: "n-2026-07-atlas",
    title: "Atlas de anatomia atualizado",
    summary: "Novas jornadas e imagens no atlas dental da área de assinantes.",
    publishedAt: "2026-07-20",
    category: "conteudo",
    href: "/app/anatomia",
  },
  {
    id: "n-2026-07-viewer",
    title: "Visualizador 3D dedicado",
    summary: "Modelos Dundee concentrados em uma aba exclusiva com rotação e zoom.",
    publishedAt: "2026-07-28",
    category: "modelo-3d",
    href: "/app/visualizador-3d",
  },
  {
    id: "n-2026-07-loja",
    title: "Novos produtos na loja",
    summary: "Catálogo ampliado com materiais e kits para estudo e clínica.",
    publishedAt: "2026-07-15",
    category: "produto",
    href: "/loja",
  },
];

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  conteudo: "Conteúdo",
  plataforma: "Plataforma",
  resumo: "Resumo",
  video: "Vídeo",
  "modelo-3d": "Modelo 3D",
  produto: "Produto",
};
