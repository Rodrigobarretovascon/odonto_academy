/** Flags de desenvolvimento — não expor na UI do aluno. */
export const IS_DEV = import.meta.env.DEV;

/** Mostra helpers de contato instrumento↔superfície.
 * Ative com: localStorage.setItem('DEBUG_TOOL_CONTACT','1') e recarregue,
 * ou altere para `true` abaixo em desenvolvimento.
 */
export const DEBUG_TOOL_CONTACT =
  IS_DEV &&
  (typeof localStorage !== "undefined"
    ? localStorage.getItem("DEBUG_TOOL_CONTACT") === "1"
    : false);

/** Log periódico de renderer.info.memory / render.
 * Ative: localStorage.setItem('DEBUG_RENDERER_INFO','1')
 */
export const DEBUG_RENDERER_INFO =
  IS_DEV &&
  (typeof localStorage !== "undefined"
    ? localStorage.getItem("DEBUG_RENDERER_INFO") === "1"
    : false);

/** Aviso único por GLB ausente (evita spam no console). */
export const WARN_MISSING_GLB_ONCE = IS_DEV;
