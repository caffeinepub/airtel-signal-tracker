import { Badge } from "@/components/ui/badge";
import { Gauge } from "lucide-react";
import type { GPSPosition } from "../hooks/useGPS";

interface SpeedBenchmarkEntry {
  date: string;
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
}

const BENCH_KEY = "last_speed_benchmark";

export function saveSpeedBenchmark(data: SpeedBenchmarkEntry) {
  localStorage.setItem(BENCH_KEY, JSON.stringify(data));
}

interface Props {
  rssi: number;
  userPosition?: GPSPosition;
}

export function OfflineSpeedBenchmark({ rssi }: Props) {
  let last: SpeedBenchmarkEntry | null = null;
  try {
    const s = localStorage.getItem(BENCH_KEY);
    last = s ? JSON.parse(s) : null;
  } catch {
    last = null;
  }

  // Estimate current expected speed from rssi
  let estimated: number;
  if (rssi >= -75) estimated = 20 + (rssi + 75) * 1.5;
  else if (rssi >= -90) estimated = 1 + (rssi + 90) * 1.3;
  else estimated = 0.2 + Math.random() * 0.8;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">Speed Benchmark</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/40 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Last Test</p>
          {last ? (
            <>
              <p className="text-lg font-bold text-foreground">
                {last.downloadMbps.toFixed(1)}
              </p>
              <p className="text-[10px] text-muted-foreground">Mbps down</p>
              <p className="text-[10px] text-muted-foreground">{last.date}</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground py-1">No test yet</p>
          )}
        </div>
        <div className="bg-secondary/40 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Est. Current</p>
          <p className="text-lg font-bold text-primary">
            {estimated.toFixed(1)}
          </p>
          <p className="text-[10px] text-muted-foreground">Mbps (from RSSI)</p>
          <Badge
            className={`mt-1 text-[9px] border ${
              rssi >= -75
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : rssi >= -90
                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                  : "bg-red-100 text-red-700 border-red-200"
            }`}
          >
            {rssi.toFixed(0)} dBm
          </Badge>
        </div>
      </div>
    </div>
  );
}
