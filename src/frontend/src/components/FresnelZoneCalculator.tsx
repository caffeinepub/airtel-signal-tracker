import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { useState } from "react";

export function FresnelZoneCalculator() {
  const [dist, setDist] = useState("5");
  const [freq, setFreq] = useState("1800");
  const [obstDist, setObstDist] = useState("2.5");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const d = Number.parseFloat(dist);
    const f = Number.parseFloat(freq);
    const d1 = Number.parseFloat(obstDist);
    const d2 = d - d1;
    if (d > 0 && f > 0 && d1 > 0 && d2 > 0) {
      const r = 17.3 * Math.sqrt((d1 * d2) / (f * (d1 + d2)));
      setResult(Math.round(r * 10) / 10);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Fresnel Zone Calculator
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <Label className="text-[10px] text-muted-foreground">
            Distance to tower (km)
          </Label>
          <Input
            value={dist}
            onChange={(e) => setDist(e.target.value)}
            className="h-8 text-sm mt-1"
            data-ocid="fresnel.dist.input"
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">
            Frequency (MHz)
          </Label>
          <Input
            value={freq}
            onChange={(e) => setFreq(e.target.value)}
            className="h-8 text-sm mt-1"
            data-ocid="fresnel.freq.input"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-[10px] text-muted-foreground">
            Distance from you to obstacle (km)
          </Label>
          <Input
            value={obstDist}
            onChange={(e) => setObstDist(e.target.value)}
            className="h-8 text-sm mt-1"
            data-ocid="fresnel.obstacle.input"
          />
        </div>
      </div>
      <Button
        size="sm"
        className="h-8 text-xs w-full btn-airtel"
        onClick={calculate}
        data-ocid="fresnel.calculate.button"
      >
        Calculate Clearance
      </Button>
      {result !== null && (
        <div className="mt-3 bg-primary/5 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">
            Minimum clearance above obstacle:
          </p>
          <p className="text-2xl font-bold text-primary">{result} m</p>
        </div>
      )}
    </div>
  );
}
