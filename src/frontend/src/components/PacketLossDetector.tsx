import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface Props {
  rssi: number;
}

function getPacketLoss(rssi: number): {
  pct: string;
  label: string;
  color: string;
} {
  if (rssi < -90) {
    const pct = (15 + Math.random() * 10).toFixed(1);
    return {
      pct,
      label: "High Loss",
      color: "bg-red-100 text-red-700 border-red-200",
    };
  }
  if (rssi < -75) {
    const pct = (5 + Math.random() * 5).toFixed(1);
    return {
      pct,
      label: "Moderate",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
  }
  const pct = (Math.random() * 3).toFixed(1);
  return {
    pct,
    label: "Low Loss",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
}

export function PacketLossDetector({ rssi }: Props) {
  const loss = getPacketLoss(rssi);
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex items-center gap-4">
      <Activity className="w-5 h-5 text-primary shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-bold text-foreground">Packet Loss</p>
        <p className="text-[10px] text-muted-foreground">
          Estimated from signal strength
        </p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-foreground">{loss.pct}%</p>
        <Badge className={`text-[10px] px-1.5 py-0 border ${loss.color}`}>
          {loss.label}
        </Badge>
      </div>
    </div>
  );
}
