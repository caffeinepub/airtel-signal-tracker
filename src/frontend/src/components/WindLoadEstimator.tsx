import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wind } from "lucide-react";
import { useState } from "react";

export function WindLoadEstimator() {
  const [windSpeed, setWindSpeed] = useState("60");
  const [diameter, setDiameter] = useState("30");
  const [result, setResult] = useState<{
    force: number;
    rating: string;
    color: string;
  } | null>(null);

  const calculate = () => {
    const v = Number.parseFloat(windSpeed);
    const d = Number.parseFloat(diameter) / 100; // cm to m
    const area = Math.PI * (d / 2) ** 2;
    const force = 0.5 * 1.2 * (v / 3.6) ** 2 * area * 1.2;
    let rating: string;
    let color: string;
    if (force < 30) {
      rating = "Safe";
      color = "bg-emerald-100 text-emerald-700 border-emerald-200";
    } else if (force < 70) {
      rating = "Caution";
      color = "bg-yellow-100 text-yellow-700 border-yellow-200";
    } else {
      rating = "Dangerous";
      color = "bg-red-100 text-red-700 border-red-200";
    }
    setResult({ force: Math.round(force * 10) / 10, rating, color });
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Wind className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Wind Load Estimator
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <Label className="text-[10px] text-muted-foreground">
            Wind Speed (km/h)
          </Label>
          <Input
            value={windSpeed}
            onChange={(e) => setWindSpeed(e.target.value)}
            className="h-8 text-sm mt-1"
            data-ocid="windload.speed.input"
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">
            Antenna Diameter (cm)
          </Label>
          <Input
            value={diameter}
            onChange={(e) => setDiameter(e.target.value)}
            className="h-8 text-sm mt-1"
            data-ocid="windload.diameter.input"
          />
        </div>
      </div>
      <Button
        size="sm"
        className="h-8 text-xs w-full btn-airtel"
        onClick={calculate}
        data-ocid="windload.calculate.button"
      >
        Estimate Load
      </Button>
      {result && (
        <div className="mt-3 flex items-center gap-3 bg-secondary/40 rounded-lg p-3">
          <div>
            <p className="text-xl font-bold text-foreground">
              {result.force} N
            </p>
            <p className="text-[10px] text-muted-foreground">Force on mount</p>
          </div>
          <Badge className={`ml-auto border ${result.color}`}>
            {result.rating}
          </Badge>
        </div>
      )}
    </div>
  );
}
