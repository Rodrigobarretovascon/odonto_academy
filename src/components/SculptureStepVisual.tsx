import type { AnimPhase } from "../data/sculpture-scripts";
import { captionForAnimPhase } from "../data/sculpture-scripts";

interface SculptureStepVisualProps {
  phase: AnimPhase;
  toothNumber: number;
  stepTitle: string;
  stepId: number;
}

/** Diagramas 2D didáticos — um desenho claro por fase da técnica regressiva. */
export function SculptureStepVisual({
  phase,
  toothNumber,
  stepTitle,
  stepId,
}: SculptureStepVisualProps) {
  const caption = captionForAnimPhase(phase);

  return (
    <figure className="step-visual">
      <div className="step-visual__frame" aria-hidden="true">
        <svg viewBox="0 0 420 240" role="img" className="step-visual__svg">
          <defs>
            <linearGradient id="waxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3e4c4" />
              <stop offset="100%" stopColor="#e0c997" />
            </linearGradient>
            <linearGradient id="toothGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff8ee" />
              <stop offset="100%" stopColor="#e8d5b0" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="14" fill="#f4f8fc" />
          {renderPhase(phase)}
        </svg>
      </div>
      <figcaption className="step-visual__cap">
        <span className="step-visual__badge">Passo {stepId}</span>
        <span className="step-visual__title">{stepTitle}</span>
        <span className="step-visual__meta">
          FDI {toothNumber} · {caption}
        </span>
      </figcaption>
    </figure>
  );
}

function Block({ x = 150, y = 40, w = 120, h = 160 }: { x?: number; y?: number; w?: number; h?: number }) {
  return (
    <rect x={x} y={y} width={w} height={h} rx="6" fill="url(#waxGrad)" stroke="#2d5596" strokeWidth="2" />
  );
}

function Dim({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label: string }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const vert = Math.abs(x2 - x1) < 2;
  return (
    <g fill="#a33d63" stroke="#a33d63" strokeWidth="1.4">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {vert ? (
        <>
          <line x1={x1 - 4} y1={y1} x2={x1 + 4} y2={y1} />
          <line x1={x2 - 4} y1={y2} x2={x2 + 4} y2={y2} />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - 4} x2={x1} y2={y1 + 4} />
          <line x1={x2} y1={y2 - 4} x2={x2} y2={y2 + 4} />
        </>
      )}
      <text
        x={vert ? x1 - 8 : mx}
        y={vert ? my + 4 : y1 - 8}
        textAnchor={vert ? "end" : "middle"}
        fontSize="11"
        fontWeight="700"
        stroke="none"
      >
        {label}
      </text>
    </g>
  );
}

function Label({ x, y, text, fill = "#2d5596" }: { x: number; y: number; text: string; fill?: string }) {
  return (
    <text x={x} y={y} fill={fill} fontSize="12" fontWeight="700" textAnchor="middle">
      {text}
    </text>
  );
}

