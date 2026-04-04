import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { Tower } from "../backend.d";
import type { CommunitySignalReport } from "../backend.d";

const HEALTH_KEY = "tower_health_scores";

interface HealthData {
  [towerName: string]: {
    downtimeReports: number;
    goodReports: number;
    badReports: number;
  };
}

function loadHealth(): HealthData {
  try {
    const s = localStorage.getItem(HEALTH_KEY);
    return s ? (JSON.parse(s) as HealthData) : {};
  } catch {
    return {};
  }
}

function computeScore(
  tower: Tower,
  distanceKm: number,
  data: HealthData,
): number {
  const d = data[tower.name] ?? {
    downtimeReports: 0,
    goodReports: 0,
    badReports: 0,
  };
  let score = 100;
  // Distance: farther = lower
  score -= Math.min(40, distanceKm * 6);
  // Good reports boost
  score += Math.min(20, d.goodReports * 3);
  // Bad reports reduce
  score -= Math.min(20, d.badReports * 4);
  // Downtime reports reduce
  score -= Math.min(30, d.downtimeReports * 10);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function recordTowerHealth(
  towerName: string,
  type: "good" | "bad" | "downtime",
) {
  const data = loadHealth();
  const entry = data[towerName] ?? {
    downtimeReports: 0,
    goodReports: 0,
    badReports: 0,
  };
  if (type === "good") entry.goodReports++;
  else if (type === "bad") entry.badReports++;
  else entry.downtimeReports++;
  data[towerName] = entry;
  localStorage.setItem(HEALTH_KEY, JSON.stringify(data));
}

interface TowerHealthScoreProps {
  tower: Tower | null;
  distanceKm: number;
  communityReports?: CommunitySignalReport[];
}

export function TowerHealthScore({
  tower,
  distanceKm,
  communityReports = [],
}: TowerHealthScoreProps) {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!tower) return;
    const data = loadHealth();
    // Seed community reports into health data
    const towerData = data[tower.name] ?? {
      downtimeReports: 0,
      goodReports: 0,
      badReports: 0,
    };
    towerData.goodReports = communityReports.filter(
      (r) => r.quality === "Good" || r.quality === "Excellent",
    ).length;
    towerData.badReports = communityReports.filter(
      (r) => r.quality === "Weak" || r.quality === "None",
    ).length;
    data[tower.name] = towerData;
    localStorage.setItem(HEALTH_KEY, JSON.stringify(data));
    setScore(computeScore(tower, distanceKm, data));
  }, [tower, distanceKm, communityReports]);

  if (!tower || score === null) return null;

  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Poor";
  const cls =
    score >= 80
      ? "bg-signal-green/10 text-signal-green border-signal-green/20"
      : score >= 60
        ? "bg-yellow-50 text-yellow-600 border-yellow-200"
        : "bg-destructive/10 text-destructive border-destructive/20";

  return (
    <div className="flex items-center gap-3 bg-card rounded-xl border border-border p-3 shadow-xs">
      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <ShieldCheck className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">
          Tower Health — {tower.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                score >= 80
                  ? "bg-signal-green"
                  : score >= 60
                    ? "bg-yellow-400"
                    : "bg-destructive"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-xs font-bold text-foreground">{score}/100</span>
        </div>
      </div>
      <Badge className={`text-xs px-2 py-0.5 border ${cls}`}>{label}</Badge>
    </div>
  );
}
