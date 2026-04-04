import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, ZapOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const POWER_KEY = "power_outage_log";
const BLACKOUT_KEY = "blackout_log";
const CORRELATION_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

interface PowerOutageEvent {
  id: string;
  timestamp: number;
}

interface BlackoutEvent {
  id: string;
  startMs: number;
  endMs: number | null;
}

function loadPowerLog(): PowerOutageEvent[] {
  try {
    const s = localStorage.getItem(POWER_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function loadBlackoutLog(): BlackoutEvent[] {
  try {
    const s = localStorage.getItem(BLACKOUT_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PowerOutageTracker() {
  const [powerLog, setPowerLog] = useState<PowerOutageEvent[]>(loadPowerLog);
  const blackoutLog = loadBlackoutLog();

  const logPowerOutage = () => {
    const newEvent: PowerOutageEvent = {
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    const updated = [newEvent, ...powerLog];
    setPowerLog(updated);
    localStorage.setItem(POWER_KEY, JSON.stringify(updated));
    toast.success("Power outage logged");
  };

  const clearPowerLog = () => {
    setPowerLog([]);
    localStorage.removeItem(POWER_KEY);
    toast.info("Power log cleared");
  };

  // Correlate power outages with signal blackouts (±30 min window)
  const correlated = powerLog.filter((pev) =>
    blackoutLog.some(
      (bev) => Math.abs(bev.startMs - pev.timestamp) <= CORRELATION_WINDOW_MS,
    ),
  );

  const correlationCount = correlated.length;
  const totalPower = powerLog.length;
  const totalBlackout = blackoutLog.length;

  return (
    <div className="bg-card rounded-xl border border-border shadow p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h3 className="font-bold text-foreground text-sm">
          Power Outage Signal Tracker
        </h3>
      </div>

      {/* Correlation summary */}
      {totalPower > 0 && totalBlackout > 0 ? (
        <div
          className={`rounded-lg p-3 border ${
            correlationCount > 0
              ? "bg-yellow-50 border-yellow-200"
              : "bg-muted/40 border-border"
          }`}
          data-ocid="safety.power.card"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap
              className={`w-4 h-4 ${correlationCount > 0 ? "text-yellow-600" : "text-muted-foreground"}`}
            />
            <p
              className={`text-sm font-bold ${correlationCount > 0 ? "text-yellow-700" : "text-foreground"}`}
            >
              {correlationCount} of {totalBlackout} signal blackout
              {totalBlackout !== 1 ? "s" : ""} coincided with a power outage
            </p>
          </div>
          {correlationCount > 0 ? (
            <p className="text-xs text-yellow-600">
              Power cuts likely affect the local tower or your router. Consider
              a UPS/battery backup.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              No correlation found — signal blackouts appear unrelated to power
              outages.
            </p>
          )}
        </div>
      ) : (
        <div
          className="bg-muted/30 rounded-lg p-3 text-center"
          data-ocid="safety.power.empty_state"
        >
          <ZapOff className="w-7 h-7 text-muted-foreground/30 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">
            {totalPower === 0
              ? "Log power outages to track correlations with signal loss"
              : "No signal blackouts logged yet — correlation will appear here"}
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-muted/40 rounded-lg py-2">
          <p className="text-base font-bold text-foreground">{totalPower}</p>
          <p className="text-[9px] text-muted-foreground">Power logs</p>
        </div>
        <div className="bg-muted/40 rounded-lg py-2">
          <p className="text-base font-bold text-foreground">{totalBlackout}</p>
          <p className="text-[9px] text-muted-foreground">Blackouts</p>
        </div>
        <div className="bg-muted/40 rounded-lg py-2">
          <p
            className={`text-base font-bold ${correlationCount > 0 ? "text-yellow-600" : "text-foreground"}`}
          >
            {correlationCount}
          </p>
          <p className="text-[9px] text-muted-foreground">Correlated</p>
        </div>
      </div>

      {/* Recent power outage log */}
      {powerLog.length > 0 && (
        <div className="space-y-1" data-ocid="safety.power.list">
          <p className="text-[11px] font-semibold text-muted-foreground">
            Recent Power Outages
          </p>
          {powerLog.slice(0, 5).map((ev, i) => {
            const hasCorrelation = blackoutLog.some(
              (bev) =>
                Math.abs(bev.startMs - ev.timestamp) <= CORRELATION_WINDOW_MS,
            );
            return (
              <div
                key={ev.id}
                className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-1.5"
                data-ocid={`safety.power.item.${i + 1}`}
              >
                <div className="flex items-center gap-2">
                  <Zap
                    className={`w-3.5 h-3.5 ${hasCorrelation ? "text-yellow-500" : "text-muted-foreground"}`}
                  />
                  <p className="text-xs">{formatDate(ev.timestamp)}</p>
                </div>
                {hasCorrelation && (
                  <Badge className="text-[9px] bg-yellow-100 text-yellow-700 border-yellow-200">
                    Signal dropped too
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          className="flex-1 h-9 text-xs btn-airtel"
          onClick={logPowerOutage}
          data-ocid="safety.power.primary_button"
        >
          <Zap className="w-3.5 h-3.5 mr-1" />
          Log Power Outage
        </Button>
        {powerLog.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 text-xs text-muted-foreground"
            onClick={clearPowerLog}
            data-ocid="safety.power.delete_button"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
