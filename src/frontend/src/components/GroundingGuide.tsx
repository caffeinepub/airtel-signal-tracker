import { ChevronDown, ChevronUp, Shield } from "lucide-react";
import { useState } from "react";

const STEPS = [
  {
    title: "Ground Rod",
    desc: "Drive a 1.2m copper ground rod at least 1m into the earth near the mast base.",
    icon: "🪨",
  },
  {
    title: "Bonding Wire",
    desc: "Connect mast to ground rod using 6mm² copper wire. Use cable clamps, not tape.",
    icon: "💫",
  },
  {
    title: "Surge Arrester",
    desc: "Install coax surge arrester (e.g. Proxicast) between cable and router. Ground its port.",
    icon: "⚡",
  },
  {
    title: "Cable Entry Point",
    desc: "Route coax through weatherproof entry port. Seal with self-amalgamating tape.",
    icon: "🔬",
  },
  {
    title: "Test Continuity",
    desc: "Use a multimeter to confirm <1 ohm resistance from mast to ground rod.",
    icon: "✔️",
  },
];

export function GroundingGuide() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Lightning Grounding Guide
        </h4>
      </div>
      <div className="space-y-2">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="bg-secondary/40 rounded-lg overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center gap-2 p-3 text-left"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <span className="text-base">{step.icon}</span>
              <span className="text-xs font-semibold text-foreground flex-1">
                Step {i + 1}: {step.title}
              </span>
              {openIdx === i ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            {openIdx === i && (
              <div className="px-3 pb-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
