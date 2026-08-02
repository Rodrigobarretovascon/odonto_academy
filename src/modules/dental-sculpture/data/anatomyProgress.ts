import type { AnatomyProgressItem } from "../types/interaction";

/** Progresso anatômico didático conforme a fase atual (1–24). */
export function anatomyProgressForStep(order: number): AnatomyProgressItem[] {
  const status = (
    start: number,
    build: number,
    ok: number,
    done: number,
  ): AnatomyProgressItem["status"] => {
    if (order < start) return "idle";
    if (order < build) return "building";
    if (order < ok) return "ok";
    if (order < done) return "review";
    return "done";
  };

  return [
    { id: "form", label: "Forma geral", status: status(1, 4, 9, 19) },
    { id: "prop", label: "Proporção", status: status(1, 6, 14, 19) },
    { id: "vest", label: "Vestibular", status: status(9, 10, 20, 23) },
    { id: "prox", label: "Proximais", status: status(3, 6, 13, 18) },
    { id: "pal", label: "Lingual", status: status(7, 15, 17, 22) },
    { id: "detail", label: "Detalhes", status: status(16, 20, 21, 23) },
    { id: "finish", label: "Acabamento", status: status(12, 23, 24, 25) },
  ];
}

export const PROGRESS_STATUS_LABEL: Record<AnatomyProgressItem["status"], string> = {
  idle: "Ainda não iniciado",
  building: "Em construção",
  ok: "Adequado para a fase",
  review: "Precisa de revisão",
  done: "Concluído",
};
