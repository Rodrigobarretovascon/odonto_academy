import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../lib/api";

export interface CartItem {
  product: Product;
  quantity: number;
  /** Preço unitário efetivo (volume/promo); se ausente, usa effective/price do produto */
  unitPriceCents?: number;
}

interface CartState {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  setUnitPrice: (productId: number, unitPriceCents: number) => void;
  clear: () => void;
  has: (productId: number) => boolean;
  quantityOf: (productId: number) => number;
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

function lineUnit(item: CartItem) {
  return item.unitPriceCents ?? item.product.effective_price_cents ?? item.product.price_cents;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const next = existing
        ? prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [
            ...prev,
            {
              product,
              quantity: 1,
              unitPriceCents: product.effective_price_cents ?? product.price_cents,
            },
          ];
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((productId: number) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.product.id !== productId);
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    const qty = Math.max(0, Math.floor(quantity));
    setItems((prev) => {
      const next =
        qty <= 0
          ? prev.filter((i) => i.product.id !== productId)
          : prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i));
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setUnitPrice = useCallback((productId: number, unitPriceCents: number) => {
    setItems((prev) => {
      const current = prev.find((i) => i.product.id === productId);
      if (!current || current.unitPriceCents === unitPriceCents) return prev;
      const next = prev.map((i) => (i.product.id === productId ? { ...i, unitPriceCents } : i));
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  const has = useCallback((productId: number) => items.some((i) => i.product.id === productId), [items]);
  const quantityOf = useCallback(
    (productId: number) => items.find((i) => i.product.id === productId)?.quantity ?? 0,
    [items],
  );

  const totalCents = useMemo(
    () => items.reduce((sum, i) => sum + lineUnit(i) * i.quantity, 0),
    [items],
  );
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      add,
      remove,
      setQuantity,
      setUnitPrice,
      clear,
      has,
      quantityOf,
      totalCents,
      count,
    }),
    [items, add, remove, setQuantity, setUnitPrice, clear, has, quantityOf, totalCents, count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart fora do CartProvider");
  return ctx;
}

export function cartLineUnit(item: CartItem) {
  return lineUnit(item);
}
