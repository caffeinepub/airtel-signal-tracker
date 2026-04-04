import { Button } from "@/components/ui/button";
import { Compass, MapPin, Phone } from "lucide-react";

interface Props {
  onNavigate: (tab: string) => void;
}

export function ElderModeView({ onNavigate }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 py-8 bg-background">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-foreground">
          Airtel Signal Finder
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          Choose an option below
        </p>
      </div>

      <Button
        data-ocid="elder.find_signal.button"
        className="w-full max-w-xs h-20 text-xl font-bold rounded-2xl bg-primary text-primary-foreground flex items-center gap-4 shadow-lg"
        onClick={() => onNavigate("compass")}
      >
        <Compass className="w-8 h-8 shrink-0" />
        Find Signal Direction
      </Button>

      <Button
        data-ocid="elder.nearest_tower.button"
        variant="outline"
        className="w-full max-w-xs h-20 text-xl font-bold rounded-2xl border-2 flex items-center gap-4 shadow-sm"
        onClick={() => onNavigate("map")}
      >
        <MapPin className="w-8 h-8 shrink-0 text-blue-500" />
        Nearest Tower
      </Button>

      <a
        href="tel:+256800100100"
        data-ocid="elder.call_airtel.button"
        className="w-full max-w-xs h-20 text-xl font-bold rounded-2xl bg-emerald-600 text-white flex items-center justify-center gap-4 shadow-lg"
      >
        <Phone className="w-8 h-8 shrink-0" />
        Call Airtel Support
      </a>

      <p className="text-sm text-muted-foreground text-center mt-4">
        Free call: 0800 100 100
      </p>
    </div>
  );
}
