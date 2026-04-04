import { Badge } from "@/components/ui/badge";
import { Monitor } from "lucide-react";
import type { Tower } from "../backend.d";
import type { GPSPosition } from "../hooks/useGPS";
import { calculateBearing } from "../utils/geo";

interface Props {
  towers: Tower[];
  userPosition: GPSPosition;
  bearing: number;
}

export function ARTowerLabelOverlay({ towers, userPosition, bearing }: Props) {
  if (towers.length === 0) return null;

  const entries = towers
    .map((t) => {
      const b = calculateBearing(
        userPosition.latitude,
        userPosition.longitude,
        t.latitude,
        t.longitude,
      );
      const relAngle = (b - bearing + 360) % 360;
      const dist =
        Math.sqrt(
          (t.latitude - userPosition.latitude) ** 2 +
            (t.longitude - userPosition.longitude) ** 2,
        ) * 111;
      return { tower: t, relAngle, dist };
    })
    .filter((e) => e.relAngle < 60 || e.relAngle > 300);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {entries.map((e) => {
        const xVal = e.relAngle <= 60 ? 50 + (e.relAngle / 60) * 40 : 10;
        const isNearest = e.dist === Math.min(...entries.map((en) => en.dist));
        return (
          <div
            key={e.tower.name}
            className="absolute top-4"
            style={{ left: `${xVal}%`, transform: "translateX(-50%)" }}
          >
            <div
              className={`rounded-lg px-2 py-1 text-[10px] font-bold ${isNearest ? "bg-emerald-500 text-white" : "bg-black/60 text-white"}`}
            >
              <Monitor className="w-2.5 h-2.5 inline mr-1" />
              {e.tower.name.slice(0, 12)}
              <span className="ml-1 opacity-80">{e.dist.toFixed(1)}km</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
