import { motion } from "motion/react";
import { useEffect, useState } from "react";

const FORECAST_KEY = "signal_forecast_history";

interface ForecastEntry {
  hour: number;
  rssi: number;
  date: string;
}

function loadHistory(): ForecastEntry[] {
  try {
    const s = localStorage.getItem(FORECAST_KEY);
    return s ? (JSON.parse(s) as ForecastEntry[]) : [];
  } catch {
    return [];
  }
}

export function recordSignalReading(rssi: number) {
  const h = loadHistory();
  h.push({
    hour: new Date().getHours(),
    rssi,
    date: new Date().toDateString(),
  });
  if (h.length > 500) h.splice(0, h.length - 500);
  localStorage.setItem(FORECAST_KEY, JSON.stringify(h));
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);

export function SignalForecastEngine({ currentRssi }: { currentRssi: number }) {
  const [avgByHour, setAvgByHour] = useState<(number | null)[]>(
    new Array(24).fill(null),
  );

  useEffect(() => {
    recordSignalReading(currentRssi);
    const h = loadHistory();
    const buckets: number[][] = Array.from({ length: 24 }, () => []);
    for (const e of h) buckets[e.hour].push(e.rssi);
    const avgs = buckets.map((b) =>
      b.length > 0 ? b.reduce((a, v) => a + v, 0) / b.length : null,
    );
    setAvgByHour(avgs);
  }, [currentRssi]);

  const validEntries = avgByHour
    .map((v, h) => ({ h, v }))
    .filter((e) => e.v !== null) as { h: number; v: number }[];

  const top3 = [...validEntries]
    .sort((a, b) => b.v - a.v)
    .slice(0, 3)
    .map((e) => e.h);

  const minRssi = -110;
  const maxRssi = -60;
  const clamp = (v: number) =>
    Math.max(0, Math.min(1, (v - minRssi) / (maxRssi - minRssi)));

  const currentHour = new Date().getHours();

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📈</span>
        <h4 className="font-bold text-sm text-foreground">
          Signal Forecast Engine
        </h4>
        <span className="text-xs text-muted-foreground ml-auto">
          Based on your readings
        </span>
      </div>

      {validEntries.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Use the app more to build hourly signal predictions.
        </p>
      ) : (
        <>
          <div className="flex items-end gap-px h-14 mb-2">
            {HOURS_24.map((hour) => {
              const val = avgByHour[hour];
              const height = val !== null ? clamp(val) * 100 : 0;
              const isPeak = top3.includes(hour);
              const isCurrent = hour === currentHour;
              const titleText =
                val !== null
                  ? `${hour}:00 — ${val.toFixed(0)} dBm`
                  : `${hour}:00 — No data`;
              return (
                <div
                  key={`hour-${hour}`}
                  className="flex-1 flex flex-col justify-end items-center"
                  title={titleText}
                >
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      isPeak ? "bg-signal-green" : "bg-primary/40"
                    } ${isCurrent ? "ring-1 ring-white" : ""}`}
                    style={{
                      height: `${Math.max(height, val !== null ? 8 : 0)}%`,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-px text-center mb-3">
            {[0, 6, 12, 18, 23].map((h) => (
              <span
                key={`label-${h}`}
                className="text-[9px] text-muted-foreground"
                style={{
                  marginLeft: `${(h / 23) * 100}%`,
                  position: "relative",
                }}
              >
                {h}h
              </span>
            ))}
          </div>
          {top3.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">
                ⭐ Peak Signal Windows:
              </p>
              <div className="flex flex-wrap gap-2">
                {top3.map((h) => (
                  <motion.span
                    key={`peak-${h}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xs bg-signal-green/10 text-signal-green border border-signal-green/20 rounded-full px-3 py-1 font-semibold"
                  >
                    {h}:00 – {(h + 1) % 24}:00
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
