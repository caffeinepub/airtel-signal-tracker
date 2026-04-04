import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio } from "lucide-react";
import { toast } from "sonner";

function getBandRecommendation(): {
  band: string;
  freq: string;
  reason: string;
} {
  const h = new Date().getHours();
  if (h >= 6 && h < 9)
    return {
      band: "Band 3",
      freq: "1800 MHz",
      reason: "Morning — good coverage, lower congestion",
    };
  if (h >= 12 && h < 14)
    return {
      band: "Band 20",
      freq: "800 MHz",
      reason: "Midday peak — use low-frequency for penetration",
    };
  if (h >= 18 && h < 22)
    return {
      band: "Band 20",
      freq: "800 MHz",
      reason: "Evening peak — 800 MHz handles congestion better",
    };
  return {
    band: "Band 3",
    freq: "1800 MHz",
    reason: "Off-peak — faster speeds on 1800 MHz",
  };
}

const STEPS = [
  "Open phone Settings",
  "Tap Mobile Network (or SIM & Network)",
  "Tap Preferred Network Type",
  "Select LTE/4G only",
  "Use a 4G band-locking app (e.g. Network Signal Guru) to lock to the recommended band",
];

export function BandSteeringAdvisor() {
  const rec = getBandRecommendation();

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Switch to ${rec.band} (${rec.freq}): ${STEPS.join(" → ")}`,
    );
    toast.success("Steps copied!");
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Radio className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Band Steering Advisor
        </h4>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
          {rec.band}
        </Badge>
        <Badge className="bg-secondary text-muted-foreground text-xs">
          {rec.freq}
        </Badge>
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date().getHours()}:00
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{rec.reason}</p>
      <ol className="space-y-1 mb-3">
        {STEPS.map((step, i) => (
          <li key={step} className="flex gap-2 text-xs text-foreground">
            <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs w-full"
        onClick={handleCopy}
        data-ocid="band_steering.copy.button"
      >
        📋 Copy Steps
      </Button>
    </div>
  );
}