function renderPhase(phase: AnimPhase) {
  switch (phase) {
    case "instruments":
      return (
        <g>
          <Label x={210} y={28} text="Bancada — instrumentais" />
          {/* Lecron */}
          <rect x="48" y="70" width="10" height="110" rx="3" fill="#c0c6ce" />
          <path d="M48 70 L58 70 L68 48 L38 48 Z" fill="#9aa3ad" />
          <Label x={53} y={200} text="Lecron" fill="#475569" />
          {/* Rollemberg */}
          <rect x="110" y="80" width="9" height="100" rx="3" fill="#b8c0c8" />
          <ellipse cx="114.5" cy="72" rx="10" ry="6" fill="#8b949e" />
          <Label x={115} y={200} text="Rollemberg" fill="#475569" />
          {/* Espátula 7 */}
          <rect x="175" y="90" width="8" height="90" rx="2" fill="#c5ccd4" />
          <path d="M170 90 L188 90 L195 55 L163 55 Z" fill="#a8b0ba" />
          <Label x={179} y={200} text="Espátula 7" fill="#475569" />
          {/* Régua */}
          <rect x="240" y="100" width="140" height="22" rx="3" fill="#e8eef6" stroke="#2d5596" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line
              key={i}
              x1={250 + i * 18}
              y1={100}
              x2={250 + i * 18}
              y2={i % 2 === 0 ? 112 : 108}
              stroke="#2d5596"
              strokeWidth="1.2"
            />
          ))}
          <Label x={310} y={200} text="Régua" fill="#475569" />
          <text x="210" y="225" textAnchor="middle" fontSize="11" fill="#64748b">
            + escova e meia fina para o polimento
          </text>
        </g>
      );

    case "measure":
      return (
        <g>
          <Label x={210} y={26} text="Planejamento — medidas do bloco" />
          <Block x={155} y={45} w={110} h={150} />
          <Dim x1={140} y1={45} x2={140} y2={195} label="Altura" />
          <Dim x1={155} y1={210} x2={265} y2={210} label="MD" />
          <Dim x1={280} y1={80} x2={280} y2={160} label="VL" />
          <text x="70" y="90" fontSize="11" fill="#334155" fontWeight="600">
            Real → ×1,5
          </text>
          <text x="70" y="110" fontSize="10" fill="#64748b">
            macromodelo
          </text>
          <text x="70" y="140" fontSize="10" fill="#a33d63" fontWeight="700">
            + margem
          </text>
          <text x="70" y="155" fontSize="10" fill="#a33d63">
            de segurança
          </text>
        </g>
      );

    case "thirds":
    case "grid":
      return (
        <g>
          <Label x={210} y={26} text={phase === "grid" ? "Quadriculado em terços" : "Divisão em 3 terços iguais"} />
          <Block />
          <line x1="150" y1="93" x2="270" y2="93" stroke="#2d5596" strokeWidth="2" strokeDasharray="5 3" />
          <line x1="150" y1="146" x2="270" y2="146" stroke="#2d5596" strokeWidth="2" strokeDasharray="5 3" />
          <text x="280" y="75" fontSize="11" fill="#2d5596" fontWeight="700">
            Incisal
          </text>
          <text x="280" y="125" fontSize="11" fill="#2d5596" fontWeight="700">
            Médio
          </text>
          <text x="280" y="175" fontSize="11" fill="#2d5596" fontWeight="700">
            Cervical
          </text>
          <text x="210" y="225" textAnchor="middle" fontSize="11" fill="#64748b">
            Linhas devem circundar o bloco e se encontrar
          </text>
        </g>
      );

    case "faces":
      return (
        <g>
          <Label x={210} y={26} text="Identifique as faces (FDI)" />
          <Block x={160} y={50} w={100} h={140} />
          <g fontSize="14" fontWeight="800" textAnchor="middle">
            <circle cx="210" cy="40" r="14" fill="#2d5596" />
            <text x="210" y={45} fill="#fff">
              V
            </text>
            <circle cx="210" cy="210" r="14" fill="#2d5596" />
            <text x="210" y={215} fill="#fff">
              L
            </text>
            <circle cx="140" cy="120" r="14" fill="#a33d63" />
            <text x="140" y={125} fill="#fff">
              M
            </text>
            <circle cx="280" cy="120" r="14" fill="#a33d63" />
            <text x="280" y={125} fill="#fff">
              D
            </text>
          </g>
          <text x="60" y="70" fontSize="11" fill="#334155">
            V vestibular
          </text>
          <text x="60" y="88" fontSize="11" fill="#334155">
            L lingual
          </text>
          <text x="60" y="106" fontSize="11" fill="#334155">
            M mesial
          </text>
          <text x="60" y="124" fontSize="11" fill="#334155">
            D distal
          </text>
        </g>
      );

    case "proximal-draw":
      return (
        <g>
          <Label x={210} y={26} text="Vista proximal — desenho V / L" />
          {/* bloco de lado */}
          <rect x="160" y="45" width="90" height="155" rx="5" fill="url(#waxGrad)" stroke="#2d5596" strokeWidth="2" />
          {/* contorno do dente */}
          <path
            d="M175 55
               C168 90, 168 120, 172 150
               C176 175, 185 185, 205 188
               C225 185, 234 175, 238 150
               C242 120, 248 85, 245 55
               Z"
            fill="none"
            stroke="#a33d63"
            strokeWidth="2.5"
          />
          <text x="148" y="100" fontSize="12" fontWeight="700" fill="#2d5596" textAnchor="end">
            V
          </text>
          <text x="268" y="100" fontSize="12" fontWeight="700" fill="#2d5596">
            L
          </text>
          <text x="205" y="210" textAnchor="middle" fontSize="11" fill="#64748b">
            Transfira em paralelo para a outra proximal
          </text>
          <path d="M300 80 L340 80 L340 160 L300 160" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="320" y="175" textAnchor="middle" fontSize="10" fill="#64748b">
            distal
          </text>
        </g>
      );

    case "rough-cut":
    case "second-cut":
      return (
        <g>
          <Label x={210} y={26} text={phase === "rough-cut" ? "Redução grosseira" : "2ª sequência de cortes"} />
          {/* bloco residual */}
          <path
            d="M175 50 L245 50 L255 100 L250 180 L170 180 L165 100 Z"
            fill="url(#waxGrad)"
            stroke="#2d5596"
            strokeWidth="2"
          />
          {/* Lecron */}
          <g transform="translate(290,70) rotate(35)">
            <rect x="0" y="0" width="8" height="90" rx="2" fill="#c0c6ce" />
            <path d="M0 0 L8 0 L14 -18 L-6 -18 Z" fill="#9aa3ad" />
          </g>
          <path d="M250 90 L275 105" stroke="#a33d63" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="90" y="100" fontSize="11" fill="#a33d63" fontWeight="700">
            Remova o
          </text>
          <text x="90" y="116" fontSize="11" fill="#a33d63" fontWeight="700">
            excesso fora
          </text>
          <text x="90" y="132" fontSize="11" fill="#a33d63" fontWeight="700">
            do desenho
          </text>
          <text x="210" y="215" textAnchor="middle" fontSize="11" fill="#64748b">
            Perto da linha: raspe · Longe: corte
          </text>
        </g>
      );

    case "round":
      return (
        <g>
          <Label x={210} y={26} text="Arredonde arestas e ângulos" />
          <path
            d="M190 55
               C175 70, 168 100, 170 140
               C172 170, 185 185, 210 188
               C235 185, 248 170, 250 140
               C252 100, 245 70, 230 55
               C220 48, 200 48, 190 55 Z"
            fill="url(#toothGrad)"
            stroke="#2d5596"
            strokeWidth="2"
          />
          {[
            [175, 70],
            [245, 70],
            [172, 150],
            [248, 150],
            [210, 55],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5" fill="#a33d63" opacity="0.85" />
          ))}
          <text x="210" y="220" textAnchor="middle" fontSize="11" fill="#64748b">
            Pontos = cantos vivos a suavizar
          </text>
        </g>
      );

    case "vestibular":
      return (
        <g>
          <Label x={210} y={26} text="Face vestibular — convexidades" />
          <path
            d="M155 55
               C150 90, 148 130, 155 165
               C165 185, 185 192, 210 194
               C235 192, 255 185, 265 165
               C272 130, 270 90, 265 55
               C250 48, 170 48, 155 55 Z"
            fill="url(#toothGrad)"
            stroke="#2d5596"
            strokeWidth="2"
          />
          {/* bossa */}
          <ellipse cx="210" cy="160" rx="38" ry="14" fill="none" stroke="#a33d63" strokeWidth="2" strokeDasharray="4 2" />
          <text x="300" y="165" fontSize="11" fill="#a33d63" fontWeight="700">
            Bossa
          </text>
          <text x="155" y="80" fontSize="11" fill="#2d5596" fontWeight="700">
            M
          </text>
          <text x="265" y="80" fontSize="11" fill="#2d5596" fontWeight="700">
            D
          </text>
          <text x="210" y="220" textAnchor="middle" fontSize="11" fill="#64748b">
            Mesial mais reta · Distal mais arredondada
          </text>
        </g>
      );

    case "lingual":
    case "cingulum":
      return (
        <g>
          <Label x={210} y={26} text={phase === "cingulum" ? "Fossa + cíngulo" : "Face lingual / lingual"} />
          <path
            d="M160 50
               C155 90, 158 130, 165 165
               C175 185, 190 190, 210 192
               C230 190, 245 185, 255 165
               C262 130, 265 90, 260 50
               C245 55, 175 55, 160 50 Z"
            fill="url(#toothGrad)"
            stroke="#2d5596"
            strokeWidth="2"
          />
          {/* fossa */}
          <ellipse cx="210" cy="105" rx="32" ry="28" fill="#e8d9b8" stroke="#a33d63" strokeWidth="2" />
          <text x="210" y="110" textAnchor="middle" fontSize="11" fontWeight="700" fill="#a33d63">
            Fossa
          </text>
          {/* cíngulo */}
          <path
            d="M175 160 C190 175, 230 175, 245 160 C235 185, 185 185, 175 160"
            fill="#dcc491"
            stroke="#2d5596"
            strokeWidth="1.5"
          />
          <text x="210" y="178" textAnchor="middle" fontSize="10" fontWeight="700" fill="#2d5596">
            Cíngulo
          </text>
          <text x="70" y="100" fontSize="10" fill="#64748b">
            Cristas
          </text>
          <text x="70" y="114" fontSize="10" fill="#64748b">
            marginais
          </text>
          <line x1="100" y1="100" x2="175" y2="85" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="100" y1="114" x2="175" y2="130" stroke="#94a3b8" strokeWidth="1.2" />
        </g>
      );

    case "cervix":
      return (
        <g>
          <Label x={210} y={26} text="Colo anatômico" />
          <path
            d="M185 45 C175 80, 172 120, 178 150 C190 165, 230 165, 242 150 C248 120, 245 80, 235 45 Z"
            fill="url(#toothGrad)"
            stroke="#2d5596"
            strokeWidth="2"
          />
          <path
            d="M170 155 C190 145, 230 145, 250 155 C235 175, 185 175, 170 155"
            fill="none"
            stroke="#a33d63"
            strokeWidth="2.5"
          />
          <text x="300" y="160" fontSize="11" fill="#a33d63" fontWeight="700">
            Linha sinuosa
          </text>
          <text x="300" y="176" fontSize="10" fill="#64748b">
            côncavo-convexa
          </text>
          <text x="210" y="215" textAnchor="middle" fontSize="11" fill="#64748b">
            Rollemberg nº 3 / 3S
          </text>
        </g>
      );

    case "cusps":
    case "occlusal":
      return (
        <g>
          <Label x={210} y={26} text={phase === "cusps" ? "Cúspides" : "Anatomia oclusal"} />
          <ellipse cx="210" cy="125" rx="95" ry="75" fill="url(#toothGrad)" stroke="#2d5596" strokeWidth="2" />
          {/* sulco */}
          <path d="M140 125 Q210 135 280 125" fill="none" stroke="#2d5596" strokeWidth="2" />
          <path d="M210 70 Q205 125 210 180" fill="none" stroke="#2d5596" strokeWidth="1.6" />
          {/* cúspides */}
          {[
            [165, 95, "MV"],
            [255, 95, "DV"],
            [165, 155, "ML"],
            [255, 155, "DL"],
          ].map(([x, y, t]) => (
            <g key={String(t)}>
              <circle cx={Number(x)} cy={Number(y)} r="16" fill="#fff" stroke="#a33d63" strokeWidth="2" />
              <text x={Number(x)} y={Number(y) + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#a33d63">
                {t}
              </text>
            </g>
          ))}
          <text x="210" y="220" textAnchor="middle" fontSize="11" fill="#64748b">
            Sulcos centrais · fossas · cristas triangulares
          </text>
        </g>
      );

    case "root":
      return (
        <g>
          <Label x={210} y={26} text="Escultura da raiz" />
          <path
            d="M185 40 C175 70, 175 100, 180 120 L175 200 C190 215, 230 215, 245 200 L240 120 C245 100, 245 70, 235 40 Z"
            fill="url(#toothGrad)"
            stroke="#2d5596"
            strokeWidth="2"
          />
          <line x1="170" y1="120" x2="250" y2="120" stroke="#a33d63" strokeWidth="2" strokeDasharray="5 3" />
          <text x="300" y="110" fontSize="11" fill="#a33d63" fontWeight="700">
            Colo
          </text>
          <text x="300" y="170" fontSize="11" fill="#2d5596" fontWeight="700">
            Raiz
          </text>
          <text x="210" y="230" textAnchor="middle" fontSize="11" fill="#64748b">
            Corte a base do bloco com apoio firme
          </text>
        </g>
      );

    case "detail":
      return (
        <g>
          <Label x={210} y={26} text="Detalhes anatômicos" />
          <path
            d="M160 50 C155 90, 155 130, 162 165 C175 188, 245 188, 258 165 C265 130, 265 90, 260 50 C245 45, 175 45, 160 50 Z"
            fill="url(#toothGrad)"
            stroke="#2d5596"
            strokeWidth="2"
          />
          <line x1="185" y1="55" x2="180" y2="120" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="210" y1="52" x2="210" y2="125" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="235" y1="55" x2="240" y2="120" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="300" y="90" fontSize="11" fill="#64748b">
            Sulcos de
          </text>
          <text x="300" y={106} fontSize="11" fill="#64748b">
            desenvolvimento
          </text>
          <text x="210" y={215} textAnchor="middle" fontSize="11" fill="#64748b">
            Lóbulos · área de espelhamento · proximais côncavas
          </text>
        </g>
      );

    case "polish":
      return (
        <g>
          <Label x={210} y={26} text="Acabamento e polimento" />
          <path
            d="M175 50 C168 85, 168 125, 175 155 C185 175, 235 175, 245 155 C252 125, 252 85, 245 50 C230 42, 190 42, 175 50 Z"
            fill="#fff8ee"
            stroke="#c9a96a"
            strokeWidth="2.5"
          />
          <path d="M290 80 Q310 120 295 170" fill="none" stroke="#c0c6ce" strokeWidth="6" strokeLinecap="round" />
          <circle cx="295" cy="175" r="12" fill="#e8eef6" stroke="#2d5596" />
          <text x="330" y="120" fontSize="11" fill="#64748b">
            Meia fina
          </text>
          <text x="330" y="136" fontSize="11" fill="#64748b">
            + escova
          </text>
          <text x="210" y={210} textAnchor="middle" fontSize="11" fill="#64748b">
            Remova farpas · revise todas as faces
          </text>
        </g>
      );

    default:
      return (
        <g>
          <Block />
          <Label x={210} y={26} text="Escultura em cera" />
        </g>
      );
  }
}
