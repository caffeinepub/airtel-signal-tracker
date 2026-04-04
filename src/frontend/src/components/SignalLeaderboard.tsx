import type { CommunitySignalReport } from "../backend.d";

interface SignalLeaderboardProps {
  communityReports: CommunitySignalReport[];
}

const PLACEHOLDER_AREAS = [
  { name: "Moroto Town Center", quality: "Excellent", reports: 12 },
  { name: "Kosiroi Market", quality: "Good", reports: 8 },
  { name: "Karita Road", quality: "Fair", reports: 5 },
];

const QUALITY_COLORS: Record<string, string> = {
  Excellent: "bg-signal-green/10 text-signal-green border-signal-green/20",
  Good: "bg-blue-50 text-blue-600 border-blue-200",
  Fair: "bg-yellow-50 text-yellow-600 border-yellow-200",
  Poor: "bg-destructive/10 text-destructive border-destructive/20",
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export function SignalLeaderboard({
  communityReports,
}: SignalLeaderboardProps) {
  // Use real reports if available, else show placeholders
  const hasReports = communityReports.length > 0;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <h4 className="font-bold text-sm text-foreground mb-3">
        🏆 Signal Leaderboard
      </h4>
      <p className="text-xs text-muted-foreground mb-3">
        Top areas with best reported signal this week
      </p>

      {!hasReports ? (
        <div className="space-y-2">
          {PLACEHOLDER_AREAS.map((area, idx) => (
            <div
              key={area.name}
              data-ocid={`map.leaderboard.item.${idx + 1}`}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50"
            >
              <span className="text-base">{RANK_MEDALS[idx]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {area.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {area.reports} reports
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  QUALITY_COLORS[area.quality] ?? QUALITY_COLORS.Fair
                }`}
              >
                {area.quality}
              </span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground text-center mt-2 pt-2 border-t border-border/50">
            Submit signal reports to update the leaderboard with real data
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {communityReports.slice(0, 3).map((report, idx) => {
            const quality = String(
              Object.keys(report.quality ?? {})[0] ?? "Good",
            );
            return (
              <div
                key={`${report.latitude}-${report.longitude}-${idx}`}
                data-ocid={`map.leaderboard.item.${idx + 1}`}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50"
              >
                <span className="text-base">{RANK_MEDALS[idx] ?? "📍"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {report.latitude.toFixed(3)}, {report.longitude.toFixed(3)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Community report
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                    QUALITY_COLORS[quality] ?? QUALITY_COLORS.Fair
                  }`}
                >
                  {quality}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
