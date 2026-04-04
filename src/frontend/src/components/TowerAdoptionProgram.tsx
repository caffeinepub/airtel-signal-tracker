import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { Tower } from "../backend.d";

const KEY = "tower_watchers";

interface WatcherEntry {
  towerName: string;
  checkins: string[];
}

function loadWatchers(): WatcherEntry[] {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

interface Props {
  towers: Tower[];
}

export function TowerAdoptionProgram({ towers }: Props) {
  const [watchers, setWatchers] = useState<WatcherEntry[]>(loadWatchers);

  const toggleWatch = (name: string) => {
    setWatchers((prev) => {
      const existing = prev.find((w) => w.towerName === name);
      let updated: WatcherEntry[];
      if (existing) {
        updated = prev.filter((w) => w.towerName !== name);
      } else {
        updated = [...prev, { towerName: name, checkins: [] }];
      }
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const checkIn = (name: string) => {
    setWatchers((prev) => {
      const updated = prev.map((w) => {
        if (w.towerName !== name) return w;
        return {
          ...w,
          checkins: [...w.checkins, new Date().toLocaleDateString()],
        };
      });
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">Tower Adoption</h4>
        <span className="text-[10px] text-muted-foreground ml-auto">
          Watch towers
        </span>
      </div>
      <div className="space-y-2">
        {towers.slice(0, 5).map((t) => {
          const watcher = watchers.find((w) => w.towerName === t.name);
          const isWatching = !!watcher;
          return (
            <div key={t.name} className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">
                  {t.name}
                </p>
                {isWatching && (
                  <p className="text-[10px] text-muted-foreground">
                    {watcher.checkins.length} check-ins
                  </p>
                )}
              </div>
              {isWatching && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[9px]"
                  onClick={() => checkIn(t.name)}
                  data-ocid="tower_adopt.checkin.button"
                >
                  ✓ Check In
                </Button>
              )}
              <Button
                size="sm"
                variant={isWatching ? "default" : "outline"}
                className={`h-6 text-[9px] ${isWatching ? "btn-airtel" : ""}`}
                onClick={() => toggleWatch(t.name)}
                data-ocid="tower_adopt.watch.button"
              >
                {isWatching ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Unwatch
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Watch
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
