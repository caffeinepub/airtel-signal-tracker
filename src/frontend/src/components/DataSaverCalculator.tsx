import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { useState } from "react";

export function DataSaverCalculator() {
  const [bundleGB, setBundleGB] = useState("1");
  const [dailyMB, setDailyMB] = useState("50");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const totalMB = Number.parseFloat(bundleGB) * 1024;
    const daily = Number.parseFloat(dailyMB);
    if (daily > 0) setResult(Math.floor(totalMB / daily));
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Data Saver Calculator
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <Label className="text-[10px] text-muted-foreground">
            Bundle Size (GB)
          </Label>
          <Input
            value={bundleGB}
            onChange={(e) => setBundleGB(e.target.value)}
            className="h-8 text-sm mt-1"
            data-ocid="data_saver.bundle.input"
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">
            Daily Usage (MB)
          </Label>
          <Input
            value={dailyMB}
            onChange={(e) => setDailyMB(e.target.value)}
            className="h-8 text-sm mt-1"
            data-ocid="data_saver.daily.input"
          />
        </div>
      </div>
      <Button
        size="sm"
        className="h-8 text-xs w-full btn-airtel"
        onClick={calculate}
        data-ocid="data_saver.calculate.button"
      >
        Calculate Days
      </Button>
      {result !== null && (
        <div className="mt-3 bg-primary/5 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">
            Bundle will last approximately:
          </p>
          <p className="text-3xl font-bold text-primary">{result} days</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {bundleGB} GB @ {dailyMB} MB/day
          </p>
        </div>
      )}
    </div>
  );
}
