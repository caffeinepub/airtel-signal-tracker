import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { GPSPosition } from "../hooks/useGPS";

const OBSTACLE_KEY = "obstacle_mapper";

type ObstacleType = "Tree" | "Building" | "Hill" | "Other";

interface Obstacle {
  type: ObstacleType;
  note: string;
  lat: number;
  lon: number;
  timestamp: number;
}

function loadObstacles(): Obstacle[] {
  try {
    const stored = localStorage.getItem(OBSTACLE_KEY);
    return stored ? (JSON.parse(stored) as Obstacle[]) : [];
  } catch {
    return [];
  }
}

function saveObstacles(list: Obstacle[]) {
  localStorage.setItem(OBSTACLE_KEY, JSON.stringify(list));
}

const TYPE_ICONS: Record<ObstacleType, string> = {
  Tree: "🌳",
  Building: "🏢",
  Hill: "⛰️",
  Other: "🚧",
};

interface ObstacleMapperProps {
  userPosition: GPSPosition;
}

export function ObstacleMapper({ userPosition }: ObstacleMapperProps) {
  const [open, setOpen] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>(loadObstacles);
  const [type, setType] = useState<ObstacleType>("Tree");
  const [note, setNote] = useState("");

  const handleMark = () => {
    const newObstacle: Obstacle = {
      type,
      note: note.trim(),
      lat: userPosition.latitude,
      lon: userPosition.longitude,
      timestamp: Date.now(),
    };
    const updated = [newObstacle, ...obstacles];
    setObstacles(updated);
    saveObstacles(updated);
    setNote("");
    setOpen(false);
  };

  const handleDelete = (idx: number) => {
    const updated = obstacles.filter((_, i) => i !== idx);
    setObstacles(updated);
    saveObstacles(updated);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm text-foreground">
          🌳 Obstacle Mapper
        </h4>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="map.obstacle.open_modal_button"
              size="sm"
              variant="outline"
              className="text-xs h-8"
            >
              + Mark Obstacle
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="map.obstacle.dialog" className="max-w-sm">
            <DialogHeader>
              <DialogTitle>🌳 Mark Obstacle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Obstacle Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as ObstacleType)}
                >
                  <SelectTrigger
                    data-ocid="map.obstacle.select"
                    className="mt-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tree">🌳 Tree</SelectItem>
                    <SelectItem value="Building">🏢 Building</SelectItem>
                    <SelectItem value="Hill">⛰️ Hill</SelectItem>
                    <SelectItem value="Other">🚧 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Note (optional)</Label>
                <Textarea
                  data-ocid="map.obstacle.textarea"
                  placeholder="e.g. Large mango tree blocks north direction"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 h-20 resize-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                📍 Will be saved at your current location:{" "}
                {userPosition.latitude.toFixed(4)},{" "}
                {userPosition.longitude.toFixed(4)}
              </p>
              <div className="flex gap-2">
                <Button
                  data-ocid="map.obstacle.cancel_button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="map.obstacle.confirm_button"
                  className="btn-airtel flex-1"
                  onClick={handleMark}
                >
                  Mark at My Location
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {obstacles.length === 0 ? (
        <p
          data-ocid="map.obstacle.empty_state"
          className="text-xs text-muted-foreground text-center py-3"
        >
          No obstacles marked yet. Tap "Mark Obstacle" to add one.
        </p>
      ) : (
        <div className="space-y-2">
          {obstacles.map((obs, idx) => (
            <div
              key={obs.timestamp}
              data-ocid={`map.obstacle.item.${idx + 1}`}
              className="flex items-start gap-2 p-2 rounded-lg bg-secondary/50 border border-border/50"
            >
              <span className="text-base mt-0.5">{TYPE_ICONS[obs.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  {obs.type}
                </p>
                {obs.note && (
                  <p className="text-xs text-muted-foreground truncate">
                    {obs.note}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {obs.lat.toFixed(4)}, {obs.lon.toFixed(4)}
                </p>
              </div>
              <button
                type="button"
                data-ocid={`map.obstacle.delete_button.${idx + 1}`}
                onClick={() => handleDelete(idx)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
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
