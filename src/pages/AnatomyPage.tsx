import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  atlasChapters,
  atlasHero,
  atlasImage,
  type AtlasChapter,
  type AtlasPiece,
} from "../data/anatomy-atlas";
import { toothNavItems } from "../data/tooth-registry";

type Immersion = {
  chapter: AtlasChapter;
  piece: AtlasPiece;
};

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-inview");
          io.unobserve(el);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function PieceStage({
  piece,
  accent,
  onOpen,
  variant = "default",
}: {
  piece: AtlasPiece;
  accent: AtlasChapter["accent"];
  onOpen: () => void;
  variant?: "default" | "lead" | "thumb" | "pane";
}) {
  const src = atlasImage(piece.slideId);
  return (
    <button
      type="button"
      className={`atlas-piece atlas-piece--${variant} atlas-piece--${accent}`}
      onClick={onOpen}
      style={{ "--crop": piece.crop ?? "50% 50%" } as CSSProperties}
    >
      <span className="atlas-piece__frame">
        <img src={src} alt={piece.caption} loading="lazy" className="atlas-piece__img" />
        <span className="atlas-piece__veil" aria-hidden />
        <span className="atlas-piece__shine" aria-hidden />
      </span>
      <span className="atlas-piece__meta">
        <span className="atlas-piece__caption">{piece.caption}</span>
        {piece.note && <span className="atlas-piece__note">{piece.note}</span>}
      </span>
    </button>
  );
}

