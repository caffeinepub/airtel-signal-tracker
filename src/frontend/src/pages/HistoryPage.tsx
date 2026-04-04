import { Badge } from "@/components/ui/badge";
import { BarChart2, Clock, MapPin, Signal, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { SignalPosition, Tower } from "../backend.d";
import { BackupAPNProfiles } from "../components/BackupAPNProfiles";
import { EmergencyContactBroadcaster } from "../components/EmergencyContactBroadcaster";
import { OfflineAntennaManual } from "../components/OfflineAntennaManual";
import { OfflineMapDownloadBanner } from "../components/OfflineMapDownloadBanner";
import { OfflineSignalDiary } from "../components/OfflineSignalDiary";
import { OfflineSpeedBenchmark } from "../components/OfflineSpeedBenchmark";
import { TowerOutageHistoryLog } from "../components/TowerOutageHistoryLog";
import { TowerStatusLog } from "../components/TowerStatusLog";
import type { GPSPosition } from "../hooks/useGPS";
import { getSignalQuality } from "../utils/geo";

const LATENCY_KEY = "latency_log";
const PING_INTERVAL = 60000;

interface LatencyEntry {
  timestamp: number;
  latencyMs: number | null;
}

function loadLatencyLog(): LatencyEntry[] {
  try {
    const s = localStorage.getItem(LATENCY_KEY);
    return s ? (JSON.parse(s) as LatencyEntry[]) : [];
  } catch {
    return [];
  }
}

function saveLatencyLog(entries: LatencyEntry[]) {
  const trimmed = entries.slice(-20);
  localStorage.setItem(LATENCY_KEY, JSON.stringify(trimmed));
}

function LatencyLogger() {
  const [log, setLog] = useState<LatencyEntry[]>(loadLatencyLog);
  const pingInProgress = useRef(false);

  useEffect(() => {
    const doPing = async () => {
      if (pingInProgress.current) return;
      pingInProgress.current = true;
      const start = Date.now();
      let latencyMs: number | null = null;
      try {
        await fetch("https://www.google.com/generate_204", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        });
        latencyMs = Date.now() - start;
      } catch {
        latencyMs = null;
      }
      pingInProgress.current = false;
      const entry: LatencyEntry = { timestamp: Date.now(), latencyMs };
      const updated = [...loadLatencyLog(), entry].slice(-20);
      saveLatencyLog(updated);
      setLog(updated);
    };

    doPing();
    const interval = setInterval(doPing, PING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const validEntries = log.filter(
    (e) => e.latencyMs !== null,
  ) as (LatencyEntry & { latencyMs: number })[];
  const min =
    validEntries.length > 0
      ? Math.min(...validEntries.map((e) => e.latencyMs))
      : null;
  const max =
    validEntries.length > 0
      ? Math.max(...validEntries.map((e) => e.latencyMs))
      : null;
  const avg =
    validEntries.length > 0
      ? Math.round(
          validEntries.reduce((a, e) => a + e.latencyMs, 0) /
            validEntries.length,
        )
      : null;
  const latest = log.length > 0 ? log[log.length - 1] : null;
  const isOnline = latest?.latencyMs !== null;

  const chartW = 280;
  const chartH = 60;
  const pad = { top: 8, right: 8, bottom: 8, left: 8 };
  const plotW = chartW - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;
  const maxVal = max ?? 1000;

  const points =
    validEntries.length >= 2
      ? validEntries
          .map((e, i) => {
            const x = pad.left + (i / (validEntries.length - 1)) * plotW;
            const y = pad.top + plotH - (e.latencyMs / maxVal) * plotH;
            return `${x},${y}`;
          })
          .join(" ")
      : null;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📡</span>
        <h4 className="font-bold text-sm text-foreground">Latency Logger</h4>
        <span
          className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${isOnline ? "bg-signal-green/10 text-signal-green" : "bg-destructive/10 text-destructive"}`}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
      {points ? (
        <svg
          role="img"
          aria-label="Latency over time"
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full mb-3"
          style={{ height: chartH }}
        >
          <title>Latency over time</title>
          <polyline
            points={points}
            fill="none"
            stroke="oklch(0.46 0.22 24.5)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {validEntries.map((e, i) => (
            <circle
              key={e.timestamp}
              cx={pad.left + (i / (validEntries.length - 1)) * plotW}
              cy={pad.top + plotH - (e.latencyMs / maxVal) * plotH}
              r="2.5"
              fill="oklch(0.46 0.22 24.5)"
            />
          ))}
        </svg>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-3">
          {log.length === 0
            ? "Starting ping tests..."
            : "Waiting for more data..."}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Min", value: min !== null ? `${min}ms` : "—" },
          { label: "Avg", value: avg !== null ? `${avg}ms` : "—" },
          { label: "Max", value: max !== null ? `${max}ms` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-secondary/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <p className="text-sm font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>
      {log.length > 0 && latest?.latencyMs === null && (
        <p className="text-xs text-destructive mt-2">
          Last ping failed — you may be offline
        </p>
      )}
    </div>
  );
}

interface HistoryPageProps {
  positions: SignalPosition[];
  towers: Tower[];
  userPosition: GPSPosition;
  rssi?: number;
  distanceKm?: number;
  nearestTowerName?: string;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts);
  if (ms === 0) return "Unknown time";
  const d = new Date(ms);
  return d.toLocaleString("en-UG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SignalChart({ positions }: { positions: SignalPosition[] }) {
  if (positions.length < 2) return null;
  const width = 300;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 20, left: 36 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const rssiValues = positions.map((p) => Number(p.rssiDbm));
  const minRssi = -110;
  const maxRssi = -60;
  const toX = (i: number) =>
    padding.left + (i / (positions.length - 1)) * chartW;
  const toY = (rssi: number) =>
    padding.top + chartH - ((rssi - minRssi) / (maxRssi - minRssi)) * chartH;
  const points = rssiValues.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const gridLines = [-70, -85, -100];
  return (
    <svg
      role="img"
      aria-label="RSSI signal chart over time"
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height: "100px" }}
    >
      {gridLines.map((dbm) => {
        const y = toY(dbm);
        return (
          <g key={dbm}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="oklch(0.88 0.015 240)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text
              x={padding.left - 4}
              y={y + 3}
              textAnchor="end"
              fontSize="8"
              fill="oklch(0.48 0.025 240)"
            >
              {dbm}
            </text>
          </g>
        );
      })}
      <polyline
        points={points}
        fill="none"
        stroke="oklch(0.46 0.22 24.5)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {positions.map((pos, i) => (
        <circle
          key={String(pos.timestamp)}
          cx={toX(i)}
          cy={toY(Number(pos.rssiDbm))}
          r="3"
          fill="oklch(0.46 0.22 24.5)"
        />
      ))}
    </svg>
  );
}

export function HistoryPage({
  positions,
  towers,
  userPosition,
  rssi = -85,
  distanceKm = 3,
  nearestTowerName = "Unknown",
}: HistoryPageProps) {
  const sorted = positions
    .slice()
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  const best = sorted.reduce<SignalPosition | null>((acc, p) => {
    if (!acc) return p;
    return Number(p.rssiDbm) > Number(acc.rssiDbm) ? p : acc;
  }, null);

  return (
    <div data-ocid="history.page" className="space-y-4 pb-4">
      {/* V10-17: Latency Logger */}
      <div className="mx-2">
        <LatencyLogger />
      </div>

      {/* V11-21: Offline Signal Diary */}
      <div className="mx-2">
        <OfflineSignalDiary
          userPosition={userPosition}
          nearestTowerName={nearestTowerName}
          distanceKm={distanceKm}
        />
      </div>

      {/* V11-22: Emergency Contact Broadcaster */}
      <div className="mx-2">
        <EmergencyContactBroadcaster userPosition={userPosition} />
      </div>

      {/* V11-23: Offline Map Download Banner */}
      <div className="mx-2">
        <OfflineMapDownloadBanner />
      </div>

      {/* V11-24: Tower Outage History Log */}
      <div className="mx-2">
        <TowerOutageHistoryLog />
      </div>

      {/* V11-25: Backup APN Profiles */}
      <div className="mx-2">
        <BackupAPNProfiles />
      </div>

      {/* V11-27: Offline Antenna Manual */}
      <div className="mx-2">
        <OfflineAntennaManual />
      </div>

      {/* V11-30: Offline Speed Benchmark */}
      <div className="mx-2">
        <OfflineSpeedBenchmark rssi={rssi} />
      </div>

      {sorted.length === 0 ? (
        <div
          data-ocid="history.empty_state"
          className="flex flex-col items-center justify-center py-10 px-6 text-center"
        >
          <BarChart2 className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-base font-semibold text-foreground mb-1">
            No history yet
          </p>
          <p className="text-sm text-muted-foreground">
            Save a signal position from the Guide tab to start tracking
          </p>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-2"
          >
            <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  RSSI Over Time
                </h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  {sorted.length} readings
                </span>
              </div>
              <SignalChart positions={[...sorted].reverse()} />
            </div>
          </motion.div>
          <div className="mx-2 space-y-2">
            {sorted.map((pos, i) => {
              const rssiVal = Number(pos.rssiDbm);
              const quality = getSignalQuality(rssiVal);
              const isBest = best && pos.timestamp === best.timestamp;
              const qColors = {
                strong:
                  "text-signal-green bg-signal-green/10 border-signal-green/20",
                moderate: "text-yellow-600 bg-yellow-50 border-yellow-200",
                weak: "text-destructive bg-destructive/10 border-destructive/20",
              };
              return (
                <motion.div
                  key={String(pos.timestamp)}
                  data-ocid={`history.item.${i + 1}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-card rounded-xl p-3 border shadow-xs ${isBest ? "border-signal-green/40 bg-signal-green/5" : "border-border"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <MapPin
                        className={`w-4 h-4 mt-0.5 shrink-0 ${isBest ? "text-signal-green" : "text-primary"}`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-medium text-foreground">
                            {pos.latitude.toFixed(4)},{" "}
                            {pos.longitude.toFixed(4)}
                          </p>
                          {isBest && (
                            <Badge className="bg-signal-green text-white text-xs px-1.5 py-0">
                              ⭐ Best
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Signal className="w-3 h-3" />
                            {rssiVal.toFixed(0)} dBm
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {pos.compassHeading.toFixed(0)}°
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Number(pos.heightRecommendation)}m
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${qColors[quality]}`}
                      >
                        {quality === "strong"
                          ? "Strong"
                          : quality === "moderate"
                            ? "Moderate"
                            : "Weak"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(pos.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Tower Status Log */}
      <div className="mx-2">
        <TowerStatusLog towers={towers} userPosition={userPosition} />
      </div>
    </div>
  );
}
