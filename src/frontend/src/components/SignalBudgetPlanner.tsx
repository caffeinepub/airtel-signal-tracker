import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";
import { useState } from "react";

export function SignalBudgetPlanner() {
  const [eirp, setEirp] = useState("47");
  const [dist, setDist] = useState("5");
  const [cableLoss, setCableLoss] = useState("3");
  const [antennaGain, setAntennaGain] = useState("9");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const d = Number.parseFloat(dist);
    const f = 1800; // MHz
    const pathLoss = 20 * Math.log10(d) + 20 * Math.log10(f) + 32.4;
    const rx =
      Number.parseFloat(eirp) -
      pathLoss -
      Number.parseFloat(cableLoss) +
      Number.parseFloat(antennaGain);
    setResult(Math.round(rx * 10) / 10);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Signal Budget Planner
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          {
            label: "Tower EIRP (dBm)",
            val: eirp,
            set: setEirp,
            id: "budget.eirp.input",
          },
          {
            label: "Distance (km)",
            val: dist,
            set: setDist,
            id: "budget.dist.input",
          },
          {
            label: "Cable Loss (dB)",
            val: cableLoss,
            set: setCableLoss,
            id: "budget.cable.input",
          },
          {
            label: "Antenna Gain (dBi)",
            val: antennaGain,
            set: setAntennaGain,
            id: "budget.gain.input",
          },
        ].map((f) => (
          <div key={f.id}>
            <Label className="text-[10px] text-muted-foreground">
              {f.label}
            </Label>
            <Input
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              className="h-8 text-sm mt-1"
              data-ocid={f.id}
            />
          </div>
        ))}
      </div>
      <Button
        size="sm"
        className="h-8 text-xs w-full btn-airtel"
        onClick={calculate}
        data-ocid="budget.calculate.button"
      >
        Calculate Budget
      </Button>
      {result !== null && (
        <div className="mt-3 bg-primary/5 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">
            Expected received signal:
          </p>
          <p
            className={`text-2xl font-bold ${result >= -75 ? "text-emerald-600" : result >= -90 ? "text-yellow-600" : "text-destructive"}`}
          >
            {result.toFixed(1)} dBm
          </p>
        </div>
      )}
    </div>
  );
}
