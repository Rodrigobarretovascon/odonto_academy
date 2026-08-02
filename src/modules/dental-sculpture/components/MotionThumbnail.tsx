import type { ToolAction } from "../types/interaction";

/** Miniatura 2D leve do movimento (sem WebGL completo). */
export function MotionThumbnail({
  action,
  face,
}: {
  action?: ToolAction;
  face?: string;
}) {
  const pts = action?.path ?? [];
  const w = 160;
  const h = 120;
  const project = (p: [number, number, number]) => {
    const x = 80 + p[0] * 70;
    const y = 60 - p[1] * 55 - p[2] * 12;
    return [x, y] as const;
  };
  const d =
    pts.length > 1
      ? pts
          .map((p, i) => {
            const [x, y] = project(p.position);
            return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ")
      : "";

  const start = pts[0] ? project(pts[0].position) : null;
  const end = pts.length ? project(pts[pts.length - 1].position) : null;

  return (
    <div className="motion-thumb" aria-label="Resumo visual do movimento">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="120">
        <rect x="8" y="12" width="48" height="88" rx="6" fill="#b7d4d8" opacity="0.85" />
        <text x="32" y="108" textAnchor="middle" fontSize="9" fill="#1e3a6e">
          {face ?? "3D"}
        </text>
        {d && (
          <path d={d} fill="none" stroke="#2d5596" strokeWidth="2.2" strokeLinecap="round" />
        )}
        {start && <circle cx={start[0]} cy={start[1]} r="4" fill="#3d9b6e" />}
        {end && <circle cx={end[0]} cy={end[1]} r="4" fill="#c45a7a" />}
        <text x="100" y="18" fontSize="8" fill="#3d9b6e">
          início
        </text>
        <text x="100" y="30" fontSize="8" fill="#c45a7a">
          fim
        </text>
        {action?.activeTip && (
          <text x="100" y="48" fontSize="8" fill="#1e3a6e">
            ponta: {action.activeTip}
          </text>
        )}
        {action?.inclineHint && (
          <text x="12" y="14" fontSize="7" fill="#5a6a7a">
            direção →
          </text>
        )}
      </svg>
    </div>
  );
}
