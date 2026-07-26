import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "../lib/api";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (productId: number) => void;
  clear: () => void;
  totalCents: number;
  count: number;
}

const CartContext = createContext<CartState | null>(null);
const CART_KEY = "gbd_cart";

function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const persist = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const add = (product: Product) => {
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      persist(items.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      persist([...items, { product, quantity: 1 }]);
    }
  };

  const remove = (productId: number) => {
    persist(items.filter((i) => i.product.id !== productId));
  };

  const clear = () => persist([]);

  const totalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price_cents * i.quantity, 0),
    [items],
  );
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, add, remove, clear, totalCents, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart fora do CartProvider");
  return ctx;
}
