import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { Tower } from "../backend.d";
import type { GPSPosition } from "../hooks/useGPS";
import { calculateDistance } from "../utils/geo";

function getCongestion(h: number): { level: string; color: string } {
  if ((h >= 7 && h < 9) || (h >= 12 && h < 14) || (h >= 18 && h < 22)) {
    return { level: "High", color: "bg-red-100 text-red-700 border-red-200" };
  }
  if ((h >= 9 && h < 12) || (h >= 14 && h < 18)) {
    return {
      level: "Medium",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
  }
  return {
    level: "Low",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
}

interface Props {
  towers: Tower[];
  userPosition: GPSPosition;
}

export function TowerCongestionIndicator({ towers, userPosition }: Props) {
  const h = new Date().getHours();
  const nearestFive = towers
    .map((t) => ({
      tower: t,
      dist: calculateDistance(
        userPosition.latitude,
        userPosition.longitude,
        t.latitude,
        t.longitude,
      ),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">Tower Congestion</h4>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {h}:00 now
        </span>
      </div>
      <div className="space-y-2">
        {nearestFive.map(({ tower }) => {
          const cong = getCongestion(h);
          return (
            <div key={tower.name} className="flex items-center gap-2">
              <span className="text-xs text-foreground truncate flex-1">
                {tower.name}
              </span>
              <Badge
                className={`text-[10px] px-1.5 py-0 border shrink-0 ${cong.color}`}
              >
                {cong.level}
              </Badge>
            </div>
          );
        })}
        {nearestFive.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No tower data available
          </p>
        )}
      </div>
    </div>
  );
}
