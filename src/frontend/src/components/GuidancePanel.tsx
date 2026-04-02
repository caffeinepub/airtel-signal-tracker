import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Mountain,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Tower } from "../backend.d";
import type { GPSPosition } from "../hooks/useGPS";
import { getMountingHeight, getSignalQuality } from "../utils/geo";
import { getSimulatedWeather } from "../utils/weather";

interface GuidancePanelProps {
  distanceKm: number;
  rssi: number;
  bearing: number;
  userPosition?: GPSPosition;
  nearestTower?: Tower | null;
}

interface ElevationData {
  userElevation: number;
  towerElevation: number;
  terrain: "Flat" | "Hilly" | "Obstructed";
}

function ElevationProfile({ data }: { data: ElevationData }) {
  const width = 280;
  const height = 60;
  const padL = 40;
  const padR = 40;
  const padT = 8;
  const padB = 16;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const minEl = Math.min(data.userElevation, data.towerElevation) - 20;
  const maxEl = Math.max(data.userElevation, data.towerElevation) + 20;
  const toY = (el: number) =>
    padT + chartH - ((el - minEl) / (maxEl - minEl)) * chartH;

  const x1 = padL;
  const x2 = padL + chartW;
  const y1 = toY(data.userElevation);
  const y2 = toY(data.towerElevation);

  const terrainColor =
    data.terrain === "Flat"
      ? "oklch(0.65 0.19 145)"
      : data.terrain === "Hilly"
        ? "oklch(0.78 0.17 85)"
        : "oklch(0.46 0.22 24.5)";

  return (
    <svg
      role="img"
      aria-label="Elevation profile between user and tower"
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height: "60px" }}
    >
      {/* Fill under line */}
      <polygon
        points={`${x1},${height - padB} ${x1},${y1} ${x2},${y2} ${x2},${height - padB}`}
        fill={terrainColor}
        opacity="0.15"
      />
      {/* Line */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={terrainColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* User dot */}
      <circle cx={x1} cy={y1} r="4" fill="oklch(0.55 0.15 250)" />
      <text
        x={x1}
        y={height - 2}
        textAnchor="middle"
        fontSize="8"
        fill="oklch(0.48 0.025 240)"
      >
        You
      </text>
      {/* Tower dot */}
      <circle cx={x2} cy={y2} r="4" fill={terrainColor} />
      <text
        x={x2}
        y={height - 2}
        textAnchor="middle"
        fontSize="8"
        fill="oklch(0.48 0.025 240)"
      >
        Tower
      </text>
      {/* Elevation labels */}
      <text
        x={x1 - 4}
        y={y1 + 3}
        textAnchor="end"
        fontSize="8"
        fill="oklch(0.48 0.025 240)"
      >
        {Math.round(data.userElevation)}m
      </text>
      <text
        x={x2 + 4}
        y={y2 + 3}
        textAnchor="start"
        fontSize="8"
        fill="oklch(0.48 0.025 240)"
      >
        {Math.round(data.towerElevation)}m
      </text>
    </svg>
  );
}

export function GuidancePanel({
  distanceKm,
  rssi,
  bearing,
  userPosition,
  nearestTower,
}: GuidancePanelProps) {
  const mountingHeight = getMountingHeight(distanceKm);
  const quality = getSignalQuality(rssi);
  const weather = getSimulatedWeather();
  const hasObstruction = bearing > 170 && bearing < 200;
  const tiltAngle = 3 + Math.round((distanceKm / 10) * 2);

  const [elevation, setElevation] = useState<ElevationData | null>(null);
  const [elevationError, setElevationError] = useState(false);
  const [elevationLoading, setElevationLoading] = useState(false);

  useEffect(() => {
    if (!userPosition || !nearestTower) return;
    const controller = new AbortController();
    setElevationLoading(true);
    setElevationError(false);

    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${userPosition.latitude},${userPosition.longitude}|${nearestTower.latitude},${nearestTower.longitude}`;

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const results = data?.results;
        if (Array.isArray(results) && results.length >= 2) {
          const userEl = results[0].elevation as number;
          const towerEl = results[1].elevation as number;
          const diff = Math.abs(userEl - towerEl);
          const terrain: "Flat" | "Hilly" | "Obstructed" =
            diff < 50 ? "Flat" : diff < 200 ? "Hilly" : "Obstructed";
          setElevation({
            userElevation: userEl,
            towerElevation: towerEl,
            terrain,
          });
        } else {
          setElevationError(true);
        }
      })
      .catch(() => setElevationError(true))
      .finally(() => setElevationLoading(false));

    return () => controller.abort();
  }, [userPosition, nearestTower]);

  return (
    <div data-ocid="guidance.panel" className="space-y-4">
      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ArrowUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">
              Mounting Height
            </h4>
            <p className="text-xl font-bold font-display text-primary mt-0.5">
              {mountingHeight}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Recommended for {distanceKm.toFixed(1)} km tower distance
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <ArrowDown className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Tilt Angle</h4>
            <p className="text-xl font-bold font-display text-blue-600 mt-0.5">
              {tiltAngle}° downward
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Point slightly down toward tower
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              hasObstruction ? "bg-yellow-50" : "bg-signal-green/10"
            }`}
          >
            {hasObstruction ? (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-signal-green" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">
              Path Assessment
            </h4>
            <p
              className={`text-sm font-semibold mt-0.5 ${
                hasObstruction ? "text-yellow-600" : "text-signal-green"
              }`}
            >
              {hasObstruction ? "Possible obstruction" : "Clear path"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {hasObstruction
                ? "Hills/trees may block signal — try higher mount"
                : "Line of sight to tower looks clear"}
            </p>
          </div>
        </div>
      </div>

      {/* Feature 4: Line-of-Sight Estimator */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <Mountain className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">
              Elevation Profile
            </h4>
            {elevationLoading && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Loading elevation data...
              </p>
            )}
            {elevation && !elevationLoading && (
              <p
                className={`text-sm font-semibold mt-0.5 ${
                  elevation.terrain === "Flat"
                    ? "text-signal-green"
                    : elevation.terrain === "Hilly"
                      ? "text-yellow-600"
                      : "text-destructive"
                }`}
              >
                Terrain: {elevation.terrain}
              </p>
            )}
            {(elevationError ||
              (!elevationLoading && !elevation && !userPosition)) && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Elevation data unavailable — using bearing estimate
              </p>
            )}
          </div>
        </div>
        {elevation && !elevationLoading && (
          <ElevationProfile data={elevation} />
        )}
      </div>

      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Network Type</h4>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              Airtel 4G/LTE
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {quality === "strong"
                ? "Good for streaming & video calls"
                : quality === "moderate"
                  ? "Suitable for browsing & calls"
                  : "Basic calls only — improve positioning"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-xl">
            {weather.icon}
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">
              Weather Conditions
            </h4>
            <p className={`text-sm font-semibold mt-0.5 ${weather.color}`}>
              {weather.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {weather.impact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
