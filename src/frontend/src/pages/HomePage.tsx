import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BatteryLow, MapPin, Navigation, Radio, Wifi } from "lucide-react";
import { motion } from "motion/react";
import type { Tower } from "../backend.d";
import { SignalMeter } from "../components/SignalMeter";
import { SpeedTestBanner } from "../components/SpeedTestBanner";
import { WifiStabilizer } from "../components/WifiStabilizer";
import { getSignalQuality } from "../utils/geo";

interface HomePageProps {
  rssi: number;
  nearestTower: Tower | null;
  distanceKm: number;
  onNavigate: (tab: string) => void;
  gpsStatus: string;
  batterySaver: boolean;
  onBatterySaverChange: (val: boolean) => void;
}

function FixGPSBanner({ gpsStatus }: { gpsStatus: string }) {
  const isDenied = gpsStatus === "denied";

  function handleFixGPS() {
    // On Android Chrome/Firefox the only way to reset a blocked permission
    // is through the browser's site-settings page. We open the relevant
    // help page which walks users through the exact steps.
    const ua = navigator.userAgent.toLowerCase();
    let url = "https://support.google.com/chrome/answer/142065"; // Chrome default
    if (ua.includes("firefox")) {
      url =
        "https://support.mozilla.org/kb/firefox-android-location-permissions";
    } else if (ua.includes("samsung")) {
      url = "https://support.google.com/chrome/answer/142065"; // Samsung Internet uses same flow
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mx-2 rounded-xl p-3 text-sm border ${
        isDenied
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : "bg-yellow-50 text-yellow-700 border-yellow-200"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-base mt-0.5">{isDenied ? "⚠️" : "📍"}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold leading-snug">
            {isDenied
              ? "GPS access denied"
              : gpsStatus === "requesting"
                ? "Requesting GPS location..."
                : gpsStatus === "fallback"
                  ? "GPS error — using fallback"
                  : "GPS unavailable"}
          </p>
          <p className="text-xs mt-0.5 opacity-80">
            {isDenied
              ? 'Using Moroto fallback. Tap "Fix GPS" to allow location in browser settings.'
              : "Using Moroto Town as fallback location."}
          </p>

          {isDenied && (
            <div className="mt-2 space-y-1.5">
              <p className="text-xs font-medium opacity-90">Quick steps:</p>
              <ol className="text-xs opacity-80 list-decimal list-inside space-y-0.5">
                <li>Tap the 🔒 lock icon in your browser address bar</li>
                <li>
                  Tap <strong>Site settings</strong> → <strong>Location</strong>
                </li>
                <li>
                  Change to <strong>Allow</strong>, then reload this page
                </li>
              </ol>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-8 text-xs font-semibold border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={handleFixGPS}
              >
                📖 View GPS Fix Guide
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function HomePage({
  rssi,
  nearestTower,
  distanceKm,
  onNavigate,
  gpsStatus,
  batterySaver,
  onBatterySaverChange,
}: HomePageProps) {
  const quality = getSignalQuality(rssi);
  const qualityText = {
    strong: {
      label: "Strong Signal",
      icon: "✅",
      desc: "Excellent positioning for antenna install",
    },
    moderate: {
      label: "Moderate Signal",
      icon: "⚠️",
      desc: "Can be improved — follow guidance",
    },
    weak: {
      label: "Weak Signal",
      icon: "❌",
      desc: "Move higher or adjust direction",
    },
  }[quality];

  return (
    <div data-ocid="home.page" className="space-y-4">
      {/* Speed Test Banner — always visible at top */}
      <SpeedTestBanner />

      {/* WiFi Stabilizer — collapsible */}
      <WifiStabilizer />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8 px-4"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-compass">
            <Radio className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-foreground leading-tight mb-3">
          Find the Best
          <br />
          <span className="text-primary">Airtel Signal</span>
        </h1>
        <p className="text-muted-foreground text-base max-w-sm mx-auto mb-6">
          GPS-guided antenna positioning for Moroto &amp; Kosiroi, Uganda. Find
          the strongest Airtel 4G signal direction in seconds.
        </p>
        <Button
          data-ocid="home.start.primary_button"
          className="btn-airtel h-14 px-10 text-lg font-bold rounded-full shadow-compass"
          onClick={() => onNavigate("compass")}
        >
          <Navigation className="w-5 h-5 mr-2" />
          Start Signal Guide
        </Button>
      </motion.div>

      {/* GPS status banner with fix guide */}
      {gpsStatus !== "granted" && <FixGPSBanner gpsStatus={gpsStatus} />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-card rounded-2xl p-4 border border-border shadow-card mx-2"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base text-foreground">
            Current Status
          </h2>
          <span className="text-xs text-muted-foreground">Live estimate</span>
        </div>

        <div className="flex items-start gap-4">
          <div
            className={`flex-1 rounded-xl p-3 text-center ${
              quality === "strong"
                ? "bg-signal-green/10 border border-signal-green/20"
                : quality === "moderate"
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-destructive/10 border border-destructive/20"
            }`}
          >
            <div className="text-2xl mb-1">{qualityText.icon}</div>
            <div
              className={`text-xs font-bold ${
                quality === "strong"
                  ? "text-signal-green"
                  : quality === "moderate"
                    ? "text-yellow-600"
                    : "text-destructive"
              }`}
            >
              {qualityText.label}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {qualityText.desc}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="text-sm">
              <p className="text-xs text-muted-foreground">Nearest Tower</p>
              <p className="font-semibold text-foreground text-sm leading-tight">
                {nearestTower?.name ?? "Locating..."}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="font-semibold text-foreground">
                {distanceKm.toFixed(1)} km
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <SignalMeter rssi={rssi} />
        </div>
      </motion.div>

      {/* Battery Saver Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mx-2 bg-card rounded-xl p-4 border border-border shadow-xs flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <BatteryLow className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <Label
              htmlFor="battery-saver"
              className="font-semibold text-sm text-foreground cursor-pointer"
            >
              Battery Saver
            </Label>
            <p className="text-xs text-muted-foreground">
              Reduces GPS polling for longer battery life
            </p>
          </div>
        </div>
        <Switch
          id="battery-saver"
          data-ocid="home.battery_saver.switch"
          checked={batterySaver}
          onCheckedChange={onBatterySaverChange}
        />
      </motion.div>

      <div className="grid grid-cols-3 gap-3 mx-2 pb-4">
        {[
          {
            tab: "compass",
            icon: Navigation,
            label: "Compass",
            color: "bg-primary/10 text-primary",
          },
          {
            tab: "map",
            icon: MapPin,
            label: "Tower Map",
            color: "bg-blue-50 text-blue-600",
          },
          {
            tab: "guidance",
            icon: Wifi,
            label: "Guidance",
            color: "bg-signal-green/10 text-signal-green",
          },
        ].map(({ tab, icon: Icon, label, color }) => (
          <motion.button
            key={tab}
            type="button"
            data-ocid={`home.${tab}.secondary_button`}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(tab)}
            className={`${color} rounded-xl p-3 flex flex-col items-center gap-1.5 min-h-[72px] border border-border/50 font-medium text-xs`}
          >
            <Icon className="w-6 h-6" />
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
