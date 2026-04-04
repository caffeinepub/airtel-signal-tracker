import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const APN_KEY = "apn_reset_steps";

const APN_STEPS = [
  {
    text: "Go to phone Settings → Mobile Networks → APN",
    code: null,
  },
  {
    text: "Delete the existing Airtel APN entry",
    code: null,
  },
  {
    text: 'Tap "+" to add a new APN',
    code: null,
  },
  {
    text: "Fill in the APN details below:",
    code: null,
  },
  {
    text: "Save and restart your phone",
    code: null,
  },
];

const APN_VALUES = [
  { label: "Name", value: "Airtel Uganda" },
  { label: "APN", value: "internet" },
  { label: "Username", value: "(leave blank)" },
  { label: "Password", value: "(leave blank)" },
  { label: "MCC", value: "641" },
  { label: "MNC", value: "01" },
];

function loadSteps(): boolean[] {
  try {
    const stored = localStorage.getItem(APN_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === APN_STEPS.length) {
        return parsed as boolean[];
      }
    }
  } catch {
    // ignore
  }
  return new Array(APN_STEPS.length).fill(false);
}

export function ApnResetGuide() {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<boolean[]>(loadSteps);

  const toggle = (idx: number) => {
    setSteps((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      localStorage.setItem(APN_KEY, JSON.stringify(next));
      return next;
    });
  };

  const doneCount = steps.filter(Boolean).length;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <button
        type="button"
        data-ocid="guidance.apn.toggle"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            🔧 APN Reset Guide
          </span>
          <span className="text-xs text-muted-foreground">
            {doneCount}/{APN_STEPS.length}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Reset your Airtel APN settings to fix internet connection issues.
          </p>

          <div className="space-y-3">
            {APN_STEPS.map((step, idx) => (
              <div key={step.text}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`apn-step-${idx}`}
                    data-ocid={`guidance.apn.checkbox.${idx + 1}`}
                    checked={steps[idx]}
                    onCheckedChange={() => toggle(idx)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`apn-step-${idx}`}
                    className={`text-sm cursor-pointer leading-snug ${
                      steps[idx]
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {idx + 1}. {step.text}
                  </Label>
                </div>

                {/* Show APN values card after step 4 */}
                {idx === 3 && (
                  <div className="mt-2 ml-6 bg-secondary rounded-xl border border-border overflow-hidden">
                    {APN_VALUES.map((apn) => (
                      <div
                        key={apn.label}
                        className="flex items-center justify-between px-3 py-2 border-b border-border/50 last:border-0"
                      >
                        <span className="text-xs text-muted-foreground w-20 shrink-0">
                          {apn.label}
                        </span>
                        <code className="text-xs font-mono font-bold text-primary ml-auto">
                          {apn.value}
                        </code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {doneCount === APN_STEPS.length && (
            <div className="bg-signal-green/10 border border-signal-green/30 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-signal-green">
                ✅ APN Reset Complete!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Restart your phone to apply the new settings.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
