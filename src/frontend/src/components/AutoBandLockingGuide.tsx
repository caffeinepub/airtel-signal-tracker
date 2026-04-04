import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useState } from "react";

const STEPS = [
  {
    title: "Open Settings",
    desc: "Pull down notification bar → Tap gear icon",
  },
  {
    title: "Mobile Network",
    desc: "Connections → Mobile Networks → Network Mode",
  },
  { title: "Select LTE Only", desc: "Choose 'LTE/4G only' to lock to 4G band" },
  {
    title: "Advanced (Optional)",
    desc: "Use 'Network Signal Guru' app to lock to a specific band (e.g. Band 3 or Band 20)",
  },
  {
    title: "Test Signal",
    desc: "Return to Home tab and check RSSI — should improve within 30 seconds",
  },
];

export function AutoBandLockingGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <button
        type="button"
        data-ocid="band_locking.toggle"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-foreground">
            Auto Band Locking Guide
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {step.title}
                </p>
                <p className="text-[10px] text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs w-full mt-1"
            onClick={() =>
              window.open(
                "https://play.google.com/store/apps/details?id=com.nsr.networksignalguru",
                "_blank",
              )
            }
            data-ocid="band_locking.app.button"
          >
            📥 Get Network Signal Guru App
          </Button>
        </div>
      )}
    </div>
  );
}
