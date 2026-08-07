import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { AnimPhase } from "../../../data/sculpture-scripts";
import {
  anatomyProgressForStep,
  PROGRESS_STATUS_LABEL,
} from "../data/anatomyProgress";
import { getSculptureLesson } from "../data/lessons/incisor-central-upper";
import { MOVEMENT_PROFILES } from "../data/movements";
import { CATEGORY_LABEL } from "../data/stepMeta";
import { useStepNarration } from "../hooks/useStepNarration";
import { SCULPTURE_LAYERS } from "../lib/proceduralIncisor";
import {
  evaluatePracticeWithOutcome,
  type PracticeVisualOutcome,
} from "../lib/practiceOutcomes";
import type {
  FaceId,
  LessonScreen,
  SculptureStepDef,
  ToolId,
} from "../types/sculpture";
import type {
  PracticeEvaluation,
  PracticeGuideLevel,
  PracticeMomentMarker,
  SculptureLayerId,
} from "../types/interaction";
import { CommonErrorsGallery } from "./CommonErrorsGallery";
import { FinalQuizPanel } from "./FinalQuizPanel";
import {
  InteractiveCarveViewport,
  type CarveCompareMode,
  type CarveFaceView,
  type InteractiveCarveViewportHandle,
} from "./InteractiveCarveViewport";
import { MotionThumbnail } from "./MotionThumbnail";

interface ImmersiveSculptureLessonProps {
  fdi: number;
}

const FACE_BTNS: { id: CarveFaceView; label: string }[] = [
  { id: "V", label: "Vestibular" },
  { id: "P", label: "Lingual / Palatina" },
  { id: "M", label: "Mesial" },
  { id: "D", label: "Distal" },
  { id: "I", label: "Incisal" },
];

const TOOL_LABEL: Record<ToolId, string> = {
  wax: "Bloco de cera",
  ruler: "Régua",
  scalpel: "Estilete",
  lecron: "Lecron",
  brush: "Escova",
  nylon: "Meia fina",
};

const ALL_LAYERS = SCULPTURE_LAYERS.map((l) => l.id);

function faceToView(face?: FaceId | "perspective"): CarveFaceView | null {
  if (!face || face === "perspective" || face === "cervical") return null;
  return face;
}

