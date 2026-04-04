import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Zap } from "lucide-react";

interface UserPosition {
  latitude: number;
  longitude: number;
}

interface LightningRiskZoneMapProps {
  userPosition?: UserPosition;
}

type RiskLevel = "high" | "medium" | "low";

function getRiskLevel(lat: number): RiskLevel {
  if (lat > 2.6) return "high";
  if (lat >= 2.45) return "medium";
  return "low";
}

const RISK_CONFIG = {
  high: {
    label: "HIGH RISK",
    color: "bg-red-500",
    badgeClass: "bg-red-500 text-white",
    description: "Hills & ridges \u2014 elevated lightning exposure",
  },
  medium: {
    label: "MEDIUM RISK",
    color: "bg-yellow-400",
    badgeClass: "bg-yellow-400 text-yellow-900",
    description: "Open fields \u2014 moderate lightning exposure",
  },
  low: {
    label: "LOW RISK",
    color: "bg-green-500",
    badgeClass: "bg-green-500 text-white",
    description: "Valley / Urban area \u2014 lower lightning exposure",
  },
};

const PROTECTION_TIPS = [
  "Install copper ground rod minimum 1.5m deep into moist soil.",
  "Connect mast to ground rod with 6mm\u00b2 copper wire \u2014 ensure solid metal-to-metal contact.",
  "Use a coax surge protector on the cable line entering the building.",
  "Disconnect coax cable from router during heavy lightning storms.",
  "Keep mast and antenna at least 3m away from tall trees.",
];

export function LightningRiskZoneMap({
  userPosition,
}: LightningRiskZoneMapProps) {
  const lat = userPosition?.latitude ?? 2.5341;
  const riskLevel = getRiskLevel(lat);
  const risk = RISK_CONFIG[riskLevel];

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Lightning Risk Zone Map
        </h4>
        <span className="ml-auto text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          OFFLINE
        </span>
      </div>

      {/* SVG Map */}
      <div className="rounded-lg overflow-hidden border border-border">
        <svg
          viewBox="0 0 400 250"
          className="w-full"
          role="img"
          aria-label="Moroto district lightning risk zone map"
        >
          {/* Background */}
          <rect width="400" height="250" fill="#e8f4e8" />

          {/* HIGH RISK zone */}
          <polygon
            points="0,0 400,0 400,80 280,90 200,75 120,85 0,80"
            fill="#ef4444"
            fillOpacity={0.3}
            stroke="#ef4444"
            strokeWidth={1}
          />
          <text
            x="200"
            y="45"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#991b1b"
          >
            &#9889; HIGH RISK &#8212; Hills &amp; Ridges
          </text>

          {/* MEDIUM RISK zone */}
          <polygon
            points="0,80 120,85 200,75 280,90 400,80 400,165 300,175 200,165 100,170 0,165"
            fill="#facc15"
            fillOpacity={0.3}
            stroke="#facc15"
            strokeWidth={1}
          />
          <text
            x="200"
            y="130"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#854d0e"
          >
            &#9889; MEDIUM RISK &#8212; Open Fields
          </text>

          {/* LOW RISK zone */}
          <polygon
            points="0,165 100,170 200,165 300,175 400,165 400,250 0,250"
            fill="#22c55e"
            fillOpacity={0.3}
            stroke="#22c55e"
            strokeWidth={1}
          />
          <text
            x="200"
            y="215"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#14532d"
          >
            LOW RISK &#8212; Moroto Town
          </text>

          {/* Moroto Town marker */}
          <circle
            cx="200"
            cy="225"
            r="6"
            fill="#1d4ed8"
            stroke="white"
            strokeWidth="2"
          />
          <text x="210" y="229" fontSize="9" fill="#1d4ed8" fontWeight="bold">
            Moroto Town
          </text>

          {/* User position indicator */}
          {userPosition && (
            <>
              <circle
                cx={200}
                cy={
                  riskLevel === "high" ? 45 : riskLevel === "medium" ? 125 : 215
                }
                r={8}
                fill="#2563eb"
                fillOpacity={0.8}
                stroke="white"
                strokeWidth={2}
              />
              <circle
                cx={200}
                cy={
                  riskLevel === "high" ? 45 : riskLevel === "medium" ? 125 : 215
                }
                r={14}
                fill="none"
                stroke="#2563eb"
                strokeWidth={1.5}
                strokeOpacity={0.5}
              />
              <text
                x={215}
                y={
                  riskLevel === "high" ? 49 : riskLevel === "medium" ? 129 : 219
                }
                fontSize="9"
                fill="#1d4ed8"
                fontWeight="bold"
              >
                You
              </text>
            </>
          )}

          {/* Compass */}
          <text x="375" y="20" fontSize="11" fill="#374151" fontWeight="bold">
            N
          </text>
          <line
            x1="382"
            y1="22"
            x2="382"
            y2="34"
            stroke="#374151"
            strokeWidth="1.5"
            markerEnd="url(#lightning-arrow)"
          />
          <defs>
            <marker
              id="lightning-arrow"
              markerWidth="6"
              markerHeight="6"
              refX="3"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 z" fill="#374151" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* User zone badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-xs text-muted-foreground">Your zone:</p>
        <Badge
          data-ocid="lightning.risk.zone.badge"
          className={risk.badgeClass}
        >
          {risk.label}
        </Badge>
        <p className="text-xs text-muted-foreground">{risk.description}</p>
      </div>

      {/* Zone legend */}
      <div className="flex gap-3">
        {(
          Object.entries(RISK_CONFIG) as [
            RiskLevel,
            (typeof RISK_CONFIG)[RiskLevel],
          ][]
        ).map(([level, cfg]) => (
          <div key={level} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${cfg.color} opacity-70`} />
            <span className="text-[10px] text-muted-foreground capitalize">
              {level}
            </span>
          </div>
        ))}
      </div>

      {/* Protection tips */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-foreground">
            Lightning Protection Tips
          </p>
        </div>
        <ul className="space-y-2">
          {PROTECTION_TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs text-foreground leading-relaxed">{tip}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
