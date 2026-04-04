import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign } from "lucide-react";
import { useState } from "react";

type AntennaType = "omni" | "directional";
type MountType = "wall" | "pole" | "roof";

const PRICES = {
  antenna: { omni: 80000, directional: 180000 },
  mount: { wall: 30000, pole: 50000, roof: 80000 },
  cable_per_m: 3000,
  installer: 150000,
};

export function InstallationCostEstimator() {
  const [antennaType, setAntennaType] = useState<AntennaType>("directional");
  const [cableLen, setCableLen] = useState("10");
  const [mountType, setMountType] = useState<MountType>("roof");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const cable = Number.parseInt(cableLen) * PRICES.cable_per_m;
    const total =
      PRICES.antenna[antennaType] +
      PRICES.mount[mountType] +
      cable +
      PRICES.installer;
    setResult(total);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Installation Cost Estimator
        </h4>
      </div>
      <div className="space-y-3 mb-3">
        <div>
          <Label className="text-[10px] text-muted-foreground">
            Antenna Type
          </Label>
          <Select
            value={antennaType}
            onValueChange={(v) => setAntennaType(v as AntennaType)}
          >
            <SelectTrigger
              className="h-8 text-xs mt-1"
              data-ocid="cost.antenna.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="omni">Omnidirectional (UGX 80,000)</SelectItem>
              <SelectItem value="directional">
                Directional (UGX 180,000)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">
              Cable Length (m)
            </Label>
            <Input
              value={cableLen}
              onChange={(e) => setCableLen(e.target.value)}
              className="h-8 text-sm mt-1"
              data-ocid="cost.cable.input"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">
              Mount Type
            </Label>
            <Select
              value={mountType}
              onValueChange={(v) => setMountType(v as MountType)}
            >
              <SelectTrigger
                className="h-8 text-xs mt-1"
                data-ocid="cost.mount.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wall">Wall (UGX 30,000)</SelectItem>
                <SelectItem value="pole">Pole (UGX 50,000)</SelectItem>
                <SelectItem value="roof">Roof (UGX 80,000)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Button
        size="sm"
        className="h-8 text-xs w-full btn-airtel"
        onClick={calculate}
        data-ocid="cost.calculate.button"
      >
        Estimate Cost
      </Button>
      {result !== null && (
        <div className="mt-3 bg-primary/5 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            Estimated total (materials + installer):
          </p>
          <p className="text-2xl font-bold text-primary">
            UGX {result.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Prices are approximate for Moroto area
          </p>
        </div>
      )}
    </div>
  );
}
