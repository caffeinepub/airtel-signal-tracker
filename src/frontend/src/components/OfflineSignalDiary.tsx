import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useRef } from "react";
import type { GPSPosition } from "../hooks/useGPS";
import { estimateRSSI } from "../utils/geo";

const DIARY_KEY = "signal_diary";

export interface DiaryEntry {
  id: string;
  date: string;
  time: string;
  rssi: number;
  tower: string;
  lat: number;
  lon: number;
}

function loadDiary(): DiaryEntry[] {
  try {
    const s = localStorage.getItem(DIARY_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function logDiaryEntry(entry: Omit<DiaryEntry, "id">) {
  try {
    const existing = loadDiary();
    existing.push({ ...entry, id: Date.now().toString() });
    localStorage.setItem(DIARY_KEY, JSON.stringify(existing.slice(-200)));
  } catch {
    /* ignore */
  }
}

interface Props {
  userPosition: GPSPosition;
  nearestTowerName: string;
  distanceKm: number;
}

export function OfflineSignalDiary({
  userPosition,
  nearestTowerName,
  distanceKm,
}: Props) {
  const loggedRef = useRef(false);

  useEffect(() => {
    if (loggedRef.current) return;
    loggedRef.current = true;
    const now = new Date();
    logDiaryEntry({
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      rssi: Math.round(estimateRSSI(distanceKm)),
      tower: nearestTowerName,
      lat: userPosition.latitude,
      lon: userPosition.longitude,
    });
  }, [
    userPosition.latitude,
    userPosition.longitude,
    nearestTowerName,
    distanceKm,
  ]);

  const handleExport = () => {
    const entries = loadDiary();
    if (entries.length === 0) return;
    const header = "Date,Time,RSSI (dBm),Tower,Latitude,Longitude";
    const rows = entries.map(
      (e) => `${e.date},${e.time},${e.rssi},"${e.tower}",${e.lat},${e.lon}`,
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signal-diary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const entries = loadDiary();

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📓</span>
        <h4 className="font-bold text-sm text-foreground">Signal Diary</h4>
        <span className="text-xs text-muted-foreground ml-auto">
          {entries.length} entries
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Auto-logs signal readings each visit. Export to CSV for record-keeping.
      </p>
      {entries
        .slice(-3)
        .reverse()
        .map((e) => (
          <div
            key={e.id}
            className="flex items-center gap-2 text-xs py-1 border-b border-border/50 last:border-0"
          >
            <span className="text-muted-foreground">
              {e.date} {e.time}
            </span>
            <span className="font-mono font-bold text-primary ml-auto">
              {e.rssi} dBm
            </span>
          </div>
        ))}
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs w-full mt-3"
        onClick={handleExport}
        data-ocid="diary.export.button"
        disabled={entries.length === 0}
      >
        <Download className="w-3 h-3 mr-1" /> Export CSV
      </Button>
    </div>
  );
}
