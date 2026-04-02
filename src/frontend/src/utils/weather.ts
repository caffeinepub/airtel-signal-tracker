export interface WeatherInfo {
  icon: string;
  label: string;
  impact: string;
  color: string;
}

const conditions: WeatherInfo[] = [
  {
    icon: "☀️",
    label: "Clear",
    impact: "Excellent signal conditions",
    color: "text-yellow-600",
  },
  {
    icon: "⛅",
    label: "Partly Cloudy",
    impact: "Good signal expected",
    color: "text-blue-500",
  },
  {
    icon: "🌥️",
    label: "Overcast",
    impact: "Slight signal reduction",
    color: "text-gray-500",
  },
  {
    icon: "🌧️",
    label: "Rain",
    impact: "Reduced signal — rain fade",
    color: "text-blue-700",
  },
  {
    icon: "⛈️",
    label: "Thunderstorm",
    impact: "High interference risk",
    color: "text-purple-700",
  },
];

export function getSimulatedWeather(): WeatherInfo {
  const hour = new Date().getHours();
  const idx = hour % conditions.length;
  return conditions[idx];
}
