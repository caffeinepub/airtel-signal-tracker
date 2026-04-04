import { Badge } from "@/components/ui/badge";
import { Signal } from "lucide-react";
import type { Tower } from "../backend.d";
import type { GPSPosition } from "../hooks/useGPS";
import { calculateDistance, estimateRSSI } from "../utils/geo";

interface MultiTowerComparisonProps {
  towers: Tower[];
  userPosition: GPSPosition;
}

function rssiColor(rssi: number): string {
  if (rssi >= -75) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (rssi >= -90) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export function MultiTowerComparison({
  towers,
  userPosition,
}: MultiTowerComparisonProps) {
  if (towers.length === 0) return null;

  const entries = towers
    .map((t) => {
      const dist = calculateDistance(
        userPosition.latitude,
        userPosition.longitude,
        t.latitude,
        t.longitude,
      );
      const rssi = estimateRSSI(dist);
      return { tower: t, dist, rssi };
    })
    .sort((a, b) => b.rssi - a.rssi);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Signal className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">All Tower Signals</h4>
        <Badge className="ml-auto text-xs bg-primary/10 text-primary border-primary/20">
          {towers.length} towers
        </Badge>
      </div>
      <div className="space-y-2">
        {entries.map(({ tower, dist, rssi }, i) => (
          <div key={tower.name} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-4 shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {tower.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {dist.toFixed(1)} km away
              </p>
            </div>
            <div className="w-24">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((rssi + 110) / 50) * 100))}%`,
                  }}
                />
              </div>
            </div>
            <Badge
              className={`text-[10px] px-1.5 py-0 shrink-0 border ${rssiColor(rssi)}`}
            >
              {rssi.toFixed(0)} dBm
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
