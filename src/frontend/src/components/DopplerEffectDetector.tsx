import { Badge } from "@/components/ui/badge";
import { Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { GPSPosition } from "../hooks/useGPS";
import { calculateDistance } from "../utils/geo";

interface Props {
  userPosition: GPSPosition;
}

export function DopplerEffectDetector({ userPosition }: Props) {
  const prevPos = useRef<{ lat: number; lon: number; ts: number } | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const prev = prevPos.current;
    if (prev) {
      const dist = calculateDistance(
        prev.lat,
        prev.lon,
        userPosition.latitude,
        userPosition.longitude,
      );
      const hrs = (now - prev.ts) / 3600000;
      if (hrs > 0.001) {
        const kmh = dist / hrs;
        setSpeed(kmh);
        setIsMoving(kmh > 5);
      }
    }
    prevPos.current = {
      lat: userPosition.latitude,
      lon: userPosition.longitude,
      ts: now,
    };
  }, [userPosition]);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex items-center gap-4">
      <Navigation className="w-5 h-5 text-primary shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-bold text-foreground">Doppler Detector</p>
        <p className="text-[10px] text-muted-foreground">
          {speed !== null
            ? `${speed.toFixed(1)} km/h detected`
            : "Monitoring movement..."}
        </p>
      </div>
      <Badge
        className={`text-[10px] px-1.5 py-0 border ${
          isMoving
            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
            : "bg-emerald-100 text-emerald-700 border-emerald-200"
        }`}
      >
        {isMoving ? "⚠️ Moving" : "✅ Stationary"}
      </Badge>
    </div>
  );
}
