import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

const SCORE_KEY = "signal_hunter_score";

type AwardReason = "report" | "wizard" | "speed" | "daily";

const POINTS: Record<AwardReason, number> = {
  report: 10,
  wizard: 5,
  speed: 20,
  daily: 5,
};

interface ScoreData {
  total: number;
  lastOpenDate: string;
}

function loadScore(): ScoreData {
  try {
    const s = localStorage.getItem(SCORE_KEY);
    return s ? (JSON.parse(s) as ScoreData) : { total: 0, lastOpenDate: "" };
  } catch {
    return { total: 0, lastOpenDate: "" };
  }
}

export function awardPoints(reason: AwardReason) {
  const data = loadScore();
  data.total += POINTS[reason];
  localStorage.setItem(SCORE_KEY, JSON.stringify(data));
  // Dispatch custom event so component can re-render
  window.dispatchEvent(new CustomEvent("signal_score_updated"));
}

function getRankInfo(total: number): {
  rank: string;
  nextThreshold: number;
  color: string;
} {
  if (total >= 300)
    return {
      rank: "Signal Master",
      nextThreshold: 300,
      color: "text-yellow-500",
    };
  if (total >= 151)
    return { rank: "Expert", nextThreshold: 300, color: "text-blue-500" };
  if (total >= 51)
    return { rank: "Explorer", nextThreshold: 151, color: "text-primary" };
  return {
    rank: "Beginner",
    nextThreshold: 51,
    color: "text-muted-foreground",
  };
}

export function SignalHunterScore() {
  const [data, setData] = useState<ScoreData>(loadScore);

  // Award daily points
  useEffect(() => {
    const today = new Date().toDateString();
    const current = loadScore();
    if (current.lastOpenDate !== today) {
      current.lastOpenDate = today;
      current.total += POINTS.daily;
      localStorage.setItem(SCORE_KEY, JSON.stringify(current));
    }
    setData(loadScore());
  }, []);

  // Listen for score updates from other components
  useEffect(() => {
    const handler = () => setData(loadScore());
    window.addEventListener("signal_score_updated", handler);
    return () => window.removeEventListener("signal_score_updated", handler);
  }, []);

  const { rank, nextThreshold, color } = getRankInfo(data.total);
  const prevThreshold =
    data.total >= 300 ? 151 : data.total >= 151 ? 51 : data.total >= 51 ? 0 : 0;
  const progress =
    data.total >= 300
      ? 100
      : ((data.total - prevThreshold) / (nextThreshold - prevThreshold)) * 100;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <h4 className="font-bold text-sm text-foreground">
          Signal Hunter Score
        </h4>
        <span className="ml-auto text-lg font-bold text-foreground">
          {data.total} pts
        </span>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-sm font-bold ${color}`}>🏆 {rank}</span>
        {data.total < 300 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {nextThreshold - data.total} pts to next rank
          </span>
        )}
      </div>
      <Progress value={Math.min(progress, 100)} className="h-2" />
      <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] text-muted-foreground">
        <span>📶 +10 pts: Signal report</span>
        <span>🧭 +5 pts: Complete wizard</span>
        <span>⚡ +20 pts: Speed &gt;5 Mbps</span>
        <span>📅 +5 pts: Daily open</span>
      </div>
    </div>
  );
}
