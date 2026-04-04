import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSignature } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { GPSPosition } from "../hooks/useGPS";

const KEY = "tower_petition";

interface Signature {
  name: string;
  village: string;
  date: string;
}

function loadSigs(): Signature[] {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

interface Props {
  userPosition: GPSPosition;
}

export function CrowdFundedTowerRequest({ userPosition }: Props) {
  const [sigs, setSigs] = useState<Signature[]>(loadSigs);
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");

  const sign = () => {
    if (!name.trim()) {
      toast.error("Enter your name");
      return;
    }
    const s: Signature = {
      name: name.trim(),
      village: village.trim() || "Moroto",
      date: new Date().toLocaleDateString(),
    };
    const updated = [...sigs, s];
    setSigs(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setName("");
    setVillage("");
    toast.success("Signature added! 📝");
  };

  const sendToAirtel = () => {
    const lat = userPosition.latitude.toFixed(4);
    const lon = userPosition.longitude.toFixed(4);
    const body = `Tower Request Petition: ${sigs.length} residents at lat ${lat} lon ${lon} request a new Airtel tower. Villages: ${[...new Set(sigs.map((s) => s.village))].join(", ")}. Please investigate coverage.`;
    window.location.href = `sms:+256800100100?body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileSignature className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Tower Request Petition
        </h4>
        <span className="text-xs font-bold text-primary ml-auto">
          {sigs.length} signed
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Collect signatures from residents to request a new tower in a dead zone
        area.
      </p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <Label className="text-[10px] text-muted-foreground">Your Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-xs mt-1"
            data-ocid="petition.name.input"
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">Village</Label>
          <Input
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            className="h-8 text-xs mt-1"
            data-ocid="petition.village.input"
          />
        </div>
      </div>
      <Button
        size="sm"
        className="h-8 text-xs w-full btn-airtel mb-3"
        onClick={sign}
        data-ocid="petition.sign.button"
      >
        Sign Petition
      </Button>
      {sigs.length > 0 && (
        <>
          <div className="bg-primary/5 rounded-lg p-2 mb-2">
            <p className="text-xs text-muted-foreground">
              📢 {sigs.length} people have signed this petition
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs w-full"
            onClick={sendToAirtel}
            data-ocid="petition.send_sms.button"
          >
            📲 Send to Airtel via SMS
          </Button>
        </>
      )}
    </div>
  );
}
