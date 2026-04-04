import { Battery, Moon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SESSION_KEY = "session_start";
const INACTIVITY_THRESHOLD_MS = 30 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;

export function BatteryDrainMonitor() {
  const [sessionMin, setSessionMin] = useState(0);
  const [estimatedPct, setEstimatedPct] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const alertedRef = useRef(false);

  useEffect(() => {
    const startTime = (() => {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) return Number(stored);
      const now = Date.now();
      sessionStorage.setItem(SESSION_KEY, String(now));
      return now;
    })();

    const trackActivity = () => {
      lastActivityRef.current = Date.now();
      alertedRef.current = false;
    };
    window.addEventListener("click", trackActivity);
    window.addEventListener("touchstart", trackActivity);
    window.addEventListener("keydown", trackActivity);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const mins = Math.floor(elapsed / 60000);
      const pct = (mins / 10) * 0.5;
      setSessionMin(mins);
      setEstimatedPct(Math.min(pct, 20));

      const inactiveMs = Date.now() - lastActivityRef.current;
      if (inactiveMs > INACTIVITY_THRESHOLD_MS && !alertedRef.current) {
        alertedRef.current = true;
        toast.info("Auto-sleep tip: Close the app to save battery", {
          duration: 8000,
        });
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", trackActivity);
      window.removeEventListener("touchstart", trackActivity);
      window.removeEventListener("keydown", trackActivity);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 bg-card rounded-xl border border-border p-3 shadow-xs">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Battery className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-foreground">
            Session: {sessionMin} min
          </p>
          <span className="text-xs text-muted-foreground">·</span>
          <p className="text-xs text-muted-foreground">
            Est. battery used: ~{estimatedPct.toFixed(1)}%
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          <Moon className="w-3 h-3 inline mr-0.5" />
          App will suggest sleep after 30 min inactivity
        </p>
      </div>
    </div>
  );
}
