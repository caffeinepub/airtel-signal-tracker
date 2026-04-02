import { useCallback, useState } from "react";

export type SpeedTestStatus = "idle" | "running" | "done" | "error";

export interface SpeedTestResult {
  ping: number | null;
  download: number | null;
  upload: number | null;
  status: SpeedTestStatus;
  progress: number;
  run: () => void;
}

export function useSpeedTest(): SpeedTestResult {
  const [ping, setPing] = useState<number | null>(null);
  const [download, setDownload] = useState<number | null>(null);
  const [upload, setUpload] = useState<number | null>(null);
  const [status, setStatus] = useState<SpeedTestStatus>("idle");
  const [progress, setProgress] = useState(0);

  const run = useCallback(async () => {
    setStatus("running");
    setProgress(0);
    setPing(null);
    setDownload(null);
    setUpload(null);

    // --- Ping (0 → 25) ---
    try {
      const t0 = performance.now();
      await fetch("https://www.cloudflare.com/", {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-store",
      });
      const latency = Math.round(performance.now() - t0);
      setPing(latency);
    } catch {
      setPing(null);
    }
    setProgress(25);

    // --- Download (25 → 75) ---
    try {
      const t0 = performance.now();
      const response = await fetch(
        "https://speed.cloudflare.com/__down?bytes=5000000",
        { cache: "no-store" },
      );
      if (response.ok) {
        const blob = await response.blob();
        const elapsed = (performance.now() - t0) / 1000; // seconds
        const mbps = (blob.size * 8) / 1_000_000 / elapsed;
        setDownload(Math.round(mbps * 10) / 10);
      } else {
        setDownload(null);
      }
    } catch {
      setDownload(null);
    }
    setProgress(75);

    // --- Upload (75 → 100) ---
    try {
      const size = 1_000_000; // 1 MB
      const data = new Uint8Array(size);
      crypto.getRandomValues(data);
      const blob = new Blob([data]);

      const t0 = performance.now();
      const response = await fetch("https://speed.cloudflare.com/__up", {
        method: "POST",
        body: blob,
        cache: "no-store",
      });
      if (response.ok) {
        const elapsed = (performance.now() - t0) / 1000;
        const mbps = (size * 8) / 1_000_000 / elapsed;
        setUpload(Math.round(mbps * 10) / 10);
      } else {
        setUpload(null);
      }
    } catch {
      setUpload(null);
    }
    setProgress(100);
    setStatus("done");
  }, []);

  return { ping, download, upload, status, progress, run };
}
