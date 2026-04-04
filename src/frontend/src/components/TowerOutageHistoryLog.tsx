import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const KEY = "tower_outage_history";

interface OutageEntry {
  id: string;
  tower: string;
  start: string;
  end: string;
  note: string;
}

function load(): OutageEntry[] {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function TowerOutageHistoryLog() {
  const [entries, setEntries] = useState<OutageEntry[]>(load);
  const [tower, setTower] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const addEntry = () => {
    if (!tower.trim() || !start) {
      toast.error("Tower name and start time required");
      return;
    }
    const entry: OutageEntry = {
      id: Date.now().toString(),
      tower: tower.trim(),
      start,
      end,
      note: note.trim(),
    };
    const updated = [entry, ...entries].slice(0, 50);
    setEntries(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setTower("");
    setStart("");
    setEnd("");
    setNote("");
    setShowForm(false);
    toast.success("Outage logged");
  };

  const remove = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <h4 className="font-bold text-sm text-foreground">Tower Outage Log</h4>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] ml-auto"
          onClick={() => setShowForm((f) => !f)}
          data-ocid="outage_log.toggle.button"
        >
          <Plus className="w-3 h-3 mr-1" /> Log Outage
        </Button>
      </div>
      {showForm && (
        <div className="bg-secondary/40 rounded-lg p-3 mb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={tower}
              onChange={(e) => setTower(e.target.value)}
              placeholder="Tower name"
              className="h-8 text-xs col-span-2"
              data-ocid="outage_log.tower.input"
            />
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Start time
              </Label>
              <Input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="h-8 text-xs mt-1"
                data-ocid="outage_log.start.input"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">
                End time
              </Label>
              <Input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="h-8 text-xs mt-1"
                data-ocid="outage_log.end.input"
              />
            </div>
          </div>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notes (optional)"
            className="h-8 text-xs"
            data-ocid="outage_log.note.input"
          />
          <Button
            size="sm"
            className="h-7 text-xs w-full btn-airtel"
            onClick={addEntry}
            data-ocid="outage_log.save.button"
          >
            Save Entry
          </Button>
        </div>
      )}
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">
          No outages logged yet
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-start gap-2 text-xs bg-secondary/30 rounded-lg p-2"
            >
              <div className="flex-1">
                <p className="font-semibold text-foreground">{e.tower}</p>
                <p className="text-[10px] text-muted-foreground">
                  {e.start}
                  {e.end ? ` → ${e.end}` : " (ongoing)"}
                </p>
                {e.note && (
                  <p className="text-[10px] text-muted-foreground">{e.note}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(e.id)}
                className="text-muted-foreground hover:text-destructive shrink-0"
                data-ocid="outage_log.delete.button"
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
