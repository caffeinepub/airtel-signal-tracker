import { Trophy } from "lucide-react";

const REPORTS_KEY = "community_signal_reports";

interface LocalReport {
  author?: string;
  timestamp?: number;
}

export function NeighborhoodSignalChampion() {
  let champion: { name: string; count: number } | null = null;

  try {
    const reports: LocalReport[] = JSON.parse(
      localStorage.getItem(REPORTS_KEY) ?? "[]",
    );
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = reports.filter((r) => (r.timestamp ?? 0) > oneWeekAgo);
    const counts: Record<string, number> = {};
    for (const r of recent) {
      const name = r.author ?? "Anonymous";
      counts[name] = (counts[name] ?? 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0)
      champion = { name: sorted[0][0], count: sorted[0][1] };
  } catch {
    /* ignore */
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <h4 className="font-bold text-sm text-foreground">Signal Champion</h4>
        <span className="text-[10px] text-muted-foreground ml-auto">
          This week
        </span>
      </div>
      {champion ? (
        <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-sm font-bold text-foreground">{champion.name}</p>
            <p className="text-xs text-muted-foreground">
              {champion.count} signal report{champion.count !== 1 ? "s" : ""}{" "}
              this week
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-2xl mb-1">📶</p>
          <p className="text-xs font-semibold text-foreground">
            Be the first champion!
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Submit signal reports on the Map tab to earn recognition
          </p>
        </div>
      )}
    </div>
  );
}
