import { useEffect, useRef } from "react";

export function useVoiceGuidance(
  enabled: boolean,
  direction: string,
  isOptimal: boolean,
) {
  const lastDirectionRef = useRef<string>("");
  const lastOptimalRef = useRef<boolean>(false);
  const lastSpokenTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!window.speechSynthesis) return;

    const now = Date.now();
    // Throttle to once every 4 seconds
    if (now - lastSpokenTimeRef.current < 4000) return;

    if (isOptimal && !lastOptimalRef.current) {
      speak("Optimal direction reached. Signal is strong.");
      lastOptimalRef.current = true;
      lastSpokenTimeRef.current = now;
      return;
    }

    if (!isOptimal) {
      lastOptimalRef.current = false;
    }

    if (direction !== lastDirectionRef.current) {
      const prevDir = lastDirectionRef.current;
      lastDirectionRef.current = direction;

      if (!prevDir) return; // Skip first render

      const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      const prevIdx = dirs.indexOf(prevDir);
      const currIdx = dirs.indexOf(direction);
      if (prevIdx === -1 || currIdx === -1) return;

      // Clockwise = right, counter-clockwise = left
      const diff = (currIdx - prevIdx + 8) % 8;
      const turnDir = diff <= 4 ? "right" : "left";

      speak(`Turn ${turnDir} — signal direction is ${direction}`);
      lastSpokenTimeRef.current = now;
    }
  }, [enabled, direction, isOptimal]);
}

function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.volume = 0.8;
  window.speechSynthesis.speak(utterance);
}
