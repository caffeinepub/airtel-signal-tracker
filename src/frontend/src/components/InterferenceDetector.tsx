import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const INTERFERENCE_KEY = "interference_sources";

type SourceType = "Power Line" | "Generator" | "Other";

interface InterferenceSource {
  id: string;
  name: string;
  type: SourceType;
  distanceM: number;
}

function loadSources(): InterferenceSource[] {
  try {
    const s = localStorage.getItem(INTERFERENCE_KEY);
    return s ? (JSON.parse(s) as InterferenceSource[]) : [];
  } catch {
    return [];
  }
}

function saveSources(list: InterferenceSource[]) {
  localStorage.setItem(INTERFERENCE_KEY, JSON.stringify(list));
}

export function InterferenceDetector() {
  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<InterferenceSource[]>(loadSources);
  const [name, setName] = useState("");
  const [type, setType] = useState<SourceType>("Power Line");
  const [distance, setDistance] = useState("200");

  const nearSources = sources.filter((s) => s.distanceM <= 500);
  const hasInterference = nearSources.length > 0;

  const handleAdd = () => {
    if (!name.trim()) {
      toast.error("Please enter a source name");
      return;
    }
    const newS: InterferenceSource = {
      id: Date.now().toString(),
      name: name.trim(),
      type,
      distanceM: Number(distance) || 200,
    };
    const updated = [newS, ...sources];
    setSources(updated);
    saveSources(updated);
    setName("");
    setDistance("200");
    toast.success("Interference source added");
  };

  const handleDelete = (id: string) => {
    const updated = sources.filter((s) => s.id !== id);
    setSources(updated);
    saveSources(updated);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <button
        type="button"
        data-ocid="home.interference.toggle"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-foreground">
            Interference Detector
          </span>
          {hasInterference && (
            <span className="text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-2 py-0.5">
              ⚠️ {nearSources.length} nearby
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-4 pb-4 space-y-4"
        >
          {hasInterference && (
            <div className="flex items-start gap-2 bg-destructive/10 rounded-lg p-3 border border-destructive/20">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                <strong>Interference detected nearby</strong> — may reduce
                signal by 5–15 dBm. Consider repositioning your antenna away
                from these sources.
              </p>
            </div>
          )}

          <div className="bg-secondary/30 rounded-xl p-3 space-y-3 border border-border/50">
            <p className="text-xs font-semibold text-foreground">
              Add interference source
            </p>
            <div>
              <Label className="text-xs text-muted-foreground">
                Source Name
              </Label>
              <Input
                data-ocid="home.interference.name.input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Power pole on road"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as SourceType)}
              >
                <SelectTrigger
                  data-ocid="home.interference.type.select"
                  className="mt-1 h-9 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Power Line">⚡ Power Line</SelectItem>
                  <SelectItem value="Generator">🔋 Generator</SelectItem>
                  <SelectItem value="Other">📡 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Est. Distance (meters)
              </Label>
              <Input
                data-ocid="home.interference.distance.input"
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                min={10}
                max={5000}
                className="mt-1 h-9 text-sm"
              />
            </div>
            <Button
              data-ocid="home.interference.add.button"
              className="btn-airtel w-full h-9 text-sm font-bold"
              onClick={handleAdd}
            >
              Add Source
            </Button>
          </div>

          {sources.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              No interference sources added yet.
            </p>
          ) : (
            <div className="space-y-2">
              {sources.map((s, idx) => (
                <div
                  key={s.id}
                  data-ocid={`home.interference.item.${idx + 1}`}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    s.distanceM <= 500
                      ? "bg-destructive/5 border-destructive/20"
                      : "bg-secondary/50 border-border/50"
                  }`}
                >
                  <span className="text-base shrink-0">
                    {s.type === "Power Line"
                      ? "⚡"
                      : s.type === "Generator"
                        ? "🔋"
                        : "📡"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.type} · {s.distanceM}m away
                      {s.distanceM <= 500 && (
                        <span className="text-destructive font-semibold">
                          {" "}
                          · ⚠️ Too close
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-ocid={`home.interference.delete_button.${idx + 1}`}
                    onClick={() => handleDelete(s.id)}
                    className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
