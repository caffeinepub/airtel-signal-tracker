import { Badge } from "@/components/ui/badge";
import { BarChart2 } from "lucide-react";

interface Props {
  rssi: number;
}

export function SignalToNoiseRatio({ rssi }: Props) {
  const snr = rssi - -110;
  let label: string;
  let color: string;
  if (snr >= 25) {
    label = "Excellent";
    color = "bg-emerald-100 text-emerald-700 border-emerald-200";
  } else if (snr >= 15) {
    label = "Good";
    color = "bg-blue-100 text-blue-700 border-blue-200";
  } else if (snr >= 10) {
    label = "Fair";
    color = "bg-yellow-100 text-yellow-700 border-yellow-200";
  } else {
    label = "Poor";
    color = "bg-red-100 text-red-700 border-red-200";
  }

  const barPct = Math.min(100, Math.max(0, (snr / 50) * 100));

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Signal-to-Noise Ratio
        </h4>
        <Badge className={`ml-auto text-[10px] px-1.5 py-0 border ${color}`}>
          {label}
        </Badge>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-foreground">
          {snr.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">dB</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${barPct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5">
        Formula: RSSI − (−110 dBm noise floor)
      </p>
    </div>
  );
}
