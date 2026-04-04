import { Badge } from "@/components/ui/badge";
import { Waves } from "lucide-react";

interface Props {
  rssi: number;
}

function getJitter(rssi: number): { ms: string; label: string; color: string } {
  if (rssi < -90) {
    const ms = (80 + Math.random() * 40).toFixed(0);
    return {
      ms,
      label: "High Jitter",
      color: "bg-red-100 text-red-700 border-red-200",
    };
  }
  if (rssi < -75) {
    const ms = (20 + Math.random() * 30).toFixed(0);
    return {
      ms,
      label: "Moderate",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
  }
  const ms = (5 + Math.random() * 10).toFixed(0);
  return {
    ms,
    label: "Stable",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
}

export function NetworkJitterMeter({ rssi }: Props) {
  const jitter = getJitter(rssi);
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex items-center gap-4">
      <Waves className="w-5 h-5 text-primary shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-bold text-foreground">Network Jitter</p>
        <p className="text-[10px] text-muted-foreground">
          Ping variation (VoIP / calls)
        </p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-foreground">{jitter.ms} ms</p>
        <Badge className={`text-[10px] px-1.5 py-0 border ${jitter.color}`}>
          {jitter.label}
        </Badge>
      </div>
    </div>
  );
}
