import type { ReactNode } from "react";

/** Ícones de linha fina no padrão da identidade Gabriela Barreto. */
type IconName = "tooth" | "anatomy" | "study" | "chat" | "bag" | "box" | "spark" | "play" | "pencil" | "users";

const paths: Record<IconName, ReactNode> = {
  tooth: (
    <path
      d="M12 3.5c-2.4 0-4.3 1.3-5.2 3.2C5.8 8.2 5.2 10.4 5.2 12.6c0 2.7.6 5.5 1.3 7.5.3.9 1 1.4 1.9 1.4.9 0 1.5-.6 1.8-1.3.4-.8.7-2 1-3 .2-.6.6-.9 1.2-.9h1.2c.6 0 1 .3 1.2.9.3 1 .6 2.2 1 3 .3.7.9 1.3 1.8 1.3.9 0 1.6-.5 1.9-1.4.7-2 1.3-4.8 1.3-7.5 0-2.2-.6-4.4-1.6-5.9C16.3 4.8 14.4 3.5 12 3.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  anatomy: (
    <>
      <path
        d="M12 4c-2.2 0-4 1.6-4 4.2 0 2.4.8 5.2 1.6 7.2.3.8.9 1.2 1.6 1.2.7 0 1.1-.5 1.3-1 .3-.8.5-1.9.7-2.8h1.6c.2.9.4 2 .7 2.8.2.5.6 1 1.3 1 .7 0 1.3-.4 1.6-1.2.8-2 1.6-4.8 1.6-7.2C16 5.6 14.2 4 12 4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="10" r="1.2" fill="currentColor" />
    </>
  ),
  study: (
    <>
      <path d="M4 9.5 12 6l8 3.5-8 3.5L4 9.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 11.5v4.2c0 .6 2.2 2 5 2s5-1.4 5-2v-4.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.5 10.2v5.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  chat: (
    <>
      <path
        d="M5 7.5c0-1.4 1.3-2.5 3-2.5h8c1.7 0 3 1.1 3 2.5v5c0 1.4-1.3 2.5-3 2.5H11l-3.5 2.5V15H8c-1.7 0-3-1.1-3-2.5v-5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 11.2c-1.1-1-2.6-.5-2.6.8 0 .9.8 1.6 1.7 2.2.6.4 1 .6.9.6s.3-.2.9-.6c.9-.6 1.7-1.3 1.7-2.2 0-1.3-1.5-1.8-2.6-.8Z"
        fill="var(--gb-rose, #F6B6C6)"
        stroke="currentColor"
        strokeWidth="1"
      />
    </>
  ),
  bag: (
    <>
      <path d="M7 8.5h10l-.7 9.2a1.5 1.5 0 0 1-1.5 1.3H9.2a1.5 1.5 0 0 1-1.5-1.3L7 8.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.2 8.5V7.2A2.8 2.8 0 0 1 12 4.5a2.8 2.8 0 0 1 2.8 2.7v1.3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 13.2c-.8-.7-1.9-.4-1.9.5 0 .6.5 1.1 1.2 1.5.4.3.7.4.7.4s.3-.1.7-.4c.7-.4 1.2-.9 1.2-1.5 0-.9-1.1-1.2-1.9-.5Z" fill="var(--gb-rose, #F6B6C6)" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  box: (
    <>
      <path d="M4.5 8.5 12 5l7.5 3.5v8L12 20l-7.5-3.5v-8Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4.5 8.5 12 12l7.5-3.5M12 12v8" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  spark: (
    <>
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.8 6.8l1.5 1.5M15.7 15.7l1.5 1.5M17.2 6.8l-1.5 1.5M8.3 15.7l-1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8.8v6.4l5.2-3.2L10 8.8Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  pencil: (
    <>
      <path d="M14.2 5.2 18.8 9.8 9 19.6H4.4V15L14.2 5.2Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12.6 6.8 17.2 11.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="10" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 18.2c.4-2.4 2.2-3.7 4.5-3.7s4.1 1.3 4.5 3.7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.2 14.8c1.7.2 3.1 1.2 3.5 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
};

export function BrandIcon({
  name,
  size = 28,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`gb-icon ${className}`} style={{ width: size + 20, height: size + 20 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        {paths[name]}
      </svg>
    </span>
  );
}
