import { Badge } from "@/components/ui/badge";
import { Thermometer } from "lucide-react";
import { useEffect, useState } from "react";

const START_KEY = "app_session_start";

export function ThermalWarningIndicator() {
  const [minutesActive, setMinutesActive] = useState(0);

  useEffect(() => {
    if (!sessionStorage.getItem(START_KEY)) {
      sessionStorage.setItem(START_KEY, Date.now().toString());
    }
    const update = () => {
      const start = Number.parseInt(sessionStorage.getItem(START_KEY) ?? "0");
      const mins = (Date.now() - start) / 60000;
      setMinutesActive(Math.round(mins));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const isWarning = minutesActive >= 15;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex items-center gap-4">
      <Thermometer
        className={`w-5 h-5 shrink-0 ${isWarning ? "text-destructive" : "text-muted-foreground"}`}
      />
      <div className="flex-1">
        <p className="text-xs font-bold text-foreground">Thermal Monitor</p>
        <p className="text-[10px] text-muted-foreground">
          {minutesActive} min active this session
        </p>
        {isWarning && (
          <p className="text-[10px] text-destructive mt-0.5">
            Device may overheat. Take a break.
          </p>
        )}
      </div>
      <Badge
        className={`text-[10px] border shrink-0 ${
          isWarning
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-emerald-100 text-emerald-700 border-emerald-200"
        }`}
      >
        {isWarning ? "🔥 Hot" : "✅ Cool"}
      </Badge>
    </div>
  );
}
