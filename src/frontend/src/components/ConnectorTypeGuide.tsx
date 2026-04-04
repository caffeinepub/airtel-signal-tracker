import { Badge } from "@/components/ui/badge";
import { Cable } from "lucide-react";

const CONNECTORS = [
  {
    name: "SMA",
    icon: "🔌",
    desc: "Small gold screw-on. Used on routers & USB modems. Indoor only.",
    usage: "Router / USB dongle",
  },
  {
    name: "N-Type",
    icon: "🔩",
    desc: "Large weatherproof screw-on. Best for outdoor antennas. Highly durable.",
    usage: "Outdoor antennas",
  },
  {
    name: "F-Type",
    icon: "📡",
    desc: "Push-on/screw coax connector. Common on cable TV equipment.",
    usage: "Cable TV / CATV",
  },
];

export function ConnectorTypeGuide() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Cable className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Connector Type Guide
        </h4>
        <Badge className="ml-auto text-xs bg-secondary text-muted-foreground">
          Offline Reference
        </Badge>
      </div>
      <div className="space-y-3">
        {CONNECTORS.map((c) => (
          <div key={c.name} className="flex gap-3 items-start">
            <span className="text-xl shrink-0 mt-0.5">{c.icon}</span>
            <div>
              <p className="text-xs font-bold text-foreground">{c.name}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {c.desc}
              </p>
              <Badge className="mt-1 text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                {c.usage}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
