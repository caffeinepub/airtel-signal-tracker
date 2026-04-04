import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const SECTIONS = [
  {
    title: "Antenna Types",
    content:
      "Omni-directional: 360° coverage, 3-5 dBi gain. Directional (Yagi): Focused beam, 9-14 dBi, best for fixed tower. Panel antenna: Flat, weatherproof, 12-15 dBi. Dish: Highest gain 20+ dBi, long range.",
  },
  {
    title: "Mounting Safety",
    content:
      "Always use a safety harness above 2m. Two people required for roof work. Check roof load capacity. Use stainless steel hardware to prevent rust. Test mount stability before attaching antenna.",
  },
  {
    title: "Cable Management",
    content:
      "Use LMR-400 coax for runs >5m (lower loss). Maximum 10m cable run for best performance. Secure cable every 50cm with clips. Drip loops prevent water entering connectors. Label both ends.",
  },
  {
    title: "Weatherproofing",
    content:
      "Wrap all outdoor connections with self-amalgamating (silicone) tape. Apply at 50% overlap, starting below connector. Use UV-resistant tape for long-term installs. Check connections every 6 months.",
  },
  {
    title: "Troubleshooting",
    content:
      "Weak signal: Check cable connections, verify alignment with compass. No signal: Check SIM, try different band. Intermittent signal: Check for loose connections, weather impact, congestion times.",
  },
  {
    title: "Glossary",
    content:
      "dBm: Signal strength unit (higher number = stronger, e.g. -70 > -90). dBi: Antenna gain over isotropic radiator. RSSI: Received Signal Strength Indicator. LTE: Long Term Evolution (4G). Band: Radio frequency range used by network.",
  },
];

export function OfflineAntennaManual() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Offline Antenna Manual
        </h4>
        <Badge className="ml-auto text-xs bg-secondary text-muted-foreground">
          6 Sections
        </Badge>
      </div>
      <div className="space-y-2">
        {SECTIONS.map((s, i) => (
          <div
            key={s.title}
            className="bg-secondary/30 rounded-lg overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 text-left"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <span className="text-xs font-semibold text-foreground">
                {s.title}
              </span>
              {openIdx === i ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            {openIdx === i && (
              <div className="px-3 pb-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {s.content}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
