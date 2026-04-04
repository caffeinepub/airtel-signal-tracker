import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

const HISTORY_KEY = "rssi_history_v2";

interface RssiEntry {
  ts: number;
  rssi: number;
}

function loadHistory(): RssiEntry[] {
  try {
    const s = localStorage.getItem(HISTORY_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: RssiEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(-200)));
}

interface Props {
  rssi: number;
}

export function SignalDegradationTimer({ rssi }: Props) {
  const [hoursUntilDrop, setHoursUntilDrop] = useState<number | null>(null);
  const [hasEnoughData, setHasEnoughData] = useState(false);

  useEffect(() => {
    // Log current rssi
    const history = loadHistory();
    history.push({ ts: Date.now(), rssi });
    saveHistory(history);

    // Need at least 10 readings across 2+ hours
    const now = Date.now();
    const recent = history.filter((e) => now - e.ts < 7 * 24 * 60 * 60 * 1000);
    if (recent.length < 10) {
      setHasEnoughData(false);
      return;
    }
    setHasEnoughData(true);

    // Find avg rssi by hour-of-day
    const byHour: Record<number, number[]> = {};
    for (const e of recent) {
      const h = new Date(e.ts).getHours();
      if (!byHour[h]) byHour[h] = [];
      byHour[h].push(e.rssi);
    }
    const hourAvg: Record<number, number> = {};
    for (const [h, vals] of Object.entries(byHour)) {
      hourAvg[Number(h)] = vals.reduce((a, b) => a + b, 0) / vals.length;
    }

    // Find next hour when avg drops below -90
    const currentHour = new Date().getHours();
    for (let offset = 1; offset <= 12; offset++) {
      const h = (currentHour + offset) % 24;
      if (hourAvg[h] !== undefined && hourAvg[h] < -90) {
        setHoursUntilDrop(offset);
        return;
      }
    }
    setHoursUntilDrop(null);
  }, [rssi]);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Signal Degradation Timer
        </h4>
      </div>
      {!hasEnoughData ? (
        <p className="text-xs text-muted-foreground">
          Collect more data — keep app open daily to build a 7-day pattern.
        </p>
      ) : hoursUntilDrop !== null ? (
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-destructive">
            {hoursUntilDrop}h
          </div>
          <p className="text-xs text-muted-foreground">
            Signal may drop in ~{hoursUntilDrop} hour
            {hoursUntilDrop !== 1 ? "s" : ""} based on historical patterns.
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No degradation predicted in the next 12 hours. ✅
        </p>
      )}
    </div>
  );
}
