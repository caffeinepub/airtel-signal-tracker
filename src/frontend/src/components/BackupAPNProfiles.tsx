import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const KEY = "backup_apn_profiles";

interface APNProfile {
  id: string;
  name: string;
  apn: string;
  proxy: string;
  port: string;
}

function load(): APNProfile[] {
  try {
    const s = localStorage.getItem(KEY);
    return s
      ? JSON.parse(s)
      : [
          {
            id: "1",
            name: "Airtel Uganda Default",
            apn: "internet",
            proxy: "",
            port: "",
          },
        ];
  } catch {
    return [];
  }
}

export function BackupAPNProfiles() {
  const [profiles, setProfiles] = useState<APNProfile[]>(load);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", apn: "", proxy: "", port: "" });

  const save = () => {
    if (!form.name.trim() || !form.apn.trim()) {
      toast.error("Name and APN required");
      return;
    }
    if (profiles.length >= 3) {
      toast.error("Max 3 profiles");
      return;
    }
    const p: APNProfile = { id: Date.now().toString(), ...form };
    const updated = [...profiles, p];
    setProfiles(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setForm({ name: "", apn: "", proxy: "", port: "" });
    setShowForm(false);
    toast.success("APN profile saved");
  };

  const remove = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Backup APN Profiles
        </h4>
        <span className="text-xs text-muted-foreground ml-auto">
          {profiles.length}/3
        </span>
      </div>
      {profiles.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-2 bg-secondary/40 rounded-lg p-2 mb-2"
        >
          <div className="flex-1">
            <p className="text-xs font-semibold text-foreground">{p.name}</p>
            <div className="flex gap-2 mt-0.5">
              <Badge className="text-[9px] px-1 py-0 bg-primary/10 text-primary border-primary/20">
                APN: {p.apn}
              </Badge>
              {p.proxy && (
                <Badge className="text-[9px] px-1 py-0 bg-secondary text-muted-foreground">
                  {p.proxy}:{p.port}
                </Badge>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => remove(p.id)}
            className="text-muted-foreground hover:text-destructive"
            data-ocid="apn.delete.button"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      {profiles.length < 3 && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs w-full mb-2"
          onClick={() => setShowForm((f) => !f)}
          data-ocid="apn.add.button"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Profile
        </Button>
      )}
      {showForm && (
        <div className="bg-secondary/40 rounded-lg p-3 space-y-2">
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Profile name"
            className="h-8 text-xs"
            data-ocid="apn.name.input"
          />
          <Input
            value={form.apn}
            onChange={(e) => setForm((f) => ({ ...f, apn: e.target.value }))}
            placeholder="APN (e.g. internet)"
            className="h-8 text-xs"
            data-ocid="apn.apn.input"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={form.proxy}
              onChange={(e) =>
                setForm((f) => ({ ...f, proxy: e.target.value }))
              }
              placeholder="Proxy (optional)"
              className="h-8 text-xs"
            />
            <Input
              value={form.port}
              onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))}
              placeholder="Port"
              className="h-8 text-xs"
            />
          </div>
          <Button
            size="sm"
            className="h-7 text-xs w-full btn-airtel"
            onClick={save}
            data-ocid="apn.save.button"
          >
            Save
          </Button>
        </div>
      )}
      <div className="mt-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-2">
        <p className="text-[10px] text-yellow-700 dark:text-yellow-400">
          💡 To apply: Settings → Mobile Networks → Access Point Names → Add new
          APN
        </p>
      </div>
    </div>
  );
}
