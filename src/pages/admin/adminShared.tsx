import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function FieldLabel({
  label,
  tip,
  children,
}: {
  label: string;
  tip?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const tipId = useId();
  const tipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocPointer(e: MouseEvent) {
      if (tipRef.current && !tipRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <label className={`admin-field${open ? " is-tip-open" : ""}`}>
      <span className="admin-field__label">
        {label}
        {tip ? (
        <button
          ref={tipRef}
          type="button"
          className={`admin-tip${open ? " is-open" : ""}`}
          aria-label={`Ajuda: ${label}`}
          aria-expanded={open}
          aria-controls={tipId}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <span aria-hidden="true">i</span>
          <span id={tipId} className="admin-tip__bubble" role="tooltip" hidden={!open}>
            {tip}
          </span>
        </button>
        ) : null}
      </span>
      {children}
    </label>
  );
}

export function reaisToCents(value: string) {
  const n = Number(String(value).replace(",", "."));
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

export function centsToReaisInput(cents: number) {
  return (Math.max(0, Number(cents) || 0) / 100).toFixed(2).replace(".", ",");
}

export type AdminProductLite = {
  id: number;
  code: string;
  name: string;
  price_cents: number;
  stock_qty: number | null;
};

export type VolumeSchedule = {
  id: number;
  product_id: number;
  product_code: string;
  product_name: string;
  name: string;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  tiers: Array<{ id?: number; min_qty: number; max_qty: number | null; unit_price_cents: number }>;
};

export type InventoryCount = {
  id: number;
  status: string;
  note: string | null;
  created_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  approval_note: string | null;
  created_by_name?: string;
  approved_by_name?: string;
  lines_count?: string;
  lines?: Array<{
    product_id: number;
    product_code: string;
    product_name: string;
    system_qty: number;
    counted_qty: number | null;
  }>;
  approvals?: Array<{
    id: number;
    action: string;
    actor_name: string;
    actor_email: string;
    note: string | null;
    created_at: string;
  }>;
};

export type SaleOrder = {
  id: number;
  order_number: string | null;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_provider: string | null;
  total_cents: number;
  discount_cents?: number;
  shipping_cents?: number;
  created_at: string;
  paid_at: string | null;
  channel: string;
  notes: string | null;
  customer_phone?: string | null;
  customer_document?: string | null;
  customer: string | null;
  email: string | null;
  guest_name: string | null;
  guest_email: string | null;
  items: Array<{ name: string; quantity: number; unit_price_cents: number }>;
};

export function formatCpf(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatCnpj(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatDocument(value: string, type: "cpf" | "cnpj") {
  return type === "cnpj" ? formatCnpj(value) : formatCpf(value);
}

export type Notify = (ok: string, err?: string) => void;
