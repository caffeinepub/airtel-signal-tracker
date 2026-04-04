import { useEffect, useState } from "react";

const NIGHT_MODE_KEY = "night_mode";

export function useNightMode() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem(NIGHT_MODE_KEY) === "true";
  });

  // Apply dark class whenever isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Try AmbientLightSensor if available
  useEffect(() => {
    const win = window as unknown as Record<string, unknown>;
    if (!win.AmbientLightSensor) return;

    let sensor: {
      start(): void;
      stop(): void;
      onreading: (() => void) | null;
      onerror: ((e: unknown) => void) | null;
      illuminance: number;
    } | null = null;
    try {
      const SensorClass = win.AmbientLightSensor as new () => typeof sensor;
      sensor = new SensorClass();
      if (!sensor) return;
      sensor.onreading = () => {
        if (!sensor) return;
        const lux = sensor.illuminance;
        const shouldBeDark = lux < 10;
        setIsDark(shouldBeDark);
        localStorage.setItem(NIGHT_MODE_KEY, String(shouldBeDark));
      };
      sensor.onerror = () => {
        /* ignore sensor errors */
      };
      sensor.start();
    } catch {
      // AmbientLightSensor not available — fall back to manual
    }

    return () => {
      sensor?.stop();
    };
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(NIGHT_MODE_KEY, String(next));
      return next;
    });
  };

  return { isDark, toggle };
}
