import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { DataSaverCalculator } from "../components/DataSaverCalculator";

interface UssdCode {
  code: string;
  label: string;
}

interface UssdCategory {
  category: string;
  emoji: string;
  codes: UssdCode[];
}

const USSD_DATA: UssdCategory[] = [
  {
    category: "Account",
    emoji: "💳",
    codes: [
      { code: "*131#", label: "Check airtime balance" },
      { code: "*131*1#", label: "Check data balance" },
      { code: "*100#", label: "Main menu" },
      { code: "*121*1#", label: "Set caller tune" },
    ],
  },
  {
    category: "Data Bundles",
    emoji: "📦",
    codes: [
      { code: "*175#", label: "Browse data bundles" },
      { code: "*131*4#", label: "Buy data bundle" },
      { code: "*131*2#", label: "Share data with another Airtel user" },
    ],
  },
  {
    category: "Balance Check",
    emoji: "📊",
    codes: [
      { code: "*100#", label: "Check airtime balance (quick)" },
      { code: "*131*1#", label: "Check data bundle remaining" },
      { code: "*185#", label: "Check bundle expiry date" },
    ],
  },
  {
    category: "Support",
    emoji: "🆘",
    codes: [
      { code: "0800 100 100", label: "Airtel customer care (FREE call)" },
      { code: "*131*3#", label: "File a complaint" },
    ],
  },
  {
    category: "Money & Sharing",
    emoji: "💰",
    codes: [
      { code: "*141#", label: "Airtel Money menu" },
      { code: "*131*2#", label: "Share data bundle" },
    ],
  },
  {
    category: "Settings",
    emoji: "⚙️",
    codes: [
      { code: "*121*1#", label: "Set / change caller tune" },
      { code: "*100#", label: "Open main Airtel menu" },
    ],
  },
];

interface SmsTemplate {
  title: string;
  body: string;
  recipient: string;
}

const SMS_TEMPLATES: SmsTemplate[] = [
  {
    title: "Outage Report to Airtel",
    body: "Airtel outage at [location]. No signal since [time]. Please investigate. Thank you.",
    recipient: "+256800100100",
  },
  {
    title: "SIM Swap Request",
    body: "Please assist with SIM swap for number [number]. ID: [ID]. Location: Moroto.",
    recipient: "+256800100100",
  },
  {
    title: "Bundle Activation",
    body: "Please activate daily data bundle on my line. Thank you.",
    recipient: "+256800100100",
  },
  {
    title: "Technical Support",
    body: "I have no internet access. Device: Android. APN: internet. Please help.",
    recipient: "+256800100100",
  },
];

export function UssdPage() {
  const handleCopy = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => toast.success(`Copied: ${code}`))
      .catch(() => toast.error("Could not copy"));
  };

  const handleCopyTemplate = (body: string) => {
    navigator.clipboard
      .writeText(body)
      .then(() => toast.success("Message copied!"))
      .catch(() => toast.error("Could not copy"));
  };

  const handleOpenSms = (template: SmsTemplate) => {
    const encoded = encodeURIComponent(template.body);
    window.location.href = `sms:${template.recipient}?body=${encoded}`;
  };

  return (
    <div data-ocid="ussd.page" className="space-y-4 pb-4">
      <div className="mx-2 pt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📣</span>
          <h1 className="text-xl font-bold text-foreground">
            USSD Quick Codes
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Tap a code to copy it, then dial from your phone. Works offline.
        </p>
        <Badge className="mt-2 bg-signal-green/10 text-signal-green border border-signal-green/20 text-xs">
          ✈️ Fully Offline
        </Badge>
      </div>

      {USSD_DATA.map((group) => (
        <div key={group.category} className="mx-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{group.emoji}</span>
            <h2 className="font-bold text-sm text-foreground">
              {group.category}
            </h2>
          </div>
          <div className="space-y-2">
            {group.codes.map((item, idx) => (
              <div
                key={item.code}
                data-ocid={`ussd.${group.category.toLowerCase().replace(/\s/g, "_")}.item.${idx + 1}`}
                className="bg-card rounded-xl border border-border shadow-xs p-3 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold text-primary tracking-wide">
                    {item.code}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.label}
                  </p>
                </div>
                <Button
                  data-ocid={`ussd.${group.category.toLowerCase().replace(/\s/g, "_")}.copy.button.${idx + 1}`}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-semibold shrink-0"
                  onClick={() => handleCopy(item.code)}
                >
                  📋 Copy
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* V11-26: SMS Bundle Checker */}
      <div className="mx-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">📱</span>
          <h2 className="font-bold text-sm text-foreground">Bundle Checker</h2>
          <Badge className="text-xs bg-secondary text-muted-foreground">
            Quick Access
          </Badge>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
            Tap to copy USSD code, then dial:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { code: "*100#", label: "Balance" },
              { code: "*131*1#", label: "Data" },
              { code: "*185#", label: "Expiry" },
            ].map((item) => (
              <Button
                key={item.code}
                size="sm"
                variant="outline"
                className="h-10 text-xs flex-col gap-0 border-blue-300 text-blue-700"
                onClick={() => handleCopy(item.code)}
                data-ocid={`ussd.bundle_checker.${item.label.toLowerCase()}.button`}
              >
                <span className="font-mono font-bold">{item.code}</span>
                <span className="text-[9px]">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* V11-28: Data Saver Calculator */}
      <div className="mx-2">
        <DataSaverCalculator />
      </div>

      {/* SMS First-Aid Kit */}
      <div className="mx-2">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm text-foreground">
            SMS First-Aid Kit
          </h2>
          <Badge className="text-xs bg-blue-50 text-blue-600 border-blue-200">
            Works Offline
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Pre-composed messages for common Airtel issues. Tap Copy or Open SMS
          to send.
        </p>
        <div className="space-y-3">
          {SMS_TEMPLATES.map((template, idx) => (
            <div
              key={template.title}
              data-ocid={`ussd.sms_kit.item.${idx + 1}`}
              className="bg-card rounded-xl border border-border shadow-xs p-4"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-base shrink-0">📩</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {template.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    &ldquo;{template.body}&rdquo;
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  data-ocid={`ussd.sms_kit.copy.button.${idx + 1}`}
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs"
                  onClick={() => handleCopyTemplate(template.body)}
                >
                  📋 Copy
                </Button>
                <Button
                  data-ocid={`ussd.sms_kit.open_sms.button.${idx + 1}`}
                  size="sm"
                  className="flex-1 h-8 text-xs btn-airtel"
                  onClick={() => handleOpenSms(template)}
                >
                  💬 Open SMS App
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-2 bg-secondary/50 rounded-xl p-3 border border-border/50">
        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> These codes work on Airtel Uganda. Dial them
          like a regular phone call. *0800 100 100* is free from any Airtel
          number.
        </p>
      </div>
    </div>
  );
}
