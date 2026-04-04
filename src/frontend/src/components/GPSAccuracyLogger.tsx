import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import type { GPSPosition } from "../hooks/useGPS";

const KEY = "gps_accuracy_log";

interface AccuracyEntry {
  ts: number;
  accuracy: number;
}

function loadLog(): AccuracyEntry[] {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

interface Props {
  userPosition: GPSPosition & { accuracy?: number };
}

export function GPSAccuracyLogger({ userPosition }: Props) {
  const [log, setLog] = useState<AccuracyEntry[]>(loadLog);

  useEffect(() => {
    const accuracy = userPosition.accuracy ?? 50;
    const entry: AccuracyEntry = { ts: Date.now(), accuracy };
    const updated = [...loadLog(), entry].slice(-20);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setLog(updated);
  }, [userPosition]);

  const current = userPosition.accuracy ?? null;
  const recent = log.slice(-10);
  const maxAcc = Math.max(...recent.map((e) => e.accuracy), 1);
  const chartW = 200;
  const chartH = 40;

  const points =
    recent.length >= 2
      ? recent
          .map((e, i) => {
            const x = (i / (recent.length - 1)) * chartW;
            const y = chartH - (e.accuracy / maxAcc) * chartH;
            return `${x},${y}`;
          })
          .join(" ")
      : null;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          GPS Accuracy Logger
        </h4>
        {current !== null && (
          <Badge
            className={`ml-auto text-[10px] border ${
              current <= 10
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : current <= 30
                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                  : "bg-red-100 text-red-700 border-red-200"
            }`}
          >
            ±{Math.round(current)} m
          </Badge>
        )}
      </div>
      {points ? (
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full mb-2"
          style={{ height: chartH }}
          role="img"
          aria-label="GPS accuracy over time"
        >
          <title>GPS accuracy over time</title>
          <polyline
            points={points}
            fill="none"
            stroke="oklch(0.46 0.22 24.5)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <p className="text-[10px] text-muted-foreground py-2">
          Collecting readings...
        </p>
      )}
      <p className="text-[10px] text-muted-foreground">
        {log.length} readings logged • lower = better
      </p>
    </div>
  );
}
