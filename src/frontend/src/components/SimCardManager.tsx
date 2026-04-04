import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, CreditCard, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const SIM_KEY = "sim_cards";

interface SimData {
  slot: 1 | 2;
  carrier: string;
  number: string;
  expiryDate: string;
  bundleName: string;
  mbRemaining: number;
}

type SimStore = { [slot: number]: SimData };

function loadSims(): SimStore {
  try {
    const s = localStorage.getItem(SIM_KEY);
    return s ? (JSON.parse(s) as SimStore) : {};
  } catch {
    return {};
  }
}

function saveSims(data: SimStore) {
  localStorage.setItem(SIM_KEY, JSON.stringify(data));
}

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const now = Date.now();
  const expiry = new Date(dateStr).getTime();
  return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
}

function SimSlotCard({
  slot,
  sim,
  onSave,
}: { slot: 1 | 2; sim?: SimData; onSave: (s: SimData) => void }) {
  const [editing, setEditing] = useState(!sim);
  const [carrier, setCarrier] = useState(sim?.carrier ?? "Airtel");
  const [number, setNumber] = useState(sim?.number ?? "");
  const [expiryDate, setExpiryDate] = useState(sim?.expiryDate ?? "");
  const [bundleName, setBundleName] = useState(sim?.bundleName ?? "");
  const [mbRemaining, setMbRemaining] = useState(
    String(sim?.mbRemaining ?? ""),
  );

  const days = daysUntil(sim?.expiryDate ?? "");
  const expiryClass =
    days === null
      ? ""
      : days < 0
        ? "text-destructive"
        : days <= 3
          ? "text-yellow-500"
          : "text-signal-green";

  const handleSave = () => {
    onSave({
      slot,
      carrier: carrier || "Airtel",
      number,
      expiryDate,
      bundleName,
      mbRemaining: Number(mbRemaining) || 0,
    });
    setEditing(false);
    toast.success(`SIM ${slot} saved`);
  };

  return (
    <div
      className={`rounded-xl border p-3 ${
        days !== null && days < 0
          ? "bg-destructive/5 border-destructive/20"
          : days !== null && days <= 3
            ? "bg-yellow-50 border-yellow-200"
            : "bg-secondary/30 border-border/50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">SIM {slot}</span>
          {sim && (
            <span className="text-xs text-muted-foreground">{sim.carrier}</span>
          )}
        </div>
        {sim && (
          <button
            type="button"
            onClick={() => setEditing((o) => !o)}
            className="text-xs text-primary hover:underline"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      {!editing && sim ? (
        <div className="space-y-1">
          <p className="text-xs text-foreground font-medium">
            {sim.number || "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {sim.bundleName || "No bundle"}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {sim.mbRemaining} MB left
            </span>
            {days !== null && (
              <span className={`text-xs font-bold ${expiryClass}`}>
                {days < 0
                  ? "Expired"
                  : days === 0
                    ? "Expires today"
                    : `${days}d left`}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Carrier</Label>
              <Input
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="h-8 text-xs mt-0.5"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Phone Number
              </Label>
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="h-8 text-xs mt-0.5"
                placeholder="+256..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">
                Bundle Name
              </Label>
              <Input
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                className="h-8 text-xs mt-0.5"
                placeholder="Daily 1GB"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                MB Remaining
              </Label>
              <Input
                type="number"
                value={mbRemaining}
                onChange={(e) => setMbRemaining(e.target.value)}
                className="h-8 text-xs mt-0.5"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Data Expiry Date
            </Label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="h-8 text-xs mt-0.5"
            />
          </div>
          <Button
            data-ocid={`home.sim${slot}.save_button`}
            className="btn-airtel w-full h-8 text-xs font-bold"
            onClick={handleSave}
          >
            Save SIM {slot}
          </Button>
        </div>
      )}
    </div>
  );
}

export function SimCardManager() {
  const [open, setOpen] = useState(false);
  const [sims, setSims] = useState<SimStore>(loadSims);

  const handleSave = (sim: SimData) => {
    const updated = { ...sims, [sim.slot]: sim };
    setSims(updated);
    saveSims(updated);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <button
        type="button"
        data-ocid="home.sim_manager.toggle"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">
            SIM Card Manager
          </span>
          <span className="text-xs text-muted-foreground">
            {Object.keys(sims).length}/2 SIMs
          </span>
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
          className="px-4 pb-4 space-y-3"
        >
          <SimSlotCard slot={1} sim={sims[1]} onSave={handleSave} />
          <SimSlotCard slot={2} sim={sims[2]} onSave={handleSave} />
          <Button
            data-ocid="home.sim_manager.refresh_button"
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() =>
              toast.info("Check your phone settings for latest balance")
            }
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh Balance Info
          </Button>
        </motion.div>
      )}
    </div>
  );
}
