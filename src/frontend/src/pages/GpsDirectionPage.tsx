import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Wifi, WifiOff } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  bearingToDirection,
  calculateBearing,
  calculateDistance,
} from "../utils/geo";

const MOROTO_TOWN = { latitude: 2.5341, longitude: 34.6622 };

interface GpsDirectionPageProps {
  userPosition: { latitude: number; longitude: number };
  gpsStatus: string;
  deviceHeading: number | null;
}

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

function formatETA(distanceKm: number): string {
  const walkingSpeedKmH = 5;
  const minutes = (distanceKm / walkingSpeedKmH) * 60;
  if (minutes < 60) {
    return `~${Math.round(minutes)} min walk`;
  }
  const hours = minutes / 60;
  return `~${hours.toFixed(1)} hrs walk`;
}

function CompassArrow({
  angle,
  isInTown,
}: {
  angle: number;
  isInTown: boolean;
}) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 160, height: 160 }}
    >
      {/* Outer ring */}
      <div
        className={`absolute inset-0 rounded-full border-4 ${
          isInTown ? "border-green-400" : "border-primary"
        } opacity-20`}
      />
      {/* Middle ring */}
      <div
        className={`absolute rounded-full border-2 ${
          isInTown ? "border-green-400" : "border-primary"
        } opacity-40`}
        style={{ width: 120, height: 120 }}
      />
      {/* Cardinal labels */}
      <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground">
        N
      </span>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground">
        S
      </span>
      <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
        W
      </span>
      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
        E
      </span>

      {/* Rotating arrow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: angle }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
      >
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
          role="img"
          aria-label="Compass arrow pointing toward Moroto Town"
        >
          <title>Compass arrow pointing toward Moroto Town</title>
          {/* Arrow pointing up (toward target when angle=0) */}
          <polygon
            points="80,18 92,72 80,62 68,72"
            fill={isInTown ? "#22c55e" : "hsl(var(--primary))"}
            opacity="1"
          />
          <polygon
            points="80,142 92,88 80,98 68,88"
            fill={isInTown ? "#16a34a" : "hsl(var(--primary))"}
            opacity="0.3"
          />
          {/* Center dot */}
          <circle
            cx="80"
            cy="80"
            r="8"
            fill={isInTown ? "#22c55e" : "hsl(var(--primary))"}
          />
        </svg>
      </motion.div>
    </div>
  );
}

function GpsAccuracyBadge({ status }: { status: string }) {
  const isGranted = status === "granted";
  return (
    <div className="flex items-center gap-2">
      {isGranted ? (
        <Wifi className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <WifiOff className="w-3.5 h-3.5 text-destructive" />
      )}
      <span
        className={`text-xs font-medium ${
          isGranted ? "text-green-600" : "text-destructive"
        }`}
      >
        GPS{" "}
        {status === "granted"
          ? "Active"
          : status === "denied"
            ? "Denied"
            : "Pending"}
      </span>
    </div>
  );
}

export function GpsDirectionPage({
  userPosition,
  gpsStatus,
  deviceHeading,
}: GpsDirectionPageProps) {
  const bearing = useMemo(
    () =>
      calculateBearing(
        userPosition.latitude,
        userPosition.longitude,
        MOROTO_TOWN.latitude,
        MOROTO_TOWN.longitude,
      ),
    [userPosition],
  );

  const distanceKm = useMemo(
    () =>
      calculateDistance(
        userPosition.latitude,
        userPosition.longitude,
        MOROTO_TOWN.latitude,
        MOROTO_TOWN.longitude,
      ),
    [userPosition],
  );

  const compassAngle = useMemo(
    () =>
      deviceHeading !== null ? (bearing - deviceHeading + 360) % 360 : bearing,
    [bearing, deviceHeading],
  );

  const cardinalDir = bearingToDirection(bearing);
  const isInTown = distanceKm < 0.5;

  return (
    <div data-ocid="gps.page" className="space-y-4 pb-4">
      {/* Header card */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-card mx-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              GPS Direction
            </h2>
          </div>
          <GpsAccuracyBadge status={gpsStatus} />
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Navigating to Moroto Town, Uganda
        </p>
      </div>

      {/* In-town success banner */}
      {isInTown && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          data-ocid="gps.success_state"
          className="mx-2 bg-green-500/10 border border-green-400 rounded-2xl p-4 flex items-center gap-3"
        >
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-sm font-bold text-green-700 dark:text-green-400">
              You are in Moroto Town!
            </p>
            <p className="text-xs text-green-600 dark:text-green-500">
              You have arrived at your destination.
            </p>
          </div>
        </motion.div>
      )}

      {/* Compass arrow card */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-card mx-2 flex flex-col items-center gap-4">
        <CompassArrow angle={compassAngle} isInTown={isInTown} />

        {/* Stats row */}
        <div className="w-full grid grid-cols-3 gap-2">
          <div className="bg-secondary/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Distance
            </p>
            <p className="text-lg font-bold text-foreground leading-none">
              {formatDistance(distanceKm)}
            </p>
          </div>
          <div className="bg-secondary/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Bearing
            </p>
            <p className="text-lg font-bold text-primary leading-none">
              {Math.round(bearing)}°
            </p>
          </div>
          <div className="bg-secondary/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Direction
            </p>
            <p className="text-lg font-bold text-foreground leading-none">
              {cardinalDir}
            </p>
          </div>
        </div>

        {/* ETA */}
        {!isInTown && (
          <div className="w-full bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Estimated walk time (5 km/h)
            </span>
            <Badge variant="secondary" className="font-semibold text-primary">
              {formatETA(distanceKm)}
            </Badge>
          </div>
        )}
      </div>

      {/* Device heading info */}
      <div className="mx-2 bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">
              Device Compass
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {deviceHeading !== null
                ? `Heading: ${Math.round(deviceHeading)}° — showing relative angle`
                : "No compass — showing absolute bearing"}
            </p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              deviceHeading !== null
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {deviceHeading !== null ? "Active" : "Unavailable"}
          </span>
        </div>
      </div>

      {/* Instructions card */}
      <div className="bg-primary/5 rounded-xl p-4 mx-2 border border-primary/10">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
          How to Use
        </h4>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span>📱</span>
            <span>Hold phone level, screen facing up</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🔄</span>
            <span>Rotate slowly until the red arrow points straight up</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🚶</span>
            <span>Walk in the direction the arrow points</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🎯</span>
            <span>Green arrow means you have arrived!</span>
          </li>
        </ul>
      </div>

      {/* Offline note */}
      <div
        data-ocid="gps.offline.card"
        className="mx-2 bg-card rounded-xl p-3 border border-border flex items-center gap-3"
      >
        <span className="text-xl">📡</span>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Works without internet</strong> —
          uses your device GPS only. No data required.
        </p>
      </div>
    </div>
  );
}
