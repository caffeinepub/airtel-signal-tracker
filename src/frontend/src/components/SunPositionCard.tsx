import type { GPSPosition } from "../hooks/useGPS";

function getSunPosition(
  lat: number,
  _lon: number,
  date: Date,
): { azimuth: number; altitude: number } {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const declination = toRad(
    23.45 * Math.sin(toRad((360 / 365) * (dayOfYear - 81))),
  );
  const hourAngle = toRad((date.getHours() + date.getMinutes() / 60 - 12) * 15);

  const latRad = toRad(lat);
  const altRad = Math.asin(
    Math.sin(latRad) * Math.sin(declination) +
      Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle),
  );
  const azRad = Math.atan2(
    -Math.cos(declination) * Math.sin(hourAngle),
    Math.cos(latRad) * Math.sin(declination) -
      Math.sin(latRad) * Math.cos(declination) * Math.cos(hourAngle),
  );

  return {
    azimuth: (toDeg(azRad) + 360) % 360,
    altitude: toDeg(altRad),
  };
}

interface SunPositionCardProps {
  userPosition: GPSPosition;
  antennaBearing: number;
}

export function SunPositionCard({
  userPosition,
  antennaBearing,
}: SunPositionCardProps) {
  const now = new Date();
  const sun = getSunPosition(
    userPosition.latitude,
    userPosition.longitude,
    now,
  );

  const azDiff = Math.abs(
    ((sun.azimuth - antennaBearing + 180 + 360) % 360) - 180,
  );
  const isSunInAntennaDir = azDiff < 30 && sun.altitude > 0;

  const isDaytime = sun.altitude > 0;

  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-card">
      <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
        ☀️ Sun Position
      </h4>
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
          style={{
            background: isDaytime
              ? "radial-gradient(circle, #FFF4CC, #FFD700)"
              : "radial-gradient(circle, #1a2035, #2d3a5a)",
            boxShadow: isDaytime ? "0 0 16px rgba(255,215,0,0.5)" : "none",
          }}
        >
          {isDaytime ? "☀️" : "🌙"}
        </div>
        <div className="flex-1">
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Azimuth</p>
              <p className="text-sm font-bold text-foreground">
                {sun.azimuth.toFixed(0)}°
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Altitude</p>
              <p className="text-sm font-bold text-foreground">
                {sun.altitude.toFixed(0)}°
              </p>
            </div>
          </div>
          {isSunInAntennaDir && (
            <p className="text-xs text-yellow-600 mt-1 font-medium">
              ⚠️ Sun near antenna direction — may cause interference
            </p>
          )}
          {!isDaytime && (
            <p className="text-xs text-muted-foreground mt-1">
              Sun below horizon — no solar interference
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