function ExplodeChapter({
  chapter,
  onOpen,
}: {
  chapter: AtlasChapter;
  onOpen: (p: AtlasPiece) => void;
}) {
  const lead = chapter.pieces[0];
  const others = chapter.pieces.slice(1);
  const [active, setActive] = useState(0);
  const hotspot = lead.hotspots?.[active];

  return (
    <div className="atlas-explode">
      <div className="atlas-explode__stage">
        <PieceStage piece={lead} accent={chapter.accent} variant="lead" onOpen={() => onOpen(lead)} />
        {lead.hotspots?.map((h, i) => (
          <button
            key={h.label}
            type="button"
            className={`atlas-hotspot${i === active ? " atlas-hotspot--on" : ""}`}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            onClick={(e) => {
              e.stopPropagation();
              setActive(i);
            }}
            aria-pressed={i === active}
          >
            <span className="atlas-hotspot__dot" />
            <span className="atlas-hotspot__label">{h.label}</span>
          </button>
        ))}
      </div>
      <aside className="atlas-explode__side">
        <p className="atlas-explode__layer">{hotspot?.label ?? lead.caption}</p>
        <p className="atlas-explode__copy">{hotspot?.note ?? lead.note}</p>
        <div className="atlas-explode__stack">
          {others.map((p) => (
            <PieceStage
              key={p.slideId}
              piece={p}
              accent={chapter.accent}
              variant="thumb"
              onOpen={() => onOpen(p)}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}

function CinemaChapter({
  chapter,
  onOpen,
}: {
  chapter: AtlasChapter;
  onOpen: (p: AtlasPiece) => void;
}) {
  const lead = chapter.pieces[0];
  return (
    <div className="atlas-cinema">
      <PieceStage piece={lead} accent={chapter.accent} variant="lead" onOpen={() => onOpen(lead)} />
      <div className="atlas-cinema__caption">
        <strong>{lead.caption}</strong>
        {lead.note && <p>{lead.note}</p>}
      </div>
    </div>
  );
}

function SplitChapter({
  chapter,
  onOpen,
}: {
  chapter: AtlasChapter;
  onOpen: (p: AtlasPiece) => void;
}) {
  const [side, setSide] = useState<"a" | "b">("a");
  const left = chapter.pieces.filter((p) => p.role !== "compare");
  const right = chapter.pieces.filter((p) => p.role === "compare");
  const shown = side === "a" ? left : right;

  return (
    <div className="atlas-split">
      <div className="atlas-split__toggle" role="tablist" aria-label="Modo do periodonto">
        <button
          type="button"
          role="tab"
          aria-selected={side === "a"}
          className={side === "a" ? "is-on" : ""}
          onClick={() => setSide("a")}
        >
          Anatomia viva
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={side === "b"}
          className={side === "b" ? "is-on" : ""}
          onClick={() => setSide("b")}
        >
          Quando adoece
        </button>
      </div>
      <div className={`atlas-split__panes atlas-split__panes--${side}`}>
        {shown.map((p) => (
          <PieceStage
            key={p.slideId}
            piece={p}
            accent={chapter.accent}
            variant="pane"
            onOpen={() => onOpen(p)}
          />
        ))}
      </div>
    </div>
  );
}

function OrbitChapter({
  chapter,
  onOpen,
}: {
  chapter: AtlasChapter;
  onOpen: (p: AtlasPiece) => void;
}) {
  const [focus, setFocus] = useState(0);
  const lead = chapter.pieces[focus] ?? chapter.pieces[0];

  return (
    <div className="atlas-orbit">
      <div className="atlas-orbit__core">
        <PieceStage piece={lead} accent={chapter.accent} variant="lead" onOpen={() => onOpen(lead)} />
      </div>
      <div className="atlas-orbit__ring" role="list">
        {chapter.pieces.map((p, i) => (
          <button
            key={p.slideId}
            type="button"
            role="listitem"
            className={`atlas-orbit__sat${i === focus ? " is-on" : ""}`}
            style={{ "--i": i, "--n": chapter.pieces.length } as CSSProperties}
            onClick={() => setFocus(i)}
          >
            <img src={atlasImage(p.slideId)} alt="" style={{ objectPosition: p.crop }} />
            <span>{p.caption}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MagazineChapter({
  chapter,
  onOpen,
}: {
  chapter: AtlasChapter;
  onOpen: (p: AtlasPiece) => void;
}) {
  return (
    <div className="atlas-magazine">
      {chapter.pieces.map((p, i) => (
        <PieceStage
          key={p.slideId}
          piece={p}
          accent={chapter.accent}
          variant={i === 0 ? "lead" : "pane"}
          onOpen={() => onOpen(p)}
        />
      ))}
    </div>
  );
}

function FocusChapter({
  chapter,
  onOpen,
}: {
  chapter: AtlasChapter;
  onOpen: (p: AtlasPiece) => void;
}) {
  const [lead, support] = chapter.pieces;
  return (
    <div className="atlas-focus">
      <PieceStage piece={lead} accent={chapter.accent} variant="lead" onOpen={() => onOpen(lead)} />
      {support && (
        <div className="atlas-focus__float">
          <PieceStage
            piece={support}
            accent={chapter.accent}
            variant="thumb"
            onOpen={() => onOpen(support)}
          />
        </div>
      )}
    </div>
  );
}

function ChapterBody({
  chapter,
  onOpen,
}: {
  chapter: AtlasChapter;
  onOpen: (p: AtlasPiece) => void;
}) {
  switch (chapter.treatment) {
    case "explode":
      return <ExplodeChapter chapter={chapter} onOpen={onOpen} />;
    case "cinema":
      return <CinemaChapter chapter={chapter} onOpen={onOpen} />;
    case "split":
      return <SplitChapter chapter={chapter} onOpen={onOpen} />;
    case "orbit":
      return <OrbitChapter chapter={chapter} onOpen={onOpen} />;
    case "magazine":
      return <MagazineChapter chapter={chapter} onOpen={onOpen} />;
    case "focus":
      return <FocusChapter chapter={chapter} onOpen={onOpen} />;
    default:
      return null;
  }
}

function ChapterSection({
  chapter,
  onOpen,
}: {
  chapter: AtlasChapter;
  onOpen: (chapter: AtlasChapter, piece: AtlasPiece) => void;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      id={`atlas-${chapter.id}`}
      className={`atlas-chapter atlas-chapter--${chapter.treatment} atlas-chapter--${chapter.accent} atlas-reveal`}
    >
      <header className="atlas-chapter__head">
        <span className="atlas-chapter__index">{chapter.index}</span>
        <div>
          <p className="atlas-chapter__kicker">{chapter.kicker}</p>
          <h2>{chapter.title}</h2>
          <p className="atlas-chapter__lead">{chapter.lead}</p>
        </div>
      </header>
      <ChapterBody chapter={chapter} onOpen={(p) => onOpen(chapter, p)} />
    </section>
  );
}

function ImmersionOverlay({
  data,
  onClose,
}: {
  data: Immersion;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const src = atlasImage(data.piece.slideId);

  return (
    <div className="atlas-immerse" role="dialog" aria-modal="true" aria-label={data.piece.caption}>
      <button type="button" className="atlas-immerse__backdrop" onClick={onClose} aria-label="Fechar" />
      <div className="atlas-immerse__panel">
        <header className="atlas-immerse__head">
          <div>
            <p>{data.chapter.kicker}</p>
            <h3>{data.piece.caption}</h3>
            {data.piece.note && <span>{data.piece.note}</span>}
          </div>
          <button type="button" className="atlas-immerse__close" onClick={onClose}>
            Fechar
          </button>
        </header>
        <div
          className="atlas-immerse__stage"
          style={{ "--crop": data.piece.crop ?? "50% 50%" } as CSSProperties}
        >
          <img src={src} alt={data.piece.caption} className="atlas-immerse__img" />
          <div className="atlas-immerse__grain" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export function AnatomyPage() {
  const [activeId, setActiveId] = useState(atlasChapters[0]?.id ?? "");
  const [immersion, setImmersion] = useState<Immersion | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const bridgeRef = useReveal<HTMLElement>();

  useEffect(() => {
    const sections = atlasChapters
      .map((c) => document.getElementById(`atlas-${c.id}`))
      .filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveId(visible.target.id.replace("atlas-", ""));
        }
      },
      { threshold: [0.25, 0.45], rootMargin: "-20% 0px -40% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty("--px", String(x));
      hero.style.setProperty("--py", String(y));
    };
    hero.addEventListener("pointermove", onMove);
    return () => hero.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="atlas">
      <section
        ref={heroRef}
        className="atlas-hero"
        style={{ "--crop": atlasHero.crop } as CSSProperties}
      >
        <div className="atlas-hero__media" aria-hidden>
          <img src={atlasHero.image} alt="" className="atlas-hero__img" />
          <div className="atlas-hero__wash" />
          <div className="atlas-hero__orb atlas-hero__orb--a" />
          <div className="atlas-hero__orb atlas-hero__orb--b" />
        </div>
        <div className="atlas-hero__copy">
          <p className="atlas-hero__brand">{atlasHero.brand}</p>
          <h1>{atlasHero.title}</h1>
          <p className="atlas-hero__sub">{atlasHero.subtitle}</p>
          <a href={`#atlas-${atlasChapters[0].id}`} className="atlas-hero__cta">
            Entrar no atlas
          </a>
        </div>
      </section>

      <nav className="atlas-rail" aria-label="Capítulos do atlas">
        {atlasChapters.map((c) => (
          <a
            key={c.id}
            href={`#atlas-${c.id}`}
            className={`atlas-rail__item${activeId === c.id ? " is-on" : ""}`}
          >
            <span>{c.index}</span>
            {c.kicker}
          </a>
        ))}
      </nav>

      <div className="atlas-body">
        {atlasChapters.map((chapter) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            onOpen={(ch, piece) => setImmersion({ chapter: ch, piece })}
          />
        ))}

        <section className="atlas-bridge atlas-reveal" ref={bridgeRef}>
          <div className="atlas-bridge__copy">
            <p className="atlas-chapter__kicker">Próximo gesto</p>
            <h2>Leve a anatomia para a cera</h2>
            <p>
              Cada dente do guia de escultura carrega faces, oclusal e modelo 3D — a morfologia
              que você acabou de estudar, pronta para a mão.
            </p>
            <Link to="/app/escultura/13" className="atlas-hero__cta">
              Abrir escultura
            </Link>
          </div>
          <div className="atlas-bridge__teeth">
            {toothNavItems.slice(0, 6).map((t) => (
              <Link key={t.key} to={`/app/escultura/${t.key}`} className="atlas-bridge__tooth">
                <img
                  src={`/images/tooth-${t.key}/${t.key}-final-vestibular.png?v=5`}
                  alt=""
                  loading="lazy"
                />
                <strong>{t.shortName}</strong>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {immersion && (
        <ImmersionOverlay data={immersion} onClose={() => setImmersion(null)} />
      )}
    </div>
  );
}
