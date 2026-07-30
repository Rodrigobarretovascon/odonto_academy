import type { ReactNode } from "react";

type Mood = "spin" | "sad" | "idle";

export function ToothMascot({
  mood = "idle",
  label,
  size = 56,
}: {
  mood?: Mood;
  label: string;
  size?: number;
}) {
  return (
    <div
      className={`tooth-mascot tooth-mascot--${mood}`}
      role="img"
      aria-label={label}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        <path
          className="tooth-mascot__body"
          d="M32 6c-7 0-12 5-14 12-2 8-1 16 1 22 1 4 2 10 0 14-1 3 1 6 4 6 3 0 5-3 6-6 1-2 2-4 3-4s2 2 3 4c1 3 3 6 6 6 3 0 5-3 4-6-2-4-1-10 0-14 2-6 3-14 1-22C44 11 39 6 32 6z"
          fill="currentColor"
        />
        {mood === "sad" ? (
          <>
            <circle cx="24" cy="28" r="2.2" fill="#fff" />
            <circle cx="40" cy="28" r="2.2" fill="#fff" />
            <path d="M24 40c4 3 12 3 16 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="24" cy="28" r="2.2" fill="#fff" />
            <circle cx="40" cy="28" r="2.2" fill="#fff" />
            <path d="M24 38c4 4 12 4 16 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}
      </svg>
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

export function PageLoading({ message = "Carregando…" }: { message?: string }) {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <ToothMascot mood="spin" label="Dentinho girando, conteúdo carregando" size={64} />
      <p>{message}</p>
    </div>
  );
}

export function PageEmptyError({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-empty-error" role="alert">
      <ToothMascot mood="sad" label="Dentinho triste, conteúdo indisponível" size={64} />
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </div>
  );
}
