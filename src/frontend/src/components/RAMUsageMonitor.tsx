import { Badge } from "@/components/ui/badge";
import { Cpu } from "lucide-react";

export function RAMUsageMonitor() {
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex items-center gap-4">
      <Cpu className="w-5 h-5 text-primary shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-bold text-foreground">Device RAM</p>
        <p className="text-[10px] text-muted-foreground">
          {memory !== undefined
            ? `${memory} GB installed`
            : "Memory info unavailable"}
        </p>
      </div>
      {memory !== undefined ? (
        <Badge
          className={`text-[10px] border ${
            memory >= 4
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : memory >= 2
                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                : "bg-red-100 text-red-700 border-red-200"
          }`}
        >
          {memory >= 4 ? "Excellent" : memory >= 2 ? "OK" : "⚠️ Low"}
        </Badge>
      ) : (
        <Badge className="text-[10px] border bg-secondary text-muted-foreground">
          Unknown
        </Badge>
      )}
    </div>
  );
}
