import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WifiOff, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const BLACKOUT_KEY = "blackout_log";

interface BlackoutEvent {
  id: string;
  startMs: number;
  endMs: number | null;
}

function loadLog(): BlackoutEvent[] {
  try {
    const s = localStorage.getItem(BLACKOUT_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveLog(log: BlackoutEvent[]) {
  localStorage.setItem(BLACKOUT_KEY, JSON.stringify(log));
}

function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  if (totalSecs < 60) return `${totalSecs}s`;
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
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

interface Props {
  isOnline: boolean;
}

export function NetworkBlackoutReporter({ isOnline }: Props) {
  const [log, setLog] = useState<BlackoutEvent[]>(loadLog);
  const [outageSeconds, setOutageSeconds] = useState(0);
  const prevOnlineRef = useRef<boolean>(isOnline);
  const outageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isOnlineRef = useRef(isOnline);

  // Keep ref in sync
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    const wasOnline = prevOnlineRef.current;
    prevOnlineRef.current = isOnline;

    if (!isOnline && wasOnline) {
      // Outage started
      const newEvent: BlackoutEvent = {
        id: Date.now().toString(),
        startMs: Date.now(),
        endMs: null,
      };
      setLog((prev) => {
        const updated = [newEvent, ...prev].slice(0, 20);
        saveLog(updated);
        return updated;
      });
      setOutageSeconds(0);
      outageTimerRef.current = setInterval(() => {
        setOutageSeconds((s) => s + 1);
      }, 1000);
    } else if (isOnline && !wasOnline) {
      // Outage ended
      if (outageTimerRef.current) clearInterval(outageTimerRef.current);
      setOutageSeconds(0);
      setLog((prev) => {
        const updated = prev.map((ev) =>
          ev.endMs === null ? { ...ev, endMs: Date.now() } : ev,
        );
        saveLog(updated);
        return updated;
      });
    }
  }, [isOnline]);

  // Start outage timer if app loads while offline
  useEffect(() => {
    if (!isOnlineRef.current) {
      outageTimerRef.current = setInterval(() => {
        setOutageSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (outageTimerRef.current) clearInterval(outageTimerRef.current);
    };
  }, []);

  const clearLog = () => {
    setLog([]);
    localStorage.removeItem(BLACKOUT_KEY);
  };

  const recent = log.slice(0, 10);
  const currentOutage = !isOnline ? log.find((e) => e.endMs === null) : null;

  return (
    <div className="bg-card rounded-xl border border-border shadow p-4 space-y-3">
      <div className="flex items-center gap-2">
        <WifiOff className="w-5 h-5 text-destructive" />
        <h3 className="font-bold text-foreground text-sm">
          Network Blackout Reporter
        </h3>
        <Badge variant="secondary" className="ml-auto text-[10px]">
          {log.length} logged
        </Badge>
      </div>

      {/* Live outage counter */}
      {!isOnline && (
        <div
          className="animate-pulse bg-destructive/10 border border-destructive/40 rounded-lg p-3"
          data-ocid="safety.blackout.error_state"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-destructive" />
            <span className="text-destructive font-bold text-sm">
              Outage in progress
            </span>
          </div>
          <p className="text-destructive/80 text-xs mt-1">
            Duration: {formatDuration(outageSeconds * 1000)}
            {currentOutage && (
              <span className="text-muted-foreground">
                {" "}
                · Started: {formatDate(currentOutage.startMs)}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Log list */}
      {recent.length === 0 ? (
        <div
          className="text-center py-4"
          data-ocid="safety.blackout.empty_state"
        >
          <WifiOff className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            No blackout events recorded
          </p>
          <p className="text-[10px] text-muted-foreground/70">
            Events log automatically when offline
          </p>
        </div>
      ) : (
        <div className="space-y-1.5" data-ocid="safety.blackout.list">
          {recent.map((ev, i) => (
            <div
              key={ev.id}
              className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2"
              data-ocid={`safety.blackout.item.${i + 1}`}
            >
              <div>
                <p className="text-xs font-medium">{formatDate(ev.startMs)}</p>
                {ev.endMs ? (
                  <p className="text-[10px] text-muted-foreground">
                    Duration: {formatDuration(ev.endMs - ev.startMs)}
                  </p>
                ) : (
                  <p className="text-[10px] text-destructive font-medium animate-pulse">
                    Ongoing…
                  </p>
                )}
              </div>
              <Badge
                variant={ev.endMs ? "secondary" : "destructive"}
                className="text-[9px]"
              >
                {ev.endMs ? "Resolved" : "Active"}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full h-8 text-xs text-muted-foreground"
        onClick={clearLog}
        data-ocid="safety.blackout.delete_button"
      >
        Clear Log
      </Button>
    </div>
  );
}
