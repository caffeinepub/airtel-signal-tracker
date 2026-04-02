import { Badge } from "@/components/ui/badge";
import { BarChart2, Clock, MapPin, Signal, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { SignalPosition } from "../backend.d";
import { getSignalQuality } from "../utils/geo";

interface HistoryPageProps {
  positions: SignalPosition[];
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
      {/* Grid lines */}
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
      {/* Polyline */}
      <polyline
        points={points}
        fill="none"
        stroke="oklch(0.46 0.22 24.5)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots - use timestamp as key since positions are stable */}
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

export function HistoryPage({ positions }: HistoryPageProps) {
  const sorted = positions
    .slice()
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  const best = sorted.reduce<SignalPosition | null>((acc, p) => {
    if (!acc) return p;
    return Number(p.rssiDbm) > Number(acc.rssiDbm) ? p : acc;
  }, null);

  if (sorted.length === 0) {
    return (
      <div
        data-ocid="history.empty_state"
        className="flex flex-col items-center justify-center py-16 px-6 text-center"
      >
        <BarChart2 className="w-12 h-12 text-muted-foreground/40 mb-3" />
        <p className="text-base font-semibold text-foreground mb-1">
          No history yet
        </p>
        <p className="text-sm text-muted-foreground">
          Save a signal position from the Guide tab to start tracking
        </p>
      </div>
    );
  }

  return (
    <div data-ocid="history.page" className="space-y-4 pb-4">
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
          const rssi = Number(pos.rssiDbm);
          const quality = getSignalQuality(rssi);
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
              className={`bg-card rounded-xl p-3 border shadow-xs ${
                isBest
                  ? "border-signal-green/40 bg-signal-green/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <MapPin
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isBest ? "text-signal-green" : "text-primary"
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-medium text-foreground">
                        {pos.latitude.toFixed(4)}, {pos.longitude.toFixed(4)}
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
                        {rssi.toFixed(0)} dBm
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
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      qColors[quality]
                    }`}
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
    </div>
  );
}