export function ImmersiveSculptureLesson({ fdi }: ImmersiveSculptureLessonProps) {
  const lesson = useMemo(() => getSculptureLesson(fdi), [fdi]);
  const [screen, setScreen] = useState<LessonScreen>("materials");
  const [stepIndex, setStepIndex] = useState(0);
  const [compareMode, setCompareMode] = useState<CarveCompareMode>("animate");
  const [replayKey, setReplayKey] = useState(0);
  const [showMarks, setShowMarks] = useState(true);
  const [showRemoval, setShowRemoval] = useState(true);
  const [transparent, setTransparent] = useState(false);
  const [paused, setPaused] = useState(false);
  const [slowMo, setSlowMo] = useState(true);
  const [scrub, setScrub] = useState(1);
  const [doneSteps, setDoneSteps] = useState<Set<number>>(() => new Set());
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizMsg, setQuizMsg] = useState("");
  const [inspectChecks, setInspectChecks] = useState<Record<string, boolean>>({});
  const [exploreId, setExploreId] = useState<string | null>(null);
  const [showCorners, setShowCorners] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceManipulate, setPracticeManipulate] = useState<"tool" | "orbit">("tool");
  const [guideLevel, setGuideLevel] = useState<PracticeGuideLevel>("partial");
  const [showContact, setShowContact] = useState(true);
  const [narrationOn, setNarrationOn] = useState(false);
  const [focusToolKey, setFocusToolKey] = useState(0);
  const [practiceEval, setPracticeEval] = useState<PracticeEvaluation | null>(null);
  const [practiceOutcome, setPracticeOutcome] = useState<PracticeVisualOutcome | null>(null);
  const [practiceMoments, setPracticeMoments] = useState<PracticeMomentMarker[]>([]);
  const [savedUserPath, setSavedUserPath] = useState<[number, number, number][]>([]);
  const [replayAttempt, setReplayAttempt] = useState(false);
  const [showUserPath, setShowUserPath] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [anatomyCompare, setAnatomyCompare] = useState(false);
  const [compareOpacity, setCompareOpacity] = useState(0.35);
  const [activeLayers, setActiveLayers] = useState<SculptureLayerId[]>(() => [...ALL_LAYERS]);
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [cueHighlight, setCueHighlight] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [followDemo, setFollowDemo] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const carveRef = useRef<InteractiveCarveViewportHandle>(null);
  const { speak, stop: stopNarration } = useStepNarration(narrationOn);

  useEffect(() => {
    setScreen("materials");
    setStepIndex(0);
    setDoneSteps(new Set());
    setQuizIndex(0);
    setQuizMsg("");
    setInspectChecks({});
    setPracticeMode(false);
    setPracticeEval(null);
    setPracticeOutcome(null);
    setPracticeMoments([]);
    setReplayAttempt(false);
    setWhyOpen(false);
  }, [fdi]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    if (mq.matches) setParticlesEnabled(false);
    const fn = () => {
      setReduceMotion(mq.matches);
      if (mq.matches) setParticlesEnabled(false);
    };
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const currentStep = lesson?.steps[stepIndex];
  const activeCue = currentStep?.narrationCues?.find(
    (c) => scrub >= c.startProgress && scrub <= c.endProgress,
  );

  useEffect(() => {
    if (paused) {
      stopNarration();
    }
    if (!activeCue) return;
    const cueChanged = activeCue.id !== cueHighlight;
    if (cueChanged) {
      setCueHighlight(activeCue.id);
    }
    if (narrationOn && !paused && cueChanged) {
      speak(activeCue.text);
    }
  }, [activeCue?.id, activeCue?.text, narrationOn, paused, compareMode, cueHighlight, speak, stopNarration]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (screen === "final-quiz" || screen === "errors")) {
        setScreen("sculpt");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen]);

  if (!lesson) {
    return (
      <div className="immersive-lesson immersive-lesson--empty">
        <p>
          Aula imersiva completa disponível primeiro para o <strong>incisivo central superior</strong>{" "}
          (11 / 21). Os demais dentes usam o passo a passo clássico.
        </p>
        <Link to={`/app/escultura/${fdi}`} className="immersive-lesson__link">
          Voltar à escultura
        </Link>
      </div>
    );
  }

  const steps = lesson.steps;
  const step: SculptureStepDef = steps[stepIndex];
  const total = steps.length;
  const startBlend = stepIndex === 0 ? 0 : steps[stepIndex - 1].endBlend;

  const hasToolPath = Boolean(step.toolActions && step.toolActions.length > 0);
  const activeAction = step.toolActions?.[0];
  const movementLabel = activeAction
    ? MOVEMENT_PROFILES[activeAction.movementType].label
    : null;
  const anatomyItems = anatomyProgressForStep(step.order);

  const callViewer = (fn: "replay" | "resetCamera" | "zoomIn" | "zoomOut" | "setFaceView", arg?: CarveFaceView) => {
    if (fn === "setFaceView" && arg) {
      carveRef.current?.setFaceView(arg);
      return;
    }
    if (fn !== "setFaceView") {
      carveRef.current?.[fn]();
    }
  };

  const go = (next: number) => {
    const i = Math.max(0, Math.min(total - 1, next));
    if (i > stepIndex) {
      setDoneSteps((prev) => new Set(prev).add(step.order));
    }
    setStepIndex(i);
    setCompareMode("animate");
    setScrub(0);
    setPaused(false);
    setPracticeMode(false);
    setPracticeEval(null);
    setPracticeOutcome(null);
    setPracticeMoments([]);
    setReplayAttempt(false);
    setReplayKey((k) => k + 1);
    stopNarration();
    const cam = faceToView(steps[i].cameraFace);
    requestAnimationFrame(() => {
      if (cam) callViewer("setFaceView", cam);
      else callViewer("resetCamera");
    });
  };

  const replay = () => {
    stopNarration();
    setPracticeMode(false);
    setReplayAttempt(false);
    setCompareMode("animate");
    setScrub(0);
    setPaused(false);
    setReplayKey((k) => k + 1);
    callViewer("replay");
    const text = step.stepNarration?.text ?? step.narration;
    if (text) speak(text, step.stepNarration?.audioUrl);
  };

  const startPractice = () => {
    if (!hasToolPath) return;
    setPracticeMode(true);
    setPracticeEval(null);
    setPracticeOutcome(null);
    setPracticeMoments([]);
    setReplayAttempt(false);
    setCompareMode("before");
    setScrub(0);
    setPaused(true);
    setPracticeManipulate("tool");
    setGuideLevel(step.practice?.guideDefault ?? "partial");
    carveRef.current?.clearUserPath();
    carveRef.current?.replay();
    stopNarration();
  };

  const finishPractice = () => {
    if (!hasToolPath) {
      setPracticeEval({
        score: 0,
        pathAccuracy: 0,
        directionAccuracy: 0,
        coverageAccuracy: 0,
        depthAccuracy: 0,
        feedback: [{ type: "error", message: "Prática não configurada para esta etapa." }],
      });
      setPracticeOutcome(null);
      setPracticeMoments([]);
      return;
    }
    const ideal = step.toolActions?.[0]?.path ?? [];
    const userPath = carveRef.current?.getUserPath() ?? [];
    setSavedUserPath(userPath);
    if (userPath.length < 4) {
      setPracticeEval({
        score: 0,
        pathAccuracy: 0,
        directionAccuracy: 0,
        coverageAccuracy: 0,
        depthAccuracy: 0,
        feedback: [
          {
            type: "error",
            message:
              "Não há trajetória suficiente para avaliar. Arraste o instrumento com contato contínuo sobre a superfície.",
          },
        ],
      });
      setPracticeOutcome(null);
      setPracticeMoments([]);
      return;
    }
    const result = evaluatePracticeWithOutcome(userPath, ideal, {
      tolerance: step.practice?.tolerance ?? 0.18,
      protectedRegionIds: step.protectedRegionIds,
    });
    setPracticeEval(result.evaluation);
    setPracticeOutcome(result.outcome);
    setPracticeMoments(result.moments);
  };

  const progressPct = Math.round(((doneSteps.size + (screen === "inspect" ? 1 : 0)) / (total + 1)) * 100);

  return (
    <div className="immersive-lesson">
      <header className="immersive-lesson__top">
        <div>
          <p className="immersive-lesson__eyebrow">Aula imersiva 3D · GB Dental</p>
          <h1 className="immersive-lesson__title">
            {lesson.toothName}{" "}
            <span className="immersive-lesson__fdi">{lesson.notation}</span>
          </h1>
        </div>
        <div className="immersive-lesson__top-actions">
          <Link to={`/app/escultura/${fdi}`} className="immersive-lesson__ghost-btn">
            Versão clássica
          </Link>
          <button
            type="button"
            className="immersive-lesson__ghost-btn"
            onClick={() => setScreen("materials")}
          >
            Materiais
          </button>
          <button
            type="button"
            className="immersive-lesson__primary-btn"
            onClick={() => setScreen(screen === "sculpt" ? "inspect" : "sculpt")}
          >
            {screen === "inspect" ? "Voltar às etapas" : "Inspeção final"}
          </button>
          <button
            type="button"
            className="immersive-lesson__ghost-btn"
            onClick={() => setScreen("final-quiz")}
          >
            Teste final
          </button>
          <button
            type="button"
            className="immersive-lesson__ghost-btn"
            onClick={() => setScreen("errors")}
          >
            Erros comuns
          </button>
        </div>
      </header>

      {screen === "final-quiz" && (
        <FinalQuizPanel onClose={() => setScreen("sculpt")} />
      )}

      {screen === "errors" && (
        <CommonErrorsGallery
          onClose={() => setScreen("sculpt")}
          onReviewStep={(order) => {
            const idx = steps.findIndex((st) => st.order === order);
            if (idx >= 0) {
              setScreen("sculpt");
              go(idx);
            }
          }}
        />
      )}

      {screen === "materials" && (
        <section className="immersive-panel" aria-label="Materiais">
          <h2>Materiais do início</h2>
          <p className="immersive-panel__lead">
            Clique em cada item para ver função, etapas e cuidados. Depois avance para identificar as
            faces.
          </p>
          <div className="immersive-tools">
            {lesson.tools.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`immersive-tool${selectedTool === t.id ? " is-active" : ""}`}
                onClick={() => setSelectedTool(t.id)}
              >
                <strong>{t.name}</strong>
                <span>{t.function.slice(0, 72)}…</span>
              </button>
            ))}
          </div>
          {selectedTool && (
            <aside className="immersive-tool-detail" role="note">
              {(() => {
                const t = lesson.tools.find((x) => x.id === selectedTool)!;
                return (
                  <>
                    <h3>{t.name}</h3>
                    <p>{t.function}</p>
                    <p>
                      <strong>Usado nas etapas:</strong> {t.usedInSteps.join(", ")}
                    </p>
                    {t.safety && <p className="immersive-warn">{t.safety}</p>}
                  </>
                );
              })()}
            </aside>
          )}
          <button
            type="button"
            className="immersive-lesson__primary-btn"
            onClick={() => setScreen("faces")}
          >
            Continuar — identificar faces
          </button>
        </section>
      )}

      {screen === "faces" && (
        <section className="immersive-panel" aria-label="Faces">
          <h2>Identificação do dente 11 e das faces</h2>
          <p className="immersive-panel__lead">
            Toque em uma face para destacar e alinhar a câmera. Em seguida faça o mini-teste.
          </p>
          <div className="immersive-split">
            <div className="immersive-face-grid">
              {FACE_BTNS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="immersive-face-card"
                  onClick={() => {
                    setScreen("sculpt");
                    setStepIndex(1);
                    setReplayKey((k) => k + 1);
                    requestAnimationFrame(() => callViewer("setFaceView", f.id));
                  }}
                >
                  <span>{f.id}</span>
                  {f.label}
                </button>
              ))}
            </div>
            <ul className="immersive-notes">
              <li>Mesial: contorno mais reto; ângulo mesioincisal ~90°.</li>
              <li>Distal: mais arredondada; ângulo distoincisal mais suave.</li>
              <li>As letras V/P/M/D podem ser ocultadas durante a aula.</li>
            </ul>
          </div>
          <div className="immersive-lesson__row">
            <button type="button" className="immersive-lesson__ghost-btn" onClick={() => setScreen("materials")}>
              Voltar
            </button>
            <button type="button" className="immersive-lesson__primary-btn" onClick={() => setScreen("quiz")}>
              Mini-teste das faces
            </button>
          </div>
        </section>
      )}

      {screen === "quiz" && (
        <section className="immersive-panel" aria-label="Quiz">
          <h2>Teste rápido</h2>
          <p className="immersive-quiz-prompt">{lesson.quizPrompts[quizIndex]?.prompt}</p>
          <div className="immersive-face-grid">
            {FACE_BTNS.map((f) => (
              <button
                key={f.id}
                type="button"
                className="immersive-face-card"
                onClick={() => {
                  const ok = lesson.quizPrompts[quizIndex]?.answer === f.id;
                  if (ok) {
                    if (quizIndex >= lesson.quizPrompts.length - 1) {
                      setQuizMsg("Ótimo! Você está pronto para esculpir.");
                      setTimeout(() => {
                        setScreen("sculpt");
                        setStepIndex(0);
                        replay();
                      }, 700);
                    } else {
                      setQuizMsg("Correto!");
                      setQuizIndex((i) => i + 1);
                    }
                  } else {
                    setQuizMsg("Tente de novo — observe a orientação do 11.");
                  }
                }}
              >
                <span>{f.id}</span>
                {f.label}
              </button>
            ))}
          </div>
          {quizMsg && <p className="immersive-quiz-msg">{quizMsg}</p>}
          <button
            type="button"
            className="immersive-lesson__ghost-btn"
            onClick={() => {
              setScreen("sculpt");
              setStepIndex(0);
            }}
          >
            Pular teste e começar
          </button>
        </section>
      )}

      {(screen === "sculpt" || screen === "inspect") && (
        <div className={`immersive-main${transparent ? " is-ghost" : ""}`}>
          <aside className="immersive-sidebar" aria-label="Instruções da etapa">
            {screen === "sculpt" ? (
              <>
                <p className="immersive-sidebar__phase">
                  Fase {step.order} de {total}
                  {step.category && (
                    <> · {CATEGORY_LABEL[step.category]}</>
                  )}
                </p>
                <h2 className="immersive-sidebar__title">{step.title}</h2>
                <p className="immersive-sidebar__obj">
                  <strong>Objetivo:</strong> {step.objective}
                </p>
                <p className="immersive-sidebar__tool">
                  <strong>Instrumento:</strong> {TOOL_LABEL[step.activeTool]}
                  {activeAction?.activeTip ? ` · ponta ${activeAction.activeTip}` : ""}
                  {movementLabel ? ` · ${movementLabel}` : ""}
                </p>

                <details className="immersive-motion-details">
                  <summary>Ver movimento resumido</summary>
                  <MotionThumbnail
                    action={activeAction}
                    face={typeof step.cameraFace === "string" ? step.cameraFace : undefined}
                  />
                </details>

                <button
                  type="button"
                  className="immersive-lesson__ghost-btn"
                  onClick={() => setWhyOpen((v) => !v)}
                >
                  Por que fazer assim?
                </button>
                {whyOpen && step.why && (
                  <p className="immersive-why" role="note">
                    {step.why}
                  </p>
                )}

                {activeAction?.inclineHint && (
                  <p className="immersive-sidebar__obj">
                    <strong>Inclinação:</strong> {activeAction.inclineHint}
                  </p>
                )}

                {(step.removalHint || step.protectHint) && (
                  <p className="immersive-sidebar__obj">
                    {step.removalHint && (
                      <>
                        <strong>Remover:</strong> {step.removalHint}.{" "}
                      </>
                    )}
                    {step.protectHint && (
                      <>
                        <strong>Preservar:</strong> {step.protectHint}
                      </>
                    )}
                  </p>
                )}

                {hasToolPath && (
                  <p className="immersive-badge">Demonstração com trajetória nesta fase</p>
                )}

                {activeCue && (
                  <p className="immersive-narration is-cue" aria-live="polite">
                    {activeCue.text}
                  </p>
                )}

                <p className="immersive-sidebar__label">Instruções</p>
                <ol className="immersive-sidebar__list">
                  {step.instructions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>

                {step.anatomyNotes.length > 0 && (
                  <>
                    <p className="immersive-sidebar__label">Anatomia</p>
                    <ul className="immersive-sidebar__list">
                      {step.anatomyNotes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </>
                )}

                {step.warnings.map((w) => (
                  <p key={w} className="immersive-warn" role="note">
                    {w}
                  </p>
                ))}

                {step.commonErrors.length > 0 && (
                  <p className="immersive-error">
                    <strong>Erro comum:</strong> {step.commonErrors.join(" ")}
                  </p>
                )}

                <p className="immersive-sidebar__result">
                  <strong>Resultado esperado:</strong> {step.expectedResult}
                </p>

                {step.narration && (
                  <p className="immersive-narration" aria-live="polite">
                    {step.narration}
                  </p>
                )}

                <div className="immersive-sidebar__actions">
                  <button type="button" className="immersive-lesson__primary-btn" onClick={replay}>
                    Reproduzir demonstração
                  </button>
                  <button
                    type="button"
                    className="immersive-lesson__ghost-btn"
                    onClick={() => {
                      setSlowMo(true);
                      replay();
                    }}
                  >
                    Repetir movimento
                  </button>
                  {hasToolPath && (
                    <>
                      <button
                        type="button"
                        className="immersive-lesson__ghost-btn"
                        onClick={() => {
                          setPaused(true);
                          setFocusToolKey((k) => k + 1);
                          carveRef.current?.focusTool();
                        }}
                      >
                        Ver posição do instrumento
                      </button>
                      <button
                        type="button"
                        className="immersive-lesson__primary-btn"
                        onClick={startPractice}
                      >
                        Praticar esta fase
                      </button>
                    </>
                  )}
                  {practiceMode && (
                    <>
                      <button
                        type="button"
                        className="immersive-lesson__primary-btn"
                        onClick={finishPractice}
                      >
                        Avaliar minha trajetória
                      </button>
                      <button
                        type="button"
                        className="immersive-lesson__ghost-btn"
                        onClick={() => {
                          setPracticeMode(false);
                          setPracticeEval(null);
                          setPracticeOutcome(null);
                          replay();
                        }}
                      >
                        Sair da prática
                      </button>
                    </>
                  )}
                  {practiceEval && savedUserPath.length > 1 && (
                    <button
                      type="button"
                      className="immersive-lesson__ghost-btn"
                      onClick={() => {
                        setReplayAttempt(true);
                        setPracticeMode(false);
                        setShowUserPath(true);
                      }}
                    >
                      Replay da tentativa
                    </button>
                  )}
                  <button
                    type="button"
                    className="immersive-lesson__ghost-btn"
                    onClick={() => go(stepIndex - 1)}
                    disabled={stepIndex === 0}
                  >
                    Etapa anterior
                  </button>
                  <button
                    type="button"
                    className="immersive-lesson__primary-btn"
                    onClick={() => {
                      if (stepIndex >= total - 1) {
                        setDoneSteps((prev) => new Set(prev).add(step.order));
                        setScreen("final-quiz");
                      } else go(stepIndex + 1);
                    }}
                  >
                    {stepIndex >= total - 1 ? "Concluir · teste final" : "Próxima etapa"}
                  </button>
                </div>

                {practiceEval && (
                  <div className="immersive-practice-result" role="status">
                    <p>
                      <strong>Pontuação:</strong> {practiceEval.score}/100
                    </p>
                    {practiceOutcome && (
                      <p>
                        Resultado visual:{" "}
                        {practiceOutcome === "insufficient"
                          ? "desgaste insuficiente"
                          : practiceOutcome === "excessive"
                            ? "desgaste excessivo"
                            : "próximo ao esperado"}
                      </p>
                    )}
                    <ul>
                      {practiceEval.feedback.map((f) => (
                        <li key={f.message} className={`is-${f.type}`}>
                          {f.message}
                        </li>
                      ))}
                    </ul>
                    {practiceMoments.length > 0 && (
                      <div className="immersive-moments">
                        <p className="immersive-sidebar__label">Momentos da tentativa</p>
                        {practiceMoments.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className={`immersive-moment is-${m.kind}`}
                            onClick={() => {
                              setReplayAttempt(true);
                              setScrub(m.progress);
                              carveRef.current?.setReplayProgress(m.progress);
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="immersive-sidebar__title">Inspeção final</h2>
                <p className="immersive-sidebar__obj">
                  Marque cada item após conferir no modelo 3D.
                </p>
                {lesson.inspection.map((block) => (
                  <div key={block.view} className="immersive-inspect-block">
                    <button
                      type="button"
                      className="immersive-lesson__ghost-btn"
                      onClick={() => {
                        if (block.view !== "cervical") {
                          callViewer("setFaceView", block.view as CarveFaceView);
                        }
                      }}
                    >
                      {block.title}
                    </button>
                    <ul className="immersive-inspect-list">
                      {block.checks.map((c) => {
                        const key = `${block.view}-${c}`;
                        return (
                          <li key={key}>
                            <label>
                              <input
                                type="checkbox"
                                checked={!!inspectChecks[key]}
                                onChange={() =>
                                  setInspectChecks((prev) => ({ ...prev, [key]: !prev[key] }))
                                }
                              />
                              {c}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </aside>

          <div className="immersive-stage">
            <div className="immersive-stage__compare" role="tablist">
              {(
                [
                  ["animate", "Demonstração"],
                  ["before", "Antes"],
                  ["after", "Depois"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={compareMode === mode}
                  className={`immersive-tab${compareMode === mode ? " is-active" : ""}`}
                  onClick={() => setCompareMode(mode)}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                className="immersive-tab"
                onClick={() => {
                  setStepIndex(total - 1);
                  setCompareMode("after");
                  setScrub(1);
                  setReplayKey((k) => k + 1);
                }}
              >
                Resultado final
              </button>
            </div>

            <div className={`immersive-viewport${transparent ? " is-transparent" : ""}`}>
              <p className="immersive-viewport-status" aria-live="polite">
                Face: {step.cameraFace ?? "—"} · Instrumento: {TOOL_LABEL[step.activeTool]}
                {movementLabel ? ` · Movimento: ${movementLabel}` : ""} · Progresso:{" "}
                {Math.round(scrub * 100)}%
              </p>
              <InteractiveCarveViewport
                ref={carveRef}
                toothNumber={lesson.fdi}
                animPhase={step.animPhase as AnimPhase}
                startBlend={startBlend}
                endBlend={step.endBlend}
                toolActions={step.toolActions ?? []}
                compareMode={compareMode}
                progress={scrub}
                playbackRate={slowMo ? 0.35 : 1}
                paused={paused}
                showMarks={showMarks}
                showRemoval={showRemoval || showCorners}
                showContact={showContact}
                showGuidePath={
                  practiceMode ? guideLevel === "full" : true
                }
                showIdealPath={!practiceMode || guideLevel !== "free"}
                showUserPath={showUserPath || replayAttempt}
                userPathOverride={replayAttempt ? savedUserPath : undefined}
                replayAttempt={replayAttempt}
                reduceMotion={reduceMotion}
                practiceMode={practiceMode}
                practiceManipulate={practiceManipulate}
                focusToolKey={focusToolKey}
                replayKey={replayKey}
                visualMode={step.visualMode}
                anatomyCompare={anatomyCompare}
                compareOpacity={compareOpacity}
                activeLayers={activeLayers}
                practiceOutcome={practiceOutcome}
                grazingLight={showCorners || step.visualMode === "grazing-light"}
                faceLabels={step.visualMode === "highlight-faces" ? step.labels : undefined}
                followDemo={followDemo}
                particlesEnabled={particlesEnabled && !reduceMotion}
                onProgress={(p) => {
                  if (compareMode === "animate" && !practiceMode) setScrub(p);
                }}
              />
            </div>

            {practiceMode && (
              <div className="immersive-practice-bar" role="group" aria-label="Modo prática">
                <button
                  type="button"
                  className={`immersive-chip${practiceManipulate === "tool" ? " is-on" : ""}`}
                  onClick={() => setPracticeManipulate("tool")}
                >
                  Manipular instrumento
                </button>
                <button
                  type="button"
                  className={`immersive-chip${practiceManipulate === "orbit" ? " is-on" : ""}`}
                  onClick={() => setPracticeManipulate("orbit")}
                >
                  Girar dente
                </button>
                <button
                  type="button"
                  className={`immersive-chip${guideLevel === "full" ? " is-on" : ""}`}
                  onClick={() => setGuideLevel("full")}
                >
                  Guiado
                </button>
                <button
                  type="button"
                  className={`immersive-chip${guideLevel === "partial" ? " is-on" : ""}`}
                  onClick={() => setGuideLevel("partial")}
                >
                  Parcial
                </button>
                <button
                  type="button"
                  className={`immersive-chip${guideLevel === "free" ? " is-on" : ""}`}
                  onClick={() => setGuideLevel("free")}
                >
                  Livre
                </button>
              </div>
            )}

            <div className="immersive-stage__controls">
              <button
                type="button"
                className={`immersive-chip${anatomyCompare ? " is-on" : ""}`}
                onClick={() => setAnatomyCompare((v) => !v)}
              >
                Comparar com anatomia ideal
              </button>
              {anatomyCompare && (
                <label className="immersive-scrub immersive-scrub--inline">
                  Opacidade
                  <input
                    type="range"
                    min={10}
                    max={80}
                    value={Math.round(compareOpacity * 100)}
                    onChange={(e) => setCompareOpacity(Number(e.target.value) / 100)}
                  />
                </label>
              )}
              <button
                type="button"
                className={`immersive-chip${showProgressPanel ? " is-on" : ""}`}
                onClick={() => setShowProgressPanel((v) => !v)}
              >
                Progresso anatômico
              </button>
            </div>

            <details className="immersive-layers">
              <summary>Camadas da escultura</summary>
              <div className="immersive-layers__grid">
                {SCULPTURE_LAYERS.map((layer) => {
                  const on = activeLayers.includes(layer.id);
                  return (
                    <label key={layer.id} className="immersive-layer-toggle">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => {
                          setActiveLayers((prev) =>
                            on ? prev.filter((id) => id !== layer.id) : [...prev, layer.id],
                          );
                        }}
                      />
                      {layer.label}
                    </label>
                  );
                })}
              </div>
            </details>

            {showProgressPanel && (
              <ul className="immersive-anatomy-progress">
                {anatomyItems.map((item) => (
                  <li key={item.id} className={`is-${item.status}`}>
                    <strong>{item.label}</strong>
                    <span>{PROGRESS_STATUS_LABEL[item.status]}</span>
                  </li>
                ))}
              </ul>
            )}

            <details className="immersive-hud" open={hasToolPath}>
              <summary>Painel da demonstração</summary>
              <ul>
                <li>Fase: {step.title}</li>
                <li>Categoria: {step.category ? CATEGORY_LABEL[step.category] : "—"}</li>
                <li>Instrumento: {TOOL_LABEL[step.activeTool]}</li>
                {activeAction?.activeTip && <li>Extremidade: {activeAction.activeTip}</li>}
                {movementLabel && <li>Movimento: {movementLabel}</li>}
                {step.cameraFace && <li>Face: {step.cameraFace}</li>}
                {step.protectHint && <li>Preservar: {step.protectHint}</li>}
                {step.removalHint && <li>Desgaste: {step.removalHint}</li>}
                <li>Velocidade: {slowMo ? "câmera lenta" : "normal"}</li>
              </ul>
              <p className="immersive-legend">
                Excesso de cera · Falta de volume · Região adequada · Região protegida
              </p>
            </details>

            <label className="immersive-scrub">
              <span>Linha do tempo da etapa ({Math.round(scrub * 100)}%)</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(scrub * 100)}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  setPracticeMode(false);
                  setCompareMode("after");
                  setScrub(v);
                  carveRef.current?.setProgress(v);
                }}
              />
            </label>

            <div className="immersive-stage__controls">
              {FACE_BTNS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="immersive-chip"
                  onClick={() => callViewer("setFaceView", f.id)}
                >
                  {f.label}
                </button>
              ))}
              <button
                type="button"
                className="immersive-chip"
                onClick={() => callViewer("resetCamera")}
              >
                Perspectiva
              </button>
            </div>

            <div className="immersive-stage__controls">
              <button type="button" className="immersive-chip" onClick={() => callViewer("zoomIn")}>
                Ampliar
              </button>
              <button type="button" className="immersive-chip" onClick={() => callViewer("zoomOut")}>
                Reduzir
              </button>
              <button type="button" className="immersive-chip" onClick={() => callViewer("resetCamera")}>
                Centralizar
              </button>
              <button
                type="button"
                className={`immersive-chip${showMarks ? " is-on" : ""}`}
                onClick={() => setShowMarks((v) => !v)}
              >
                Marcações
              </button>
              <button
                type="button"
                className={`immersive-chip${showRemoval ? " is-on" : ""}`}
                onClick={() => setShowRemoval((v) => !v)}
              >
                Desgaste
              </button>
              <button
                type="button"
                className={`immersive-chip${showContact ? " is-on" : ""}`}
                onClick={() => setShowContact((v) => !v)}
              >
                Ponto de contato
              </button>
              <button
                type="button"
                className={`immersive-chip${transparent ? " is-on" : ""}`}
                onClick={() => setTransparent((v) => !v)}
              >
                Transparente
              </button>
              <button
                type="button"
                className={`immersive-chip${paused ? " is-on" : ""}`}
                onClick={() => {
                  setPaused((v) => {
                    if (!v) stopNarration();
                    return !v;
                  });
                }}
              >
                {paused ? "Continuar" : "Pausar"}
              </button>
              <button
                type="button"
                className={`immersive-chip${followDemo ? " is-on" : ""}`}
                onClick={() => setFollowDemo((v) => !v)}
              >
                Seguir demonstração
              </button>
              <button
                type="button"
                className={`immersive-chip${particlesEnabled ? " is-on" : ""}`}
                onClick={() => setParticlesEnabled((v) => !v)}
              >
                Partículas
              </button>
              <button
                type="button"
                className={`immersive-chip${slowMo ? " is-on" : ""}`}
                onClick={() => setSlowMo((v) => !v)}
              >
                Câmera lenta
              </button>
              <button
                type="button"
                className={`immersive-chip${narrationOn ? " is-on" : ""}`}
                onClick={() => {
                  setNarrationOn((v) => {
                    if (v) stopNarration();
                    return !v;
                  });
                }}
              >
                Narração
              </button>
              <button
                type="button"
                className={`immersive-chip${showCorners ? " is-on" : ""}`}
                onClick={() => setShowCorners((v) => !v)}
              >
                Quinas artificiais
              </button>
            </div>

            <details className="immersive-explore">
              <summary>Explorar anatomia</summary>
              <div className="immersive-explore__grid">
                {lesson.anatomyStructures.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`immersive-chip${exploreId === a.id ? " is-on" : ""}`}
                    onClick={() => {
                      setExploreId(a.id);
                      const v = faceToView(a.face === "all" ? "perspective" : a.face);
                      if (v) callViewer("setFaceView", v);
                    }}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
              {exploreId && (
                <div className="immersive-explore__detail">
                  {(() => {
                    const a = lesson.anatomyStructures.find((x) => x.id === exploreId)!;
                    return (
                      <>
                        <p>{a.description}</p>
                        <button
                          type="button"
                          className="immersive-lesson__ghost-btn"
                          onClick={() => {
                            const idx = steps.findIndex((st) => st.order === a.createdInStep);
                            if (idx >= 0) {
                              setScreen("sculpt");
                              go(idx);
                            }
                          }}
                        >
                          Rever esta etapa
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
            </details>

            <p className="immersive-legend">
              Vermelho = remover · Verde/azul = preservar · Gire mesmo pausado · Progresso {progressPct}%
            </p>
          </div>
        </div>
      )}

      {screen === "sculpt" && (
        <nav className="immersive-timeline" aria-label="Linha do tempo das fases">
          <div className="immersive-timeline__track">
            {steps.map((st, i) => {
              const done = doneSteps.has(st.order) || i < stepIndex;
              const active = i === stepIndex;
              return (
                <button
                  key={st.id}
                  type="button"
                  className={`immersive-timeline__node${active ? " is-active" : ""}${done ? " is-done" : ""}`}
                  title={st.title}
                  onClick={() => go(i)}
                >
                  <span>{st.order}</span>
                  <em>{st.title}</em>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
