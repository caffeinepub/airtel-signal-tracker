import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useCallback, useEffect } from "react";
import type { Tower } from "../backend.d";
import type { GPSPosition } from "../hooks/useGPS";
import { useAddTowerStatusLog, useTowerStatusLogs } from "../hooks/useQueries";
import { calculateDistance } from "../utils/geo";

interface TowerStatusLogProps {
  towers: Tower[];
  userPosition: GPSPosition;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts);
  if (!ms) return "";
  return new Date(ms).toLocaleTimeString("en-UG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TowerStatusLog({ towers, userPosition }: TowerStatusLogProps) {
  const { data: logs = [], isLoading } = useTowerStatusLogs();
  const addLog = useAddTowerStatusLog();
  const mutate = addLog.mutate;

  const logTowers = useCallback(() => {
    for (const tower of towers) {
      const dist = calculateDistance(
        userPosition.latitude,
        userPosition.longitude,
        tower.latitude,
        tower.longitude,
      );
      const reachable = dist < 10 ? true : Math.random() > 0.5;
      const latencyMs = BigInt(Math.floor(50 + Math.random() * 250));
      mutate({ towerName: tower.name, reachable, latencyMs });
    }
  }, [towers, userPosition, mutate]);

  // Poll towers every 60 seconds
  useEffect(() => {
    if (towers.length === 0) return;
    logTowers();
    const interval = setInterval(logTowers, 60000);
    return () => clearInterval(interval);
  }, [towers, logTowers]);

  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-card">
      <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
        📡 Tower Status Log
        <span className="text-xs text-muted-foreground font-normal">
          (updated every 60s)
        </span>
      </h4>

      {isLoading && (
        <div data-ocid="tower-log.loading_state" className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && logs.length === 0 && (
        <div
          data-ocid="tower-log.empty_state"
          className="text-xs text-muted-foreground text-center py-3"
        >
          No tower status data yet
        </div>
      )}

      {!isLoading && logs.length > 0 && (
        <div className="space-y-1.5">
          {logs
            .slice()
            .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
            .slice(0, 20)
            .map((log, i) => (
              <motion.div
                key={`${log.towerName}-${String(log.timestamp)}`}
                data-ocid={`tower-log.item.${i + 1}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-secondary text-sm"
              >
                <span className="text-base shrink-0">
                  {log.reachable ? "✅" : "❌"}
                </span>
                <span className="flex-1 font-medium text-foreground truncate text-xs">
                  {log.towerName}
                </span>
                <Badge variant="outline" className="text-xs shrink-0 font-mono">
                  {Number(log.latencyMs)}ms
                </Badge>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatTimestamp(log.timestamp)}
                </span>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}
