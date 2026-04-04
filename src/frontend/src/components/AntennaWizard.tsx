import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const WIZARD_KEY = "antenna_wizard";

const STEPS = [
  {
    emoji: "📍",
    title: "Choose Site",
    description:
      "Find an open spot with clear line of sight to the nearest tower. Avoid obstacles like tall trees or buildings between you and the tower.",
  },
  {
    emoji: "📏",
    title: "Set Height",
    description:
      "Mount the antenna at least 4 meters above ground for best results. Higher mounting reduces interference from ground-level obstacles.",
  },
  {
    emoji: "🧭",
    title: "Aim Direction",
    description:
      "Use the Compass tab to find the exact bearing to the nearest Airtel tower. Rotate the antenna slowly and check signal on the Home tab.",
  },
  {
    emoji: "🔌",
    title: "Run Cable",
    description:
      "Use LMR-400 coaxial cable under 10 meters to minimize signal loss. Weatherproof all outdoor connections with self-amalgamating tape.",
  },
  {
    emoji: "📶",
    title: "Test Signal",
    description:
      "Connect the router and run a speed test on the Home tab. Fine-tune direction ±5° to maximize signal before tightening all bolts.",
  },
];

function loadSteps(): boolean[] {
  try {
    const stored = localStorage.getItem(WIZARD_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === STEPS.length) {
        return parsed as boolean[];
      }
    }
  } catch {
    // ignore
  }
  return new Array(STEPS.length).fill(false);
}

export function AntennaWizard() {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState<boolean[]>(loadSteps);

  const doneCount = completed.filter(Boolean).length;
  const progress = (doneCount / STEPS.length) * 100;

  const toggle = (idx: number) => {
    setCompleted((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      localStorage.setItem(WIZARD_KEY, JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    const cleared = new Array(STEPS.length).fill(false);
    setCompleted(cleared);
    localStorage.setItem(WIZARD_KEY, JSON.stringify(cleared));
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <button
        type="button"
        data-ocid="guidance.wizard.toggle"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            📡 Antenna Wizard
          </span>
          <span className="text-xs text-muted-foreground">
            {doneCount}/{STEPS.length} steps
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <div className="px-4 pb-1">
        <Progress value={progress} className="h-2" />
      </div>

      {open && (
        <div className="px-4 pb-4 mt-3 space-y-4">
          {STEPS.map((step, idx) => (
            <div
              key={step.title}
              data-ocid={`guidance.wizard.step.${idx + 1}`}
              className={`rounded-xl p-3 border transition-colors ${
                completed[idx]
                  ? "bg-signal-green/5 border-signal-green/20"
                  : "bg-secondary/50 border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`wizard-step-${idx}`}
                  data-ocid={`guidance.wizard.checkbox.${idx + 1}`}
                  checked={completed[idx]}
                  onCheckedChange={() => toggle(idx)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`wizard-step-${idx}`}
                    className={`font-semibold text-sm cursor-pointer ${
                      completed[idx]
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {step.emoji} Step {idx + 1}: {step.title}
                  </Label>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      completed[idx]
                        ? "text-muted-foreground/60"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {doneCount === STEPS.length && (
            <div className="bg-signal-green/10 border border-signal-green/30 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-signal-green">
                🎉 Installation Complete!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your antenna is fully set up.
              </p>
            </div>
          )}

          <Button
            data-ocid="guidance.wizard.reset.button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs h-7"
            onClick={reset}
          >
            Reset Wizard
          </Button>
        </div>
      )}
    </div>
  );
}
