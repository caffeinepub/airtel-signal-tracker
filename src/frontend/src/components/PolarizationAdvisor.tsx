import { Badge } from "@/components/ui/badge";
import { Antenna } from "lucide-react";
import type { Tower } from "../backend.d";

interface Props {
  nearestTower?: Tower | null;
}

export function PolarizationAdvisor({ nearestTower }: Props) {
  const isDirectional =
    nearestTower?.name?.toLowerCase().includes("hill") ||
    nearestTower?.name?.toLowerCase().includes("micro");
  const rec = isDirectional
    ? {
        pol: "Horizontal",
        reason: "Directional/microwave links use horizontal polarization",
        badge: "Horizontal",
      }
    : {
        pol: "Vertical",
        reason:
          "Omni/macro towers use vertical polarization — mount antenna upright",
        badge: "Vertical",
      };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Antenna className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Polarization Advisor
        </h4>
        <Badge className="ml-auto text-xs bg-primary/10 text-primary border-primary/20">
          {rec.badge}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{rec.reason}</p>
      {nearestTower && (
        <p className="text-[10px] text-muted-foreground mt-1">
          Tower: {nearestTower.name}
        </p>
      )}
    </div>
  );
}
