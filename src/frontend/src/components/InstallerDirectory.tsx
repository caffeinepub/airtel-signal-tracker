import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const INSTALLER_KEY = "installer_directory";

interface Installer {
  id: string;
  name: string;
  phone: string;
  area: string;
  dateAdded: string;
}

interface InstallerVotes {
  up: number;
  down: number;
}

function loadInstallers(): Installer[] {
  try {
    const stored = localStorage.getItem(INSTALLER_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as (
      | Installer
      | (Omit<Installer, "id"> & { id?: string })
    )[];
    // Ensure all entries have IDs
    return parsed.map((item, i) => ({
      id: item.id ?? `legacy-${i}`,
      name: item.name,
      phone: item.phone,
      area: item.area,
      dateAdded: item.dateAdded,
    }));
  } catch {
    return [];
  }
}

function saveInstallers(list: Installer[]) {
  localStorage.setItem(INSTALLER_KEY, JSON.stringify(list));
}

function loadVotes(id: string): InstallerVotes {
  try {
    const s = localStorage.getItem(`installer_votes_${id}`);
    return s ? JSON.parse(s) : { up: 0, down: 0 };
  } catch {
    return { up: 0, down: 0 };
  }
}

function saveVotes(id: string, votes: InstallerVotes) {
  localStorage.setItem(`installer_votes_${id}`, JSON.stringify(votes));
}

export function InstallerDirectory() {
  const [open, setOpen] = useState(false);
  const [installers, setInstallers] = useState<Installer[]>(() => {
    const list = loadInstallers();
    // Sort by vote count
    return list.sort((a, b) => {
      const votesA = loadVotes(a.id);
      const votesB = loadVotes(b.id);
      return votesB.up - votesA.up;
    });
  });
  const [votes, setVotes] = useState<Record<string, InstallerVotes>>(() => {
    const map: Record<string, InstallerVotes> = {};
    for (const inst of loadInstallers()) {
      map[inst.id] = loadVotes(inst.id);
    }
    return map;
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim() || !area.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    const newEntry: Installer = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      area: area.trim(),
      dateAdded: new Date().toLocaleDateString(),
    };
    const updated = [newEntry, ...installers];
    setInstallers(updated);
    saveInstallers(updated);
    setVotes((v) => ({ ...v, [newEntry.id]: { up: 0, down: 0 } }));
    setName("");
    setPhone("");
    setArea("");
    toast.success("Installer added!");
  };

  const handleDelete = (id: string) => {
    const updated = installers.filter((inst) => inst.id !== id);
    setInstallers(updated);
    saveInstallers(updated);
  };

  const handleVote = (id: string, dir: "up" | "down") => {
    const current = votes[id] ?? { up: 0, down: 0 };
    const updated = { ...current, [dir]: current[dir] + 1 };
    saveVotes(id, updated);
    setVotes((v) => ({ ...v, [id]: updated }));
    // Re-sort
    setInstallers((prev) =>
      [...prev].sort((a, b) => {
        const va = votes[a.id] ?? { up: 0, down: 0 };
        const vb = votes[b.id] ?? { up: 0, down: 0 };
        return (dir === "up" && b.id === id ? updated.up : vb.up) - va.up;
      }),
    );
    toast.success(dir === "up" ? "Upvoted!" : "Downvoted");
  };

  const getBadge = (id: string) => {
    const v = votes[id] ?? { up: 0, down: 0 };
    if (v.up >= 10) return "verified";
    if (v.up >= 5 && v.up > v.down) return "top";
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <button
        type="button"
        data-ocid="map.installers.toggle"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            👷 Find Antenna Installer
          </span>
          <span className="text-xs text-muted-foreground">
            {installers.length} listed
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Connect with local installers for professional antenna setup.
          </p>

          {/* Add installer form */}
          <div className="bg-secondary/30 rounded-xl p-3 space-y-3 border border-border/50">
            <p className="text-xs font-semibold text-foreground">
              List yourself as an installer
            </p>
            <div>
              <Label className="text-xs text-muted-foreground">Your Name</Label>
              <Input
                data-ocid="map.installers.name.input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Lokiru"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Phone Number
              </Label>
              <Input
                data-ocid="map.installers.phone.input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +256 775 123456"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Service Area
              </Label>
              <Input
                data-ocid="map.installers.area.input"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Moroto Town, Kosiroi"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <Button
              data-ocid="map.installers.submit_button"
              className="btn-airtel w-full h-10 text-sm font-bold"
              onClick={handleSubmit}
            >
              Add to Directory
            </Button>
          </div>

          {/* Installer list */}
          {installers.length === 0 ? (
            <p
              data-ocid="map.installers.empty_state"
              className="text-xs text-muted-foreground text-center py-3"
            >
              No installers listed yet.
            </p>
          ) : (
            <div className="space-y-2">
              {installers.map((inst, idx) => {
                const v = votes[inst.id] ?? { up: 0, down: 0 };
                const badge = getBadge(inst.id);
                return (
                  <div
                    key={inst.id}
                    data-ocid={`map.installers.item.${idx + 1}`}
                    className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm">👷</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">
                          {inst.name}
                        </p>
                        {badge === "verified" && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200">
                            ✅ Verified
                          </Badge>
                        )}
                        {badge === "top" && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-yellow-50 text-yellow-600 border-yellow-200">
                            ⭐ Top Rated
                          </Badge>
                        )}
                      </div>
                      <a
                        href={`tel:${inst.phone}`}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {inst.phone}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        {inst.area}
                      </p>

                      {/* Feature V10-10: Vote buttons */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          data-ocid={`map.installers.thumbsup.button.${idx + 1}`}
                          onClick={() => handleVote(inst.id, "up")}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-signal-green transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{v.up}</span>
                        </button>
                        <button
                          type="button"
                          data-ocid={`map.installers.thumbsdown.button.${idx + 1}`}
                          onClick={() => handleVote(inst.id, "down")}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          <span>{v.down}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {inst.dateAdded}
                      </span>
                      <button
                        type="button"
                        data-ocid={`map.installers.delete_button.${idx + 1}`}
                        onClick={() => handleDelete(inst.id)}
                        className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
