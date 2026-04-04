import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Cable } from "lucide-react";
import { useState } from "react";

interface CableType {
  id: string;
  label: string;
  lossPerHundredM: number;
}

const CABLES: CableType[] = [
  { id: "rg6", label: "RG-6", lossPerHundredM: 6.6 },
  { id: "rg11", label: "RG-11", lossPerHundredM: 3.9 },
  { id: "lmr400", label: "LMR-400", lossPerHundredM: 2.2 },
  { id: "lmr600", label: "LMR-600", lossPerHundredM: 1.4 },
];

export function CableLossCalculator() {
  const [cableId, setCableId] = useState("rg6");
  const [length, setLength] = useState([10]);

  const cable = CABLES.find((c) => c.id === cableId) ?? CABLES[0];
  const totalLoss = (cable.lossPerHundredM * length[0]) / 100;
  const recommendUpgrade =
    length[0] > 15 && cableId !== "lmr400" && cableId !== "lmr600";

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Cable className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Cable Loss Calculator
        </h4>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Cable Type</Label>
        <Select value={cableId} onValueChange={setCableId}>
          <SelectTrigger
            data-ocid="guidance.cable.type.select"
            className="mt-1 h-9 text-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CABLES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label} ({c.lossPerHundredM} dB/100m)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs text-muted-foreground">Cable Length</Label>
          <span className="text-xs font-bold text-foreground">
            {length[0]} m
          </span>
        </div>
        <Slider
          data-ocid="guidance.cable.length.input"
          min={1}
          max={50}
          step={1}
          value={length}
          onValueChange={setLength}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>1m</span>
          <span>50m</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Loss</p>
          <p className="text-lg font-bold text-destructive">
            −{totalLoss.toFixed(1)} dBm
          </p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Cable</p>
          <p className="text-base font-bold text-foreground">{cable.label}</p>
          <p className="text-[10px] text-muted-foreground">
            {cable.lossPerHundredM} dB/100m
          </p>
        </div>
      </div>

      {recommendUpgrade && (
        <div className="flex items-start gap-2 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <span className="text-base shrink-0">💡</span>
          <p className="text-xs text-yellow-700">
            <strong>Recommendation:</strong> For cables over 15m, upgrade to
            LMR-400 or LMR-600 to minimize signal loss. Your current cable loses{" "}
            {totalLoss.toFixed(1)} dBm.
          </p>
        </div>
      )}
    </div>
  );
}
