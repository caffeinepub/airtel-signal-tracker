import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface GuideSection {
  id: string;
  icon: string;
  title: string;
  content: string[];
}

const SECTIONS: GuideSection[] = [
  {
    id: "drilling",
    icon: "\ud83d\udd29",
    title: "Drilling Technique",
    content: [
      "Mark entry point 10mm above exit point to allow for a drip loop.",
      "Use a 16mm masonry bit for brick and concrete walls.",
      "Use a 12mm wood bit for timber frames and fascia boards.",
      "Drill at a 5\u00b0 downward angle so water runs away from the building.",
      "Clear all dust and debris from the hole before threading cable.",
      "Thread cable gently \u2014 avoid kinking coaxial cables.",
    ],
  },
  {
    id: "weatherproofing",
    icon: "\ud83d\udee1\ufe0f",
    title: "Weatherproofing",
    content: [
      "Apply silicone sealant around the grommet before inserting into the wall hole.",
      "Wrap connectors and joints with self-amalgamating tape, overlapping 50% each wrap.",
      "Use UV-resistant cable ties to secure cable to the wall every 30cm.",
      "Avoid using standard PVC tape outdoors \u2014 it degrades quickly in Karamoja sun.",
      "Re-inspect all seals and tape after the first heavy rain season.",
      "Apply an extra silicone bead on top of the grommet for extra protection.",
    ],
  },
  {
    id: "entry-points",
    icon: "\ud83d\udcd0",
    title: "Cable Entry Points",
    content: [
      "Drip loop: route cable so it dips below the entry point before going up \u2014 this prevents water from running down the cable into the building.",
      "Install rubber grommets at every wall penetration to prevent cable abrasion.",
      "Maintain a bend radius greater than 5cm for coaxial cables to avoid signal loss.",
      "Use a cable entry plate or weatherproof conduit fitting where available.",
      "Seal any gap larger than 2mm with expanding foam or silicone.",
    ],
  },
  {
    id: "comparison",
    icon: "\ud83c\udfe0",
    title: "Wall vs Roof Comparison",
    content: [
      "WALL ENTRY: Easier access, shorter cable run (saves cost), more weatherproofing needed since walls face driving rain.",
      "WALL ENTRY: Good for ground-floor or single-storey installations where the antenna is on a wall bracket.",
      "ROOF ENTRY: Longer cable run (higher cost and signal loss), but provides better line-of-sight to towers.",
      "ROOF ENTRY: Needs extra UV-resistant sealant since roofs receive direct sun and thermal expansion cracks seals faster.",
      "ROOF ENTRY: Always add a drip loop just below the roof edge \u2014 flat roofs pool water and can force moisture into unsealed holes.",
      "RECOMMENDATION: Use wall entry for runs under 10m; roof entry only when antenna must be roof-mounted for signal.",
    ],
  },
];

function SectionItem({ section }: { section: GuideSection }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        data-ocid={`penetration.guide.${section.id}.toggle`}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{section.icon}</span>
          <span className="text-sm font-semibold text-foreground">
            {section.title}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          <div className="w-full h-px bg-border mb-3" />
          <ul className="space-y-2">
            {section.content.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-primary font-bold text-xs mt-0.5 shrink-0">
                  &#8250;
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function WallRoofPenetrationGuide() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Wall &amp; Roof Penetration Guide
        </h4>
        <span className="ml-auto text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          OFFLINE
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Step-by-step offline guide for drilling, weatherproofing, and routing
        cable safely through walls and roofs.
      </p>

      <div className="space-y-2">
        {SECTIONS.map((section) => (
          <SectionItem key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
