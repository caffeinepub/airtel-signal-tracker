import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Bell, BellOff, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CONTACTS_KEY = "emergency_contacts";
const SOS_THRESHOLD_SECONDS = 1800; // 30 minutes
const CRITICAL_RSSI = -105;

interface Contact {
  id: string;
  name: string;
  phone: string;
}

function loadContacts(): Contact[] {
  try {
    const s = localStorage.getItem(CONTACTS_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

interface Props {
  rssi: number;
  userPosition: { latitude: number; longitude: number };
  autoTriggerEnabled: boolean;
  onToggleAutoTrigger: (val: boolean) => void;
}

export function EmergencySOSBeacon({
  rssi,
  userPosition,
  autoTriggerEnabled,
  onToggleAutoTrigger,
}: Props) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const [counting, setCounting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const contacts = loadContacts();

  const isCritical = rssi <= CRITICAL_RSSI;

  const sendSOS = useCallback(() => {
    const lat = userPosition.latitude.toFixed(5);
    const lon = userPosition.longitude.toFixed(5);
    const msg = encodeURIComponent(
      `EMERGENCY SOS: No signal for 30+ minutes. GPS: lat ${lat}, lon ${lon}. Please help. - Airtel Signal Tracker`,
    );
    const contactList = loadContacts();
    for (const c of contactList) {
      window.location.href = `sms:${c.phone}?body=${msg}`;
    }
    setTriggered(true);
    toast.error("🆘 SOS Sent to all emergency contacts!", { duration: 10000 });
  }, [userPosition]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsElapsed(0);
    setTriggered(false);
    setCounting(false);
  };

  useEffect(() => {
    if (!autoTriggerEnabled || !isCritical) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!isCritical) {
        setSecondsElapsed(0);
        setCounting(false);
        setTriggered(false);
      }
      return;
    }

    if (isCritical && autoTriggerEnabled && !triggered) {
      setCounting(true);
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => {
          const next = prev + 1;
          if (next >= SOS_THRESHOLD_SECONDS) {
            if (timerRef.current) clearInterval(timerRef.current);
            sendSOS();
            return SOS_THRESHOLD_SECONDS;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoTriggerEnabled, isCritical, triggered, sendSOS]);

  const remaining = SOS_THRESHOLD_SECONDS - secondsElapsed;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = (secondsElapsed / SOS_THRESHOLD_SECONDS) * 100;

  return (
    <div className="bg-card rounded-xl border border-destructive/40 shadow p-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="font-bold text-foreground text-sm">
          Emergency SOS Beacon
        </h3>
        {contacts.length === 0 && (
          <Badge
            variant="outline"
            className="ml-auto text-[10px] text-destructive border-destructive/40"
          >
            No contacts set
          </Badge>
        )}
      </div>

      {/* Current RSSI */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Current Signal</span>
        <span
          className={`font-mono font-bold ${isCritical ? "text-destructive" : "text-green-600"}`}
        >
          {rssi} dBm {isCritical ? "(Critical)" : "(OK)"}
        </span>
      </div>

      {/* Auto-trigger toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {autoTriggerEnabled ? (
            <Bell className="w-4 h-4 text-destructive" />
          ) : (
            <BellOff className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-xs font-medium">
            Auto-SOS after 30 min no signal
          </span>
        </div>
        <Switch
          checked={autoTriggerEnabled}
          onCheckedChange={onToggleAutoTrigger}
          data-ocid="safety.sos.toggle"
        />
      </div>

      {/* Triggered banner */}
      {triggered && (
        <div
          className="animate-pulse bg-destructive/10 border border-destructive rounded-lg p-3 text-center"
          data-ocid="safety.sos.success_state"
        >
          <p className="text-destructive font-bold text-sm">🆘 SOS SENT</p>
          <p className="text-destructive/80 text-xs mt-0.5">
            Emergency SMS sent to {contacts.length} contact
            {contacts.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Countdown bar */}
      {counting && !triggered && isCritical && (
        <div className="space-y-1.5" data-ocid="safety.sos.loading_state">
          <div className="flex items-center justify-between text-xs">
            <span className="text-destructive font-medium animate-pulse">
              ⚠ SOS auto-sends in
            </span>
            <span className="font-mono font-bold text-destructive">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
          </div>
          <Progress
            value={progress}
            className="h-2 [&>[role=progressbar]]:bg-destructive"
          />
        </div>
      )}

      {/* Contacts count */}
      {contacts.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {contacts.length} emergency contact{contacts.length !== 1 ? "s" : ""}{" "}
          will receive SMS
        </p>
      )}

      {/* Manual SOS + Cancel */}
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          className="flex-1 h-9 text-xs font-bold"
          onClick={sendSOS}
          disabled={contacts.length === 0}
          data-ocid="safety.sos.primary_button"
        >
          🆘 Send SOS Now
        </Button>
        {counting && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3"
            onClick={resetTimer}
            data-ocid="safety.sos.cancel_button"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {contacts.length === 0 && (
        <p className="text-[10px] text-muted-foreground text-center">
          Add emergency contacts in the Emergency Contacts section on the Home
          tab
        </p>
      )}
    </div>
  );
}
