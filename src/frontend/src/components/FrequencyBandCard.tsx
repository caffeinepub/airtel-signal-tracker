interface FrequencyBandCardProps {
  distanceKm: number;
}

interface BandInfo {
  band: string;
  freq: string;
  name: string;
  recommendation: string;
  color: string;
}

function getBandInfo(distanceKm: number): BandInfo {
  if (distanceKm < 2) {
    return {
      band: "Band 3",
      freq: "2100 MHz",
      name: "Urban 4G",
      recommendation: "High-capacity urban band. Best for fast speeds in town.",
      color: "text-blue-600 bg-blue-50 border-blue-200",
    };
  }
  if (distanceKm < 10) {
    return {
      band: "Band 20",
      freq: "800 MHz",
      name: "Rural 4G",
      recommendation:
        "Best for rural coverage. Penetrates walls and trees well.",
      color: "text-signal-green bg-signal-green/10 border-signal-green/20",
    };
  }
  return {
    band: "Band 28",
    freq: "700 MHz",
    name: "Extended Range",
    recommendation:
      "Longest range band. Ideal for remote areas 10+ km from tower.",
    color: "text-orange-600 bg-orange-50 border-orange-200",
  };
}

export function FrequencyBandCard({ distanceKm }: FrequencyBandCardProps) {
  const info = getBandInfo(distanceKm);

  return (
    <div className="bg-card rounded-xl border border-border shadow-xs p-4">
      <h4 className="font-bold text-sm text-foreground mb-3">
        📶 Frequency Band
      </h4>
      <div className={`rounded-xl p-3 border ${info.color}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1">
            <p className="font-bold text-base">{info.band}</p>
            <p className="text-xs font-semibold opacity-80">
              {info.freq} · {info.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium opacity-70">
              {distanceKm.toFixed(1)} km
            </p>
            <p className="text-xs opacity-60">to tower</p>
          </div>
        </div>
        <p className="text-xs opacity-80 leading-relaxed">
          {info.recommendation}
        </p>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Estimated based on distance to nearest tower. Actual band depends on
        phone hardware.
      </p>
    </div>
  );
}
