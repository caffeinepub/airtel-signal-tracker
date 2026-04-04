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
import { Cable, Calculator, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type SegmentType = "horizontal" | "vertical" | "corner" | "wall";
type CableTypeId = "rg6" | "lmr400";

interface CableSegment {
  id: number;
  type: SegmentType;
  length: number;
}

const SEGMENT_TYPES: { value: SegmentType; label: string; color: string }[] = [
  { value: "horizontal", label: "Horizontal Run", color: "bg-blue-500" },
  { value: "vertical", label: "Vertical Drop", color: "bg-purple-500" },
  { value: "corner", label: "Corner", color: "bg-orange-500" },
  { value: "wall", label: "Through Wall", color: "bg-gray-500" },
];

const CABLE_TYPES: {
  id: CableTypeId;
  label: string;
  pricePerM: number;
  lossPerHundredM: number;
}[] = [
  {
    id: "rg6",
    label: "RG-6 (3,500 UGX/m)",
    pricePerM: 3500,
    lossPerHundredM: 6.6,
  },
  {
    id: "lmr400",
    label: "LMR-400 (8,500 UGX/m)",
    pricePerM: 8500,
    lossPerHundredM: 2.2,
  },
];

let nextId = 1;

function formatUGX(amount: number): string {
  return `${amount.toLocaleString()} UGX`;
}

function getSegmentColor(type: SegmentType): string {
  return SEGMENT_TYPES.find((s) => s.value === type)?.color ?? "bg-gray-400";
}

function getSegmentLabel(type: SegmentType): string {
  return SEGMENT_TYPES.find((s) => s.value === type)?.label ?? type;
}

export function CableRunPlanner() {
  const [segments, setSegments] = useState<CableSegment[]>([
    { id: nextId++, type: "horizontal", length: 5 },
    { id: nextId++, type: "vertical", length: 3 },
  ]);
  const [cableTypeId, setCableTypeId] = useState<CableTypeId>("rg6");

  const cable = CABLE_TYPES.find((c) => c.id === cableTypeId) ?? CABLE_TYPES[0];
  const totalLength = segments.reduce((sum, s) => sum + s.length, 0);
  const totalCost = totalLength * cable.pricePerM;
  const totalLoss = (cable.lossPerHundredM * totalLength) / 100;

  const addSegment = () => {
    if (segments.length >= 8) return;
    setSegments((prev) => [
      ...prev,
      { id: nextId++, type: "horizontal", length: 5 },
    ]);
  };

  const removeSegment = (id: number) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSegment = (
    id: number,
    field: keyof Omit<CableSegment, "id">,
    value: string | number,
  ) => {
    setSegments((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              [field]:
                field === "length"
                  ? Math.min(30, Math.max(1, Number(value) || 1))
                  : value,
            }
          : s,
      ),
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Cable className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">Cable Run Planner</h4>
      </div>

      {/* Cable type selector */}
      <div>
        <Label className="text-xs text-muted-foreground">Cable Type</Label>
        <Select
          value={cableTypeId}
          onValueChange={(v) => setCableTypeId(v as CableTypeId)}
        >
          <SelectTrigger
            data-ocid="cable.planner.type.select"
            className="mt-1 h-9 text-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CABLE_TYPES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Visual path diagram */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">
          Path Diagram
        </Label>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {segments.map((seg, idx) => (
            <div key={seg.id} className="flex items-center gap-1 shrink-0">
              <div
                className={`${getSegmentColor(seg.type)} rounded px-2 py-1 text-white text-[10px] font-bold whitespace-nowrap`}
                title={getSegmentLabel(seg.type)}
              >
                {seg.length}m
              </div>
              {idx < segments.length - 1 && (
                <div className="w-3 h-0.5 bg-border" />
              )}
            </div>
          ))}
          {segments.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No segments yet
            </p>
          )}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-2">
          {SEGMENT_TYPES.map((s) => (
            <div key={s.value} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-sm ${s.color}`} />
              <span className="text-[10px] text-muted-foreground">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Segments list */}
      <div className="space-y-2">
        {segments.map((seg, idx) => (
          <div key={seg.id} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-4 shrink-0">
              {idx + 1}.
            </span>
            <Select
              value={seg.type}
              onValueChange={(v) => updateSegment(seg.id, "type", v)}
            >
              <SelectTrigger
                data-ocid={`cable.planner.segment.type.select.${idx + 1}`}
                className="h-8 text-xs flex-1 min-w-0"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEGMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              data-ocid={`cable.planner.segment.length.input.${idx + 1}`}
              type="number"
              min={1}
              max={30}
              value={seg.length}
              onChange={(e) => updateSegment(seg.id, "length", e.target.value)}
              className="w-16 h-8 text-xs"
            />
            <span className="text-xs text-muted-foreground">m</span>
            <Button
              data-ocid={`cable.planner.segment.delete_button.${idx + 1}`}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
              onClick={() => removeSegment(seg.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add segment button */}
      <Button
        data-ocid="cable.planner.add.button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={addSegment}
        disabled={segments.length >= 8}
      >
        <Plus className="w-3 h-3 mr-2" />
        Add Segment{" "}
        {segments.length >= 8 ? "(max 8)" : `(${segments.length}/8)`}
      </Button>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Total Length</p>
          <p className="text-lg font-bold text-foreground">{totalLength}m</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Total Cost</p>
          <p className="text-sm font-bold text-foreground">
            {formatUGX(totalCost)}
          </p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Signal Loss</p>
          <p
            className={`text-lg font-bold ${
              totalLoss > 3 ? "text-destructive" : "text-green-600"
            }`}
          >
            −{totalLoss.toFixed(1)} dB
          </p>
        </div>
      </div>

      {totalLoss > 3 && (
        <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
          <Calculator className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Signal loss exceeds 3 dB. Consider upgrading to LMR-400 cable or
            reducing total run length.
          </p>
        </div>
      )}
    </div>
  );
}
