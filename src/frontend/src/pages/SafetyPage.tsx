import { Badge } from "@/components/ui/badge";
import { ShieldAlert, WifiOff } from "lucide-react";
import { useState } from "react";
import { AirtelCareShortcuts } from "../components/AirtelCareShortcuts";
import { EmergencySOSBeacon } from "../components/EmergencySOSBeacon";
import { FloodWeatherAlerts } from "../components/FloodWeatherAlerts";
import { NetworkBlackoutReporter } from "../components/NetworkBlackoutReporter";
import { PowerOutageTracker } from "../components/PowerOutageTracker";

interface Props {
  rssi: number;
  userPosition: { latitude: number; longitude: number };
  isOnline: boolean;
}

export function SafetyPage({ rssi, userPosition, isOnline }: Props) {
  const [autoTriggerEnabled, setAutoTriggerEnabled] = useState(
    () => localStorage.getItem("sos_auto_trigger") === "true",
  );

  const handleToggleAutoTrigger = (val: boolean) => {
    setAutoTriggerEnabled(val);
    localStorage.setItem("sos_auto_trigger", String(val));
  };

  return (
    <div className="px-4 pb-6 space-y-4">
      {/* Page header */}
      <div className="flex items-center gap-3 pt-2">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-foreground leading-tight">
            Emergency &amp; Safety
          </h1>
          <p className="text-xs text-muted-foreground">
            Moroto district · Airtel Uganda
          </p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          {!isOnline && (
            <Badge
              variant="destructive"
              className="text-[10px] gap-1"
              data-ocid="safety.offline.error_state"
            >
              <WifiOff className="w-3 h-3" />
              Offline
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-[10px] border-muted-foreground/30 text-muted-foreground"
          >
            📴 Works offline
          </Badge>
        </div>
      </div>

      {/* 1. Airtel Care Shortcuts — most urgent, always at top */}
      <AirtelCareShortcuts />

      {/* 2. Emergency SOS Beacon */}
      <EmergencySOSBeacon
        rssi={rssi}
        userPosition={userPosition}
        autoTriggerEnabled={autoTriggerEnabled}
        onToggleAutoTrigger={handleToggleAutoTrigger}
      />

      {/* 3. Network Blackout Reporter */}
      <NetworkBlackoutReporter isOnline={isOnline} />

      {/* 4. Power Outage Signal Tracker */}
      <PowerOutageTracker />

      {/* 5. Flood / Weather Alerts */}
      <FloodWeatherAlerts />

      {/* Footer note */}
      <p className="text-center text-[10px] text-muted-foreground pt-2">
        All safety data stored locally on your device · No internet required
      </p>
    </div>
  );
}
