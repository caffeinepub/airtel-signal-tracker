import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { CommunitySignalReport, Tower } from "../backend.d";
import { SignalQuality } from "../backend.d";

interface TowerOutageBannerProps {
  nearestTower: Tower | null;
  communityReports: CommunitySignalReport[];
}

function countNoneReports(reports: CommunitySignalReport[]): number {
  return reports.filter((r) => {
    const q = r.quality;
    return q === SignalQuality.None || (typeof q === "object" && "None" in q);
  }).length;
}

export function TowerOutageBanner({
  nearestTower,
  communityReports,
}: TowerOutageBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const hasOutage = countNoneReports(communityReports) >= 3;
  if (!hasOutage) return null;

  return (
    <div
      data-ocid="map.outage_banner.panel"
      className="mx-2 bg-destructive/10 border border-destructive/30 rounded-xl p-3"
    >
      <div className="flex items-start gap-2">
        <span className="text-base mt-0.5">⚠️</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-destructive">Outage Reported</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Community reports indicate possible issues near{" "}
            <strong>{nearestTower?.name ?? "nearest tower"}</strong>. Signal may
            be degraded.
          </p>
        </div>
        <Button
          data-ocid="map.outage_banner.close_button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}

export function getOutageBadge(
  _towerName: string,
  reports: CommunitySignalReport[],
): boolean {
  return countNoneReports(reports) >= 3;
}
