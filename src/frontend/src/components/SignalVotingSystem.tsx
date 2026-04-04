import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const KEY = "signal_votes";

interface VoteEntry {
  lat: number;
  lon: number;
  up: number;
  down: number;
  date: string;
}

function loadVotes(): VoteEntry[] {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function getAreaVotes(lat: number, lon: number): { up: number; down: number } {
  const votes = loadVotes();
  let up = 0;
  let down = 0;
  for (const v of votes) {
    if (Math.abs(v.lat - lat) < 0.05 && Math.abs(v.lon - lon) < 0.05) {
      up += v.up;
      down += v.down;
    }
  }
  return { up, down };
}

interface Props {
  lat: number;
  lon: number;
}

export function SignalVotingSystem({ lat, lon }: Props) {
  const [counts, setCounts] = useState(() => getAreaVotes(lat, lon));

  const vote = (dir: "up" | "down") => {
    const votes = loadVotes();
    const today = new Date().toLocaleDateString();
    const existing = votes.find(
      (v) =>
        Math.abs(v.lat - lat) < 0.001 &&
        Math.abs(v.lon - lon) < 0.001 &&
        v.date === today,
    );
    if (existing) {
      existing[dir]++;
    } else {
      votes.push({
        lat,
        lon,
        up: dir === "up" ? 1 : 0,
        down: dir === "down" ? 1 : 0,
        date: today,
      });
    }
    localStorage.setItem(KEY, JSON.stringify(votes));
    setCounts(getAreaVotes(lat, lon));
    toast.success(
      dir === "up" ? "👍 Good signal reported!" : "👎 Weak signal reported",
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🗣️</span>
        <h4 className="font-bold text-sm text-foreground">Signal Vote</h4>
        <span className="text-[10px] text-muted-foreground ml-auto">
          Your area
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Rate signal quality at your current location.
      </p>
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-10 gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          onClick={() => vote("up")}
          data-ocid="signal_vote.up.button"
        >
          <ThumbsUp className="w-4 h-4" /> Good ({counts.up})
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-10 gap-2 border-red-300 text-red-700 hover:bg-red-50"
          onClick={() => vote("down")}
          data-ocid="signal_vote.down.button"
        >
          <ThumbsDown className="w-4 h-4" /> Weak ({counts.down})
        </Button>
      </div>
    </div>
  );
}
