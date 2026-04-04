import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const KEY = "antenna_clubs";
const MEMBERS_KEY = "club_members";

interface Club {
  name: string;
  village: string;
  created: string;
}

interface Member {
  id: string;
  name: string;
  joined: string;
}

export function CommunityAntennaClub() {
  const [club, setClub] = useState<Club | null>(() => {
    try {
      const s = localStorage.getItem(KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const s = localStorage.getItem(MEMBERS_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState({ name: "", village: "", memberName: "" });

  const createClub = () => {
    if (!form.name.trim() || !form.village.trim()) {
      toast.error("Enter club name and village");
      return;
    }
    const c: Club = {
      name: form.name.trim(),
      village: form.village.trim(),
      created: new Date().toLocaleDateString(),
    };
    setClub(c);
    localStorage.setItem(KEY, JSON.stringify(c));
    toast.success("Club created!");
  };

  const addMember = () => {
    if (!form.memberName.trim()) {
      toast.error("Enter member name");
      return;
    }
    const m: Member = {
      id: Date.now().toString(),
      name: form.memberName.trim(),
      joined: new Date().toLocaleDateString(),
    };
    const updated = [...members, m];
    setMembers(updated);
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(updated));
    setForm((f) => ({ ...f, memberName: "" }));
    toast.success("Member added");
  };

  const totalReports = Number.parseInt(
    localStorage.getItem("signal_hunter_points") ?? "0",
  );

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Community Antenna Club
        </h4>
      </div>
      {!club ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">
            Create a club to coordinate antenna installation in your village.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Club Name
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="h-8 text-xs mt-1"
                data-ocid="club.name.input"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Village
              </Label>
              <Input
                value={form.village}
                onChange={(e) =>
                  setForm((f) => ({ ...f, village: e.target.value }))
                }
                className="h-8 text-xs mt-1"
                data-ocid="club.village.input"
              />
            </div>
          </div>
          <Button
            size="sm"
            className="h-8 text-xs w-full btn-airtel"
            onClick={createClub}
            data-ocid="club.create.button"
          >
            Create Club
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-primary/5 rounded-lg p-3 mb-3">
            <p className="text-xs font-bold text-foreground">{club.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {club.village} • Since {club.created}
            </p>
            <div className="flex gap-3 mt-1">
              <span className="text-[10px] text-muted-foreground">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {totalReports} total points
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              value={form.memberName}
              onChange={(e) =>
                setForm((f) => ({ ...f, memberName: e.target.value }))
              }
              placeholder="Add member name"
              className="h-8 text-xs flex-1"
              data-ocid="club.member.input"
            />
            <Button
              size="sm"
              className="h-8 text-xs btn-airtel"
              onClick={addMember}
              data-ocid="club.add_member.button"
            >
              Add
            </Button>
          </div>
          {members.length > 0 && (
            <div className="mt-2 space-y-1 max-h-28 overflow-y-auto">
              {members.map((m, i) => (
                <div key={m.id} className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                  <span className="text-foreground">{m.name}</span>
                  <span className="text-muted-foreground ml-auto">
                    {m.joined}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
