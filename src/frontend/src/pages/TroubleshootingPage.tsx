import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { NetworkRecoveryChecklist } from "../components/NetworkRecoveryChecklist";

interface Step {
  text: string;
  code?: string;
}

interface Issue {
  title: string;
  emoji: string;
  steps: Step[];
}

const ISSUES: Issue[] = [
  {
    title: "No internet at all?",
    emoji: "❌",
    steps: [
      { text: "Make sure your SIM card is inserted properly" },
      { text: "Check your data balance", code: "*131#" },
      { text: "Restart your phone and try again" },
      { text: "Check APN settings — see the APN Reset Guide in the Guide tab" },
      { text: "Call Airtel support (free)", code: "0800 100 100" },
    ],
  },
  {
    title: "Slow internet speed?",
    emoji: "🐌",
    steps: [
      { text: "Check your signal strength on the Home tab" },
      { text: "Move to higher ground or closer to a window" },
      { text: "Run a speed test on the Home tab to confirm the actual speed" },
      { text: "Try connecting between 10 PM and 6 AM (lowest congestion)" },
      { text: "Check your data bundle type — some are speed-capped" },
    ],
  },
  {
    title: "No signal at all?",
    emoji: "📵",
    steps: [
      { text: "Go outside or to an open area away from buildings" },
      {
        text: "Check if you are in an Airtel coverage area — see Map tab for nearby towers",
      },
      { text: "Restart your phone to re-register on the network" },
      {
        text: "If consistently no signal, report the dead zone on the Map tab",
      },
    ],
  },
  {
    title: "Router not connecting?",
    emoji: "📡",
    steps: [
      { text: "Double-check the Wi-Fi password (tap the Wi-Fi tab to scan)" },
      { text: "Restart your router: unplug for 10 seconds, plug back in" },
      { text: "Open router admin panel", code: "192.168.1.1" },
      {
        text: "Try resetting the router to factory defaults (hold reset button 10s)",
      },
      {
        text: "Call Airtel support if router is Airtel-supplied",
        code: "0800 100 100",
      },
    ],
  },
  {
    title: "GPS not working?",
    emoji: "📍",
    steps: [
      { text: "Allow location permission when the browser asks" },
      {
        text: "Tap the lock icon in your browser address bar → Location → Allow",
      },
      {
        text: "Go to phone Settings → Apps → Your Browser → Permissions → Location → Allow",
      },
      { text: "Go outdoors for better GPS satellite signal" },
    ],
  },
];

function IssueCard({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <button
        type="button"
        data-ocid="help.issue.toggle"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{issue.emoji}</span>
          <span className="font-semibold text-sm text-foreground">
            {issue.title}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <ol className="space-y-3">
            {issue.steps.map((step, idx) => (
              <li key={step.text} className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{step.text}</p>
                  {step.code && (
                    <code className="inline-block mt-1 px-2 py-0.5 bg-secondary rounded text-xs font-mono font-bold text-primary">
                      {step.code}
                    </code>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export function TroubleshootingPage() {
  return (
    <div data-ocid="help.page" className="space-y-4 pb-4">
      <div className="mx-2 pt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🆘</span>
          <h1 className="text-xl font-bold text-foreground">
            Troubleshooting Guide
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Step-by-step fixes for common Airtel network issues. Works offline.
        </p>
      </div>

      {/* V11-29: Network Recovery Checklist */}
      <div className="mx-2">
        <NetworkRecoveryChecklist />
      </div>

      <div className="mx-2 space-y-2">
        {ISSUES.map((issue) => (
          <IssueCard key={issue.title} issue={issue} />
        ))}
      </div>

      <div className="mx-2 bg-primary/5 rounded-xl border border-primary/20 p-4">
        <p className="text-sm font-semibold text-foreground mb-1">
          📞 Still stuck?
        </p>
        <p className="text-xs text-muted-foreground mb-2">
          Contact Airtel Uganda support directly:
        </p>
        <div className="space-y-1">
          <p className="text-sm font-mono font-bold text-primary">
            0800 100 100
          </p>
          <p className="text-xs text-muted-foreground">
            Free call from any Airtel number
          </p>
        </div>
      </div>
    </div>
  );
}
