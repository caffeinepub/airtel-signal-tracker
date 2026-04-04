import { CloudRain } from "lucide-react";
import { useMemo } from "react";
import { getSimulatedWeather } from "../utils/weather";

type WeatherCondition =
  | "clear"
  | "light_rain"
  | "heavy_rain"
  | "fog"
  | "dust_storm"
  | "high_humidity";

interface WeatherImpact {
  condition: WeatherCondition;
  label: string;
  icon: string;
  lossDbm: number;
  description: string;
}

const IMPACTS: WeatherImpact[] = [
  {
    condition: "clear",
    label: "Clear",
    icon: "☀️",
    lossDbm: 0,
    description: "Optimal signal conditions",
  },
  {
    condition: "light_rain",
    label: "Light Rain",
    icon: "🌦️",
    lossDbm: -2,
    description: "Minimal impact",
  },
  {
    condition: "heavy_rain",
    label: "Heavy Rain",
    icon: "🌧️",
    lossDbm: -8,
    description: "Rain fade — expect signal drops",
  },
  {
    condition: "fog",
    label: "Fog",
    icon: "🌫️",
    lossDbm: -3,
    description: "Moisture absorbs signal",
  },
  {
    condition: "dust_storm",
    label: "Dust Storm",
    icon: "🌪️",
    lossDbm: -12,
    description: "Severe attenuation — common in Karamoja dry season",
  },
  {
    condition: "high_humidity",
    label: "High Humidity",
    icon: "💧",
    lossDbm: -4,
    description: "Increased atmospheric absorption",
  },
];

export function WeatherImpactCard() {
  const weather = useMemo(() => getSimulatedWeather(), []);

  // Map simulated weather to impact
  const impact: WeatherImpact = useMemo(() => {
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    // Dry season (Dec–Mar) in Karamoja = potential dust
    if (month >= 11 || month <= 2) {
      if (hour >= 12 && hour <= 16) return IMPACTS[4]; // dust storm afternoon
    }
    if (weather.label.includes("Rain") || weather.label.includes("Thunder")) {
      return hour > 12 ? IMPACTS[2] : IMPACTS[1];
    }
    if (weather.label.includes("Overcast")) return IMPACTS[2];
    // Humidity: assume high in morning
    if (hour >= 5 && hour <= 8) return IMPACTS[5];
    return IMPACTS[0]; // clear
  }, [weather]);

  const lossColor =
    impact.lossDbm === 0
      ? "text-signal-green"
      : impact.lossDbm >= -3
        ? "text-yellow-500"
        : impact.lossDbm >= -8
          ? "text-orange-500"
          : "text-destructive";

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <CloudRain className="w-4 h-4 text-blue-500" />
        <h4 className="font-bold text-sm text-foreground">
          Weather Impact Estimator
        </h4>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-4xl">{impact.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {impact.label}
            </span>
            <span className={`text-sm font-bold ${lossColor}`}>
              {impact.lossDbm === 0 ? "±0 dBm" : `${impact.lossDbm} dBm`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {impact.description}
          </p>
          {impact.lossDbm < 0 && (
            <p className="text-xs text-yellow-600 mt-1">
              💡 Account for this loss when setting antenna direction
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
