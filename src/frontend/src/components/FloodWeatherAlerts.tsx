import { Badge } from "@/components/ui/badge";
import { CloudRain, ExternalLink, Sun, Thermometer, Wind } from "lucide-react";

const MONTH = new Date().getMonth(); // 0-indexed

interface Season {
  name: string;
  months: number[];
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  advisory: string;
  risk: string;
}

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const seasons: Season[] = [
  {
    name: "Flood Season",
    months: [2, 3, 4], // March–May
    icon: <CloudRain className="w-5 h-5" />,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    risk: "High flood risk",
    advisory:
      "High flood risk in lowlands around Moroto. Avoid river crossings. Signal towers in flood zones may go offline. Keep emergency contacts updated.",
  },
  {
    name: "Long Rains",
    months: [5, 6, 7],
    icon: <CloudRain className="w-5 h-5" />,
    color: "text-cyan-700",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-300",
    risk: "Moderate rain",
    advisory:
      "Occasional heavy rains. Signal may degrade during storms. Check the weather before outdoor antenna work.",
  },
  {
    name: "Dry & Heat Season",
    months: [6, 7, 8], // July–Aug
    icon: <Thermometer className="w-5 h-5" />,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    risk: "Extreme heat",
    advisory:
      "Extreme heat in Karamoja. Check thermal warnings on your device. Avoid leaving phones in direct sunlight during signal surveys.",
  },
  {
    name: "Dust Storm Season",
    months: [11, 0, 1], // Dec–Feb
    icon: <Wind className="w-5 h-5" />,
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    risk: "Dust interference",
    advisory:
      "Dust storms common in Moroto district. Reduced signal visibility. Protect antenna connectors from dust infiltration. Signal interference possible on higher frequency bands.",
  },
  {
    name: "Clear Season",
    months: [9, 10], // Oct–Nov
    icon: <Sun className="w-5 h-5" />,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    risk: "Good conditions",
    advisory:
      "Generally clear conditions. Best time for outdoor antenna installation and alignment. Signal should be at its most stable during this period.",
  },
];

function getActiveSeasons(): Season[] {
  return seasons.filter((s) => s.months.includes(MONTH));
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function FloodWeatherAlerts() {
  const activeSeasons = getActiveSeasons();

  return (
    <div className="bg-card rounded-xl border border-border shadow p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CloudRain className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-foreground text-sm">
          Flood & Weather Alerts
        </h3>
        <Badge variant="secondary" className="ml-auto text-[10px]">
          Karamoja Region
        </Badge>
      </div>

      {/* Offline badge + current month */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-[10px] border-muted-foreground/30 text-muted-foreground"
        >
          📴 Offline — cached advisories
        </Badge>
        <Badge
          variant="outline"
          className="text-[10px] border-primary/40 text-primary"
        >
          {MONTH_NAMES[MONTH]}
        </Badge>
      </div>

      {/* Active season(s) highlight */}
      {activeSeasons.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-foreground">
            Active Now
          </p>
          {activeSeasons.map((season) => (
            <div
              key={season.name}
              className={`${season.bgColor} ${season.borderColor} border rounded-lg p-3`}
              data-ocid="safety.weather.card"
            >
              <div className={`flex items-center gap-2 mb-1 ${season.color}`}>
                {season.icon}
                <span className="font-bold text-sm">{season.name}</span>
                <Badge className="ml-auto text-[9px] bg-white/50 text-current border-0">
                  {season.risk}
                </Badge>
              </div>
              <p className={`text-xs ${season.color} opacity-90`}>
                {season.advisory}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* All seasons reference */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-muted-foreground">
          Seasonal Calendar
        </p>
        {seasons.map((season, i) => {
          const isActive = season.months.includes(MONTH);
          const monthLabels = MONTH_ABBR.filter((_, idx) =>
            season.months.includes(idx),
          ).join(", ");
          return (
            <div
              key={season.name}
              className={`flex items-start gap-2 p-2 rounded-lg ${
                isActive
                  ? `${season.bgColor} ${season.borderColor} border`
                  : "bg-muted/30"
              }`}
              data-ocid={`safety.weather.item.${i + 1}`}
            >
              <span
                className={`mt-0.5 ${isActive ? season.color : "text-muted-foreground"}`}
              >
                {season.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p
                    className={`text-xs font-semibold ${
                      isActive ? season.color : "text-foreground"
                    }`}
                  >
                    {season.name}
                  </p>
                  {isActive && (
                    <Badge className="text-[8px] bg-current/10 text-current border-0 px-1">
                      Now
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {monthLabels}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* External links */}
      <div className="space-y-1.5 pt-1">
        <p className="text-[11px] font-semibold text-muted-foreground">
          Official Resources (requires internet)
        </p>
        <a
          href="https://www.meteo.go.ug"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-xs text-primary hover:bg-muted transition-colors"
          data-ocid="safety.weather.meteo.link"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Uganda Meteorological Authority
        </a>
        <a
          href="https://www.redcrossuganda.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-xs text-primary hover:bg-muted transition-colors"
          data-ocid="safety.weather.redcross.link"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Uganda Red Cross
        </a>
      </div>
    </div>
  );
}
