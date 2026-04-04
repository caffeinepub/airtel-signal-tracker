import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bookmark, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "mounting_angle_memory";

interface SavedAngle {
  id: string;
  label: string;
  azimuth: number;
  tilt: number;
  date: string;
}

function load(): SavedAngle[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function MountingAngleMemory() {
  const [angles, setAngles] = useState<SavedAngle[]>(load);
  const [label, setLabel] = useState("");
  const [azimuth, setAzimuth] = useState("");
  const [tilt, setTilt] = useState("");

  const save = () => {
    if (!label.trim() || !azimuth || !tilt) {
      toast.error("Fill all fields");
      return;
    }
    const entry: SavedAngle = {
      id: Date.now().toString(),
      label: label.trim(),
      azimuth: Number.parseFloat(azimuth),
      tilt: Number.parseFloat(tilt),
      date: new Date().toLocaleDateString(),
    };
    const updated = [...angles, entry];
    setAngles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setLabel("");
    setAzimuth("");
    setTilt("");
    toast.success("Angle saved!");
  };

  const remove = (id: string) => {
    const updated = angles.filter((a) => a.id !== id);
    setAngles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bookmark className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Mounting Angle Memory
        </h4>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="col-span-3">
          <Label className="text-[10px] text-muted-foreground">Label</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Rooftop East"
            className="h-8 text-xs mt-1"
            data-ocid="mounting.label.input"
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">Azimuth °</Label>
          <Input
            type="number"
            value={azimuth}
            onChange={(e) => setAzimuth(e.target.value)}
            className="h-8 text-xs mt-1"
            data-ocid="mounting.azimuth.input"
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">Tilt °</Label>
          <Input
            type="number"
            value={tilt}
            onChange={(e) => setTilt(e.target.value)}
            className="h-8 text-xs mt-1"
            data-ocid="mounting.tilt.input"
          />
        </div>
        <Button
          size="sm"
          className="h-8 text-xs btn-airtel self-end"
          onClick={save}
          data-ocid="mounting.save.button"
        >
          Save
        </Button>
      </div>
      {angles.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          No saved angles yet
        </p>
      ) : (
        <div className="space-y-2 mt-2">
          {angles.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2"
            >
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">
                  {a.label}
                </p>
                <div className="flex gap-2 mt-0.5">
                  <Badge className="text-[9px] px-1 py-0 bg-primary/10 text-primary border-primary/20">
                    {a.azimuth}° Az
                  </Badge>
                  <Badge className="text-[9px] px-1 py-0 bg-secondary text-muted-foreground">
                    {a.tilt}° Tilt
                  </Badge>
                  <span className="text-[9px] text-muted-foreground">
                    {a.date}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="text-destructive hover:opacity-70"
                data-ocid="mounting.delete.button"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
