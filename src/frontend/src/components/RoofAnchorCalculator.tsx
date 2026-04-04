import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, CheckCircle2, Wrench } from "lucide-react";
import { useState } from "react";

type WindZone = "low" | "medium" | "high";
type SurfaceType = "concrete" | "brick" | "wood" | "steel";
type MastDiameter = "30" | "48" | "60";

const WIND_ZONES: {
  value: WindZone;
  label: string;
  multiplier: number;
  note: string;
}[] = [
  {
    value: "low",
    label: "Low — Valley areas",
    multiplier: 1.0,
    note: "Valley and lowland areas have reduced wind exposure. Standard anchoring is sufficient.",
  },
  {
    value: "medium",
    label: "Medium — Open fields",
    multiplier: 1.5,
    note: "Open field installations face moderate wind gusts. Use extra anchors and check bolts seasonally.",
  },
  {
    value: "high",
    label: "High — Hills & ridges",
    multiplier: 2.0,
    note: "Hill and ridge installations face severe Karamoja winds. Use maximum anchors and inspect after storms.",
  },
];

const SURFACES: { value: SurfaceType; label: string; factor: number }[] = [
  { value: "concrete", label: "Concrete", factor: 1.0 },
  { value: "brick", label: "Brick / Block", factor: 1.1 },
  { value: "wood", label: "Timber / Wood", factor: 1.3 },
  { value: "steel", label: "Steel / Metal", factor: 0.9 },
];

function getAnchorColor(anchors: number): string {
  if (anchors <= 4) return "text-green-600 dark:text-green-400";
  if (anchors <= 6) return "text-yellow-600 dark:text-yellow-400";
  return "text-destructive";
}

export function RoofAnchorCalculator() {
  const [diameter, setDiameter] = useState<MastDiameter>("48");
  const [height, setHeight] = useState([4]);
  const [windZone, setWindZone] = useState<WindZone>("medium");
  const [surface, setSurface] = useState<SurfaceType>("concrete");

  const windZoneData =
    WIND_ZONES.find((w) => w.value === windZone) ?? WIND_ZONES[1];
  const surfaceData = SURFACES.find((s) => s.value === surface) ?? SURFACES[0];

  const baseAnchors = Math.ceil(height[0] / 2);
  const anchors = Math.max(
    2,
    Math.ceil(baseAnchors * windZoneData.multiplier * surfaceData.factor),
  );
  const boltSize = Number(diameter) <= 48 ? "M8" : "M10";

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Wrench className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Roof Anchor Calculator
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Mast Diameter */}
        <div>
          <Label className="text-xs text-muted-foreground">Mast Diameter</Label>
          <Select
            value={diameter}
            onValueChange={(v) => setDiameter(v as MastDiameter)}
          >
            <SelectTrigger
              data-ocid="anchor.calc.diameter.select"
              className="mt-1 h-9 text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30mm pipe</SelectItem>
              <SelectItem value="48">48mm pipe</SelectItem>
              <SelectItem value="60">60mm pipe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Surface Type */}
        <div>
          <Label className="text-xs text-muted-foreground">Surface Type</Label>
          <Select
            value={surface}
            onValueChange={(v) => setSurface(v as SurfaceType)}
          >
            <SelectTrigger
              data-ocid="anchor.calc.surface.select"
              className="mt-1 h-9 text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SURFACES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mast height slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs text-muted-foreground">Mast Height</Label>
          <span className="text-xs font-bold text-foreground">
            {height[0]} m
          </span>
        </div>
        <Slider
          data-ocid="anchor.calc.height.input"
          min={1}
          max={12}
          step={1}
          value={height}
          onValueChange={setHeight}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>1m</span>
          <span>6m</span>
          <span>12m</span>
        </div>
      </div>

      {/* Wind zone */}
      <div>
        <Label className="text-xs text-muted-foreground">Wind Zone</Label>
        <Select
          value={windZone}
          onValueChange={(v) => setWindZone(v as WindZone)}
        >
          <SelectTrigger
            data-ocid="anchor.calc.windzone.select"
            className="mt-1 h-9 text-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WIND_ZONES.map((w) => (
              <SelectItem key={w.value} value={w.value}>
                {w.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Result display */}
      <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Anchors Required</p>
            <p className={`text-5xl font-bold ${getAnchorColor(anchors)}`}>
              {anchors}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Bolt Size</p>
            <p className="text-2xl font-bold text-foreground">{boltSize}</p>
            <p className="text-[10px] text-muted-foreground">recommended</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">{height[0]}m</p>
            <p>mast height</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">{diameter}mm</p>
            <p>diameter</p>
          </div>
          <div>
            <p className="font-semibold text-foreground capitalize">
              {windZone}
            </p>
            <p>wind zone</p>
          </div>
        </div>
      </div>

      {/* Safety note */}
      <div
        className={`flex items-start gap-2 rounded-lg p-3 border ${
          anchors <= 4
            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
            : anchors <= 6
              ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
              : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
        }`}
      >
        {anchors <= 4 ? (
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
        )}
        <p
          className={`text-xs ${
            anchors <= 4
              ? "text-green-700 dark:text-green-300"
              : anchors <= 6
                ? "text-yellow-700 dark:text-yellow-300"
                : "text-red-700 dark:text-red-300"
          }`}
        >
          {windZoneData.note}
        </p>
      </div>
    </div>
  );
}
