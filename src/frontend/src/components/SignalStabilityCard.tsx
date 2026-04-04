import { useEffect, useRef, useState } from "react";

interface SignalStabilityCardProps {
  rssi: number;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

const SLOTS = 20;
const SLOT_KEYS = Array.from({ length: SLOTS }, (_, i) => `slot-${i}`);

export function SignalStabilityCard({ rssi }: SignalStabilityCardProps) {
  const historyRef = useRef<number[]>([]);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    historyRef.current = [...historyRef.current, rssi].slice(-SLOTS);
    setHistory([...historyRef.current]);
  }, [rssi]);

  const sd = stddev(history);
  const stable = sd < 3;
  const fluctuating = sd >= 3 && sd < 8;

  const label = stable ? "Stable" : fluctuating ? "Fluctuating" : "Unstable";
  const colorClass = stable
    ? "text-signal-green"
    : fluctuating
      ? "text-yellow-500"
      : "text-destructive";
  const bgClass = stable
    ? "bg-signal-green/10 border-signal-green/20"
    : fluctuating
      ? "bg-yellow-50 border-yellow-200"
      : "bg-destructive/10 border-destructive/20";
  const barClass = stable
    ? "bg-signal-green"
    : fluctuating
      ? "bg-yellow-400"
      : "bg-destructive";

  // Normalize bars for sparkline (map to height 2-20px range)
  const minVal = history.length > 0 ? Math.min(...history) : -100;
  const maxVal = history.length > 0 ? Math.max(...history) : -60;
  const range = Math.max(maxVal - minVal, 1);

  return (
    <div className="bg-card rounded-xl border border-border shadow-xs p-4">
      <h4 className="font-bold text-sm text-foreground mb-3">
        🔒 Signal Stability
      </h4>
      <div className={`rounded-xl p-3 border ${bgClass} mb-3`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-lg font-bold ${colorClass}`}>{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Std deviation: {sd.toFixed(1)} dBm
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Last 20 readings</p>
            <p className={`text-sm font-bold ${colorClass}`}>
              {history.length}/20
            </p>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex items-end gap-px h-8">
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">Collecting data...</p>
        ) : (
          SLOT_KEYS.map((slotKey, i) => {
            const val = history[i];
            if (val === undefined) {
              return (
                <div
                  key={slotKey}
                  className="flex-1 bg-border/30 rounded-sm"
                  style={{ height: "4px" }}
                />
              );
            }
            const heightPct = ((val - minVal) / range) * 24 + 4;
            return (
              <div
                key={slotKey}
                className={`flex-1 rounded-sm ${barClass}`}
                style={{ height: `${heightPct}px` }}
              />
            );
          })
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Signal history sparkline
      </p>
    </div>
  );
}
