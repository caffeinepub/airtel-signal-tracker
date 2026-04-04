import { useEffect, useRef, useState } from "react";

// Singleton counter to track calls across components
let globalCallCount = 0;

export function incrementDataUsage(calls = 1) {
  globalCallCount += calls;
}

export function addSpeedTestUsage() {
  // ~5 MB per speed test
  globalCallCount += 2500; // 2500 * 2KB = 5MB
}

export function DataUsageTracker() {
  const [callCount, setCallCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll the global counter every 2 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCallCount(globalCallCount);
    }, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const mb = (callCount * 2) / 1024; // 2KB per call

  return (
    <div
      data-ocid="home.data_usage.panel"
      className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 border border-border"
    >
      <span className="text-base">📊</span>
      <div>
        <p className="text-xs font-semibold text-foreground">
          Session data:{" "}
          {mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`}
        </p>
        <p className="text-xs text-muted-foreground">
          {callCount} network calls
        </p>
      </div>
    </div>
  );
}
