import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function NightVisionARMode({ videoRef }: Props) {
  const [active, setActive] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.style.filter = "brightness(2) contrast(1.5) saturate(0)";
    } else {
      video.style.filter = "";
    }
  }, [active, videoRef]);

  return (
    <>
      {/* Green tint overlay when active */}
      {active && (
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "rgba(0, 255, 0, 0.06)",
            mixBlendMode: "screen",
          }}
        />
      )}
      <Button
        size="sm"
        variant={active ? "default" : "outline"}
        className={`absolute top-16 right-2 h-8 text-xs z-20 ${active ? "bg-emerald-600 text-white border-emerald-600" : "bg-black/50 text-white border-white/30"}`}
        onClick={() => setActive((a) => !a)}
        data-ocid="ar.night_vision.toggle"
      >
        {active ? "🌙 Night ON" : "☀️ Night OFF"}
      </Button>
    </>
  );
}
