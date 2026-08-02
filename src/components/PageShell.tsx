import type { ReactNode } from "react";
import { BrandLockup } from "./BrandMark";

type PageShellProps = {
  eyebrow?: string;
  title?: string;
  lead?: ReactNode;
  showBrand?: boolean;
  narrow?: boolean;
  /** Conteúdo dentro do painel suave (logo, título, CTAs). */
  panelBody?: ReactNode;
  actions?: ReactNode;
  /** Conteúdo abaixo do painel (cards, grids, formulários). */
  children?: ReactNode;
  footer?: ReactNode;
};

/** Envelope visual compartilhado — continuidade da identidade GB Dental. */
export function PageShell({
  eyebrow = "GB Dental",
  title,
  lead,
  showBrand = true,
  narrow = false,
  panelBody,
  actions,
  children,
  footer,
}: PageShellProps) {
  return (
    <div className={`page-shell${narrow ? " page-shell--narrow" : ""}`}>
      <div className="page-panel">
        {showBrand && <BrandLockup size="md" />}
        {eyebrow && <p className="page-panel__eyebrow">{eyebrow}</p>}
        {title && <h1 className="page-panel__title">{title}</h1>}
        {lead && <p className="page-panel__lead">{lead}</p>}
        {actions && <div className="page-panel__actions">{actions}</div>}
        {panelBody}
      </div>
      {children}
      {footer}
    </div>
  );
}

export function PageCard({
  title,
  lead,
  children,
  id,
  wide = false,
}: {
  title?: string;
  lead?: ReactNode;
  children: ReactNode;
  id?: string;
  wide?: boolean;
}) {
  return (
    <div className={`page-card${wide ? " page-card--wide" : ""}`} id={id}>
      {title && <h2 className="page-card__title">{title}</h2>}
      {lead && <p className="page-card__lead">{lead}</p>}
      {children}
    </div>
  );
}
