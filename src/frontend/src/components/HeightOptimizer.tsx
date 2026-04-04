import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface HeightOptimizerProps {
  distanceKm: number;
}

function getMinHeight(distanceKm: number): number {
  if (distanceKm < 2) return 3;
  if (distanceKm < 5) return 4;
  if (distanceKm < 10) return 6;
  return 8;
}

export function HeightOptimizer({ distanceKm }: HeightOptimizerProps) {
  const [height, setHeight] = useState(4);
  const gain = (height * 0.8).toFixed(1);
  const minHeight = getMinHeight(distanceKm);
  const isBelowMin = height < minHeight;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <h4 className="font-bold text-sm text-foreground mb-3">
        📏 Height Optimizer
      </h4>

      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-2xl font-bold text-primary">{height}m</p>
          <p className="text-xs text-muted-foreground">antenna height</p>
        </div>
        <div className="text-right">
          <p
            className={`text-lg font-bold ${
              isBelowMin ? "text-destructive" : "text-signal-green"
            }`}
          >
            +{gain} dBm
          </p>
          <p className="text-xs text-muted-foreground">estimated gain</p>
        </div>
      </div>

      <Slider
        data-ocid="guidance.height.slider"
        min={1}
        max={20}
        step={1}
        value={[height]}
        onValueChange={(v) => setHeight(v[0])}
        className="mb-3"
      />

      <div className="flex justify-between text-xs text-muted-foreground mb-3">
        <span>1m</span>
        <span>10m</span>
        <span>20m</span>
      </div>

      <div
        className={`rounded-lg px-3 py-2 text-xs font-medium ${
          isBelowMin
            ? "bg-destructive/10 text-destructive"
            : "bg-signal-green/10 text-signal-green"
        }`}
      >
        {isBelowMin ? (
          <>
            ⚠️ Recommended minimum: <strong>{minHeight}m</strong> for your
            distance ({distanceKm.toFixed(1)} km)
          </>
        ) : (
          <>
            ✅ At <strong>{height}m</strong> height: +{gain} dBm improvement
            {height >= minHeight && " — meets minimum for this distance"}
          </>
        )}
      </div>
    </div>
  );
}
