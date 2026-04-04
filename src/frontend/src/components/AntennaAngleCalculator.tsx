import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function AntennaAngleCalculator() {
  const [height, setHeight] = useState("");
  const [distance, setDistance] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const h = Number.parseFloat(height);
    const d = Number.parseFloat(distance);
    if (Number.isNaN(h) || Number.isNaN(d) || d <= 0) return;
    // tiltAngle: positive = look up (antenna below tower height)
    const tiltAngle = Math.atan((30 - h) / (d * 1000)) * (180 / Math.PI);
    setResult(tiltAngle);
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-card">
      <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
        📐 Antenna Tilt Calculator
      </h4>
      <div className="space-y-3">
        <div>
          <Label
            htmlFor="antenna-height"
            className="text-xs text-muted-foreground"
          >
            Your height above ground (m)
          </Label>
          <Input
            id="antenna-height"
            data-ocid="antenna.height.input"
            type="number"
            placeholder="e.g. 6"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="mt-1 h-10"
          />
        </div>
        <div>
          <Label
            htmlFor="tower-distance"
            className="text-xs text-muted-foreground"
          >
            Tower distance (km)
          </Label>
          <Input
            id="tower-distance"
            data-ocid="antenna.distance.input"
            type="number"
            placeholder="e.g. 3.5"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="mt-1 h-10"
          />
        </div>
        <Button
          data-ocid="antenna.calculate.button"
          onClick={calculate}
          className="btn-airtel w-full h-10 rounded-full text-sm font-bold"
        >
          Calculate Tilt
        </Button>
        {result !== null && (
          <div className="bg-primary/5 rounded-lg p-3 text-center border border-primary/20">
            <p className="text-sm font-bold text-primary">
              Tilt your antenna{" "}
              <span className="text-lg">{Math.abs(result).toFixed(1)}°</span>{" "}
              {result > 0 ? "upward" : "downward"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {result > 0
                ? "Tower is higher than your antenna position"
                : "Tower is lower than your antenna position"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
