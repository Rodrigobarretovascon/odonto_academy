const API = import.meta.env.VITE_API_URL ?? "/api";

function headers(token?: string | null): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function api<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...headers(token), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Erro na requisição");
  return data as T;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price_cents: number;
  promo_price_cents?: number | null;
  effective_price_cents?: number;
  type: string;
  access_days: number;
  image_url: string;
  image_urls?: string[];
  images?: Array<{ id: number; image_url: string }>;
  badge: string;
  featured: boolean;
  stock_qty?: number | null;
  characteristics?: string[];
  applications?: string[];
  volume_prices?: Array<{ min_qty: number; unit_price_cents: number }>;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
