import { getSignalQuality, rssiToBars } from "../utils/geo";

interface SignalMeterProps {
  rssi: number;
  compact?: boolean;
}

const BAR_HEIGHTS = ["h-3", "h-5", "h-7", "h-9", "h-11"] as const;
const BAR_KEYS = ["bar-1", "bar-2", "bar-3", "bar-4", "bar-5"] as const;

export function SignalMeter({ rssi, compact = false }: SignalMeterProps) {
  const quality = getSignalQuality(rssi);
  const bars = rssiToBars(rssi);

  const barColors = {
    strong: "bg-signal-green",
    moderate: "bg-signal-yellow",
    weak: "bg-primary",
  };

  const qualityLabels = {
    strong: { label: "STRONG", icon: "✅", text: "text-signal-green" },
    moderate: { label: "MODERATE", icon: "⚠️", text: "text-signal-yellow" },
    weak: { label: "WEAK", icon: "❌", text: "text-primary" },
  };

  const q = qualityLabels[quality];
  const barColor = barColors[quality];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-0.5">
          {BAR_KEYS.map((key, i) => (
            <div
              key={key}
              className={`w-2 rounded-sm transition-all duration-500 ${
                i < bars ? barColor : "bg-border"
              } ${BAR_HEIGHTS[i]}`}
            />
          ))}
        </div>
        <span className={`text-xs font-bold ${q.text}`}>
          {rssi.toFixed(0)} dBm
        </span>
      </div>
    );
  }

  return (
    <div
      data-ocid="signal.meter.card"
      className="bg-card rounded-xl p-4 shadow-card border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">
          Signal Strength
        </h3>
        <span className={`text-xs font-semibold ${q.text}`}>
          {q.icon} {q.label}
        </span>
      </div>

      <div className="flex items-end justify-center gap-2 h-14 mb-3">
        {BAR_KEYS.map((key, i) => (
          <div
            key={key}
            className={`w-7 rounded-t-sm transition-all duration-700 ${
              i < bars ? barColor : "bg-border"
            } ${BAR_HEIGHTS[i]}`}
          />
        ))}
      </div>

      <div className="text-center">
        <span className={`text-2xl font-bold font-display ${q.text}`}>
          {rssi.toFixed(0)} dBm
        </span>
        <p className="text-xs text-muted-foreground mt-0.5">
          {quality === "strong"
            ? "Highly Stable"
            : quality === "moderate"
              ? "Moderate Stability"
              : "Unstable \u2014 move higher"}
        </p>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-2 italic">
        Estimated based on tower distance
      </p>
    </div>
  );
}
