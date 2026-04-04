// Signal prediction card: 24-hour bar chart with congestion forecast

const HOURS = Array.from({ length: 24 }, (_, h) => h);

/** Returns congestion level for a given hour */
function getCongestion(hour: number): "high" | "medium" | "low" {
  if ((hour >= 6 && hour < 9) || (hour >= 17 && hour < 21)) return "high";
  if (hour >= 9 && hour < 17) return "medium";
  return "low";
}

const CONGESTION_BAR: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-yellow-400",
  low: "bg-signal-green",
};

const CONGESTION_HEIGHT: Record<string, string> = {
  high: "h-10",
  medium: "h-6",
  low: "h-3",
};

export function SignalPredictionCard() {
  const currentHour = new Date().getHours();
  const currentCongestion = getCongestion(currentHour);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <h4 className="font-bold text-sm text-foreground mb-1">
        📡 Signal Prediction
      </h4>
      <p className="text-xs text-muted-foreground mb-3">
        24-hour network congestion forecast
      </p>

      {/* Bar chart */}
      <div className="flex items-end gap-px h-12 mb-1">
        {HOURS.map((h) => {
          const level = getCongestion(h);
          const isCurrent = h === currentHour;
          return (
            <div
              key={h}
              className="flex-1 flex flex-col items-center justify-end"
              title={`${h}:00 — ${level} congestion`}
            >
              <div
                className={`w-full rounded-t-sm transition-all ${
                  CONGESTION_BAR[level]
                } ${CONGESTION_HEIGHT[level]} ${
                  isCurrent
                    ? "ring-2 ring-white ring-offset-1 relative z-10 opacity-100"
                    : "opacity-80"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Hour axis labels */}
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>12AM</span>
        <span>6AM</span>
        <span>12PM</span>
        <span>6PM</span>
        <span>11PM</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-2">
        {(["low", "medium", "high"] as const).map((level) => (
          <span
            key={level}
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            <span
              className={`w-2.5 h-2.5 rounded-sm inline-block ${
                CONGESTION_BAR[level]
              }`}
            />
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
        ))}
        <span className="text-xs text-primary font-semibold ml-auto">
          {currentHour}:00 now
        </span>
      </div>

      {/* Status + best window */}
      <div
        className={`rounded-lg px-3 py-2 text-xs font-medium border ${
          currentCongestion === "low"
            ? "bg-signal-green/10 text-signal-green border-signal-green/20"
            : currentCongestion === "medium"
              ? "bg-yellow-50 text-yellow-600 border-yellow-200"
              : "bg-destructive/10 text-destructive border-destructive/20"
        }`}
      >
        Now:{" "}
        <strong>
          {currentCongestion === "low"
            ? "Low congestion — great time to connect!"
            : currentCongestion === "medium"
              ? "Medium congestion — decent speeds"
              : "High congestion — try after 9 PM"}
        </strong>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Best signal window:{" "}
        <span className="font-semibold text-signal-green">10 PM – 6 AM</span>{" "}
        (low network congestion)
      </p>
    </div>
  );
}
