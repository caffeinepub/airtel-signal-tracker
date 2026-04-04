import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

const KEY = "network_recovery_checklist";

const STEPS = [
  {
    id: 1,
    text: "Restart your phone completely",
    tip: "Hold power button → Restart",
  },
  {
    id: 2,
    text: "Check SIM card is properly inserted",
    tip: "Remove SIM tray, clean contacts, reinsert",
  },
  {
    id: 3,
    text: "Reset APN settings to Airtel default",
    tip: "Settings → Mobile Networks → APN → Reset to default",
  },
  {
    id: 4,
    text: "Move to different location",
    tip: "Go outdoors or higher ground away from buildings",
  },
  {
    id: 5,
    text: "Contact Airtel support",
    tip: "Call 0800 100 100 (free from Airtel number)",
  },
];

function load(): boolean[] {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : new Array(STEPS.length).fill(false);
  } catch {
    return new Array(STEPS.length).fill(false);
  }
}

export function NetworkRecoveryChecklist() {
  const [checks, setChecks] = useState<boolean[]>(load);

  const toggle = (idx: number) => {
    setChecks((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    const cleared = new Array(STEPS.length).fill(false);
    setChecks(cleared);
    localStorage.setItem(KEY, JSON.stringify(cleared));
  };

  const completed = checks.filter(Boolean).length;
  const progress = (completed / STEPS.length) * 100;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Network Recovery Checklist
        </h4>
        <span className="text-xs text-muted-foreground ml-auto">
          {completed}/{STEPS.length}
        </span>
      </div>
      <Progress
        value={progress}
        className="h-1.5 mb-4"
        data-ocid="recovery.progress"
      />
      <div className="space-y-3">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-start gap-3">
            <Checkbox
              id={`recovery-${idx}`}
              checked={checks[idx]}
              onCheckedChange={() => toggle(idx)}
              className="mt-0.5"
              data-ocid={`recovery.checkbox.${idx + 1}`}
            />
            <div className="flex-1">
              <Label
                htmlFor={`recovery-${idx}`}
                className={`text-xs cursor-pointer leading-snug ${checks[idx] ? "line-through text-muted-foreground" : "text-foreground"}`}
              >
                {step.text}
              </Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {step.tip}
              </p>
            </div>
          </div>
        ))}
      </div>
      {completed === STEPS.length && (
        <div className="mt-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-2 text-center">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            ✅ All steps completed! If still no signal, visit an Airtel service
            centre.
          </p>
        </div>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs text-muted-foreground mt-2 w-full"
        onClick={reset}
        data-ocid="recovery.reset.button"
      >
        Reset Checklist
      </Button>
    </div>
  );
}
