import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const KEY = "signal_improvement_timeline";

interface Entry {
  id: string;
  date: string;
  type: "improved" | "degraded";
  note: string;
}

function load(): Entry[] {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function SignalImprovementTracker() {
  const [entries, setEntries] = useState<Entry[]>(load);
  const [type, setType] = useState<"improved" | "degraded">("improved");
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const addEntry = () => {
    const e: Entry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      type,
      note: note.trim(),
    };
    const updated = [e, ...entries].slice(0, 30);
    setEntries(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setNote("");
    setShowForm(false);
    toast.success("Entry logged!");
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Signal Improvement Tracker
        </h4>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] ml-auto"
          onClick={() => setShowForm((f) => !f)}
          data-ocid="sig_tracker.add.button"
        >
          + Add
        </Button>
      </div>
      {showForm && (
        <div className="bg-secondary/40 rounded-lg p-3 mb-3 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 h-8 text-xs rounded-lg border ${type === "improved" ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-secondary text-muted-foreground border-border"}`}
              onClick={() => setType("improved")}
              data-ocid="sig_tracker.improved.toggle"
            >
              📈 Improved
            </button>
            <button
              type="button"
              className={`flex-1 h-8 text-xs rounded-lg border ${type === "degraded" ? "bg-red-100 text-red-700 border-red-300" : "bg-secondary text-muted-foreground border-border"}`}
              onClick={() => setType("degraded")}
              data-ocid="sig_tracker.degraded.toggle"
            >
              📉 Degraded
            </button>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Notes</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What changed?"
              className="h-8 text-xs mt-1"
              data-ocid="sig_tracker.note.input"
            />
          </div>
          <Button
            size="sm"
            className="h-7 text-xs w-full btn-airtel"
            onClick={addEntry}
            data-ocid="sig_tracker.save.button"
          >
            Log Entry
          </Button>
        </div>
      )}
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          No entries yet. Log signal changes over time.
        </p>
      ) : (
        <div className="relative space-y-3 pl-4 max-h-48 overflow-y-auto">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
          {entries.map((e) => (
            <div key={e.id} className="relative">
              <div
                className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-background ${e.type === "improved" ? "bg-emerald-500" : "bg-red-500"}`}
              />
              <p className="text-xs font-semibold text-foreground">
                {e.type === "improved" ? "📈 Improved" : "📉 Degraded"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {e.date}
                {e.note ? ` — ${e.note}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
