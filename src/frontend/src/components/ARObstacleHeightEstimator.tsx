import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Orientation {
  tilt: number | null;
}

function useDeviceOrientation(): Orientation {
  const [tilt, setTilt] = useState<number | null>(null);
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => setTilt(e.beta);
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, []);
  return { tilt };
}

interface Props {
  distanceToObstacle: number;
}

export function ARObstacleHeightEstimator({ distanceToObstacle }: Props) {
  const { tilt } = useDeviceOrientation();
  const [estimatedHeight, setEstimatedHeight] = useState<number | null>(null);

  const estimate = () => {
    if (tilt === null) return;
    const angleRad = (tilt * Math.PI) / 180;
    const h = distanceToObstacle * Math.tan(Math.abs(angleRad));
    setEstimatedHeight(Math.round(h * 10) / 10);
  };

  return (
    <div className="bg-secondary/40 rounded-xl p-3">
      <p className="text-xs font-semibold text-foreground mb-1">
        🌲 Obstacle Height Estimator
      </p>
      <p className="text-[10px] text-muted-foreground mb-2">
        Point at the top of the obstacle, then tap Estimate.
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground">
            Tilt: {tilt !== null ? `${tilt.toFixed(1)}°` : "No sensor"}
          </p>
          {estimatedHeight !== null && (
            <p className="text-sm font-bold text-primary">
              ~{estimatedHeight} m tall
            </p>
          )}
        </div>
        <Button
          size="sm"
          className="h-8 text-xs btn-airtel"
          onClick={estimate}
          disabled={tilt === null}
          data-ocid="ar_obstacle.estimate.button"
        >
          Estimate
        </Button>
      </div>
    </div>
  );
}
