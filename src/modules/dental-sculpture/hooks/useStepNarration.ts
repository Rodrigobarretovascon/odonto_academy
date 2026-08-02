import { useCallback, useEffect, useRef } from "react";

/** Narração via SpeechSynthesis — sem sobreposição; cancela em pause/unmount. */
export function useStepNarration(enabled: boolean) {
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTextRef = useRef<string>("");

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    utterRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const speak = useCallback(
    (text: string, audioUrl?: string) => {
      if (!enabled || !text) return;
      if (typeof window === "undefined") return;
      if (!window.speechSynthesis && !audioUrl) return;
      // Evita reiniciar o mesmo cue em loop no scrub
      if (text === lastTextRef.current && utterRef.current) return;
      stop();
      lastTextRef.current = text;
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play().catch(() => {
          if (!window.speechSynthesis) return;
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "pt-BR";
          u.rate = 0.95;
          utterRef.current = u;
          window.speechSynthesis.speak(u);
        });
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      u.rate = 0.95;
      u.onend = () => {
        if (utterRef.current === u) utterRef.current = null;
      };
      utterRef.current = u;
      window.speechSynthesis.speak(u);
    },
    [enabled, stop],
  );

  useEffect(() => {
    if (!enabled) stop();
  }, [enabled, stop]);

  useEffect(() => () => stop(), [stop]);

  return { speak, stop };
}
