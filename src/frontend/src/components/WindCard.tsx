import { useEffect, useState } from "react";
import type { GPSPosition } from "../hooks/useGPS";

interface WindData {
  speed: number;
  direction: number;
}

function degreesToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

interface WindCardProps {
  userPosition: GPSPosition;
}

export function WindCard({ userPosition }: WindCardProps) {
  const [wind, setWind] = useState<WindData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchWind = async () => {
      setLoading(true);
      setError(false);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${userPosition.latitude}&longitude=${userPosition.longitude}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=ms`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (!cancelled) {
          setWind({
            speed: data.current.wind_speed_10m,
            direction: data.current.wind_direction_10m,
          });
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchWind();
    return () => {
      cancelled = true;
    };
  }, [userPosition.latitude, userPosition.longitude]);

  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-card">
      <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
        🌬️ Wind Conditions
      </h4>
      {loading && (
        <div
          data-ocid="wind.loading_state"
          className="text-xs text-muted-foreground"
        >
          Loading wind data...
        </div>
      )}
      {error && !loading && (
        <div
          data-ocid="wind.error_state"
          className="text-xs text-muted-foreground"
        >
          Wind data unavailable — check connection
        </div>
      )}
      {wind && !loading && (
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0"
            style={{
              transform: `rotate(${wind.direction}deg)`,
              transition: "transform 0.8s ease",
            }}
            title={`Wind direction: ${wind.direction}°`}
          >
            🧭
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {wind.speed.toFixed(1)} m/s
            </p>
            <p className="text-xs text-muted-foreground">
              {degreesToCompass(wind.direction)} ({wind.direction}°)
            </p>
            {wind.speed > 10 && (
              <p className="text-xs text-yellow-600 mt-1 font-medium">
                ⚠️ High wind — delay outdoor installation
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
