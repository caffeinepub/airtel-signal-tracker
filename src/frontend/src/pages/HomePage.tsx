import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  BatteryLow,
  MapPin,
  Moon,
  Navigation,
  Radio,
  Sun,
  Type,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type { Tower } from "../backend.d";
import { AchievementBadges } from "../components/AchievementBadges";
import { ApnAutoDetect } from "../components/ApnAutoDetect";
import { AutoBandLockingGuide } from "../components/AutoBandLockingGuide";
import { BandSteeringAdvisor } from "../components/BandSteeringAdvisor";
import { BatteryDrainMonitor } from "../components/BatteryDrainMonitor";
import { DataUsageTracker } from "../components/DataUsageTracker";
import { DopplerEffectDetector } from "../components/DopplerEffectDetector";
import { ElderModeView } from "../components/ElderModeView";
import { FrequencyBandCard } from "../components/FrequencyBandCard";
import { GPSAccuracyLogger } from "../components/GPSAccuracyLogger";
import { InterferenceDetector } from "../components/InterferenceDetector";
import { MultiTowerComparison } from "../components/MultiTowerComparison";
import { NetworkJitterMeter } from "../components/NetworkJitterMeter";
import { PacketLossDetector } from "../components/PacketLossDetector";
import { RAMUsageMonitor } from "../components/RAMUsageMonitor";
import { ScreenBrightnessOptimizer } from "../components/ScreenBrightnessOptimizer";
import { SignalDegradationTimer } from "../components/SignalDegradationTimer";
import { SignalForecastEngine } from "../components/SignalForecastEngine";
import { SignalHunterScore } from "../components/SignalHunterScore";
import { SignalMeter } from "../components/SignalMeter";
import { SignalStabilityCard } from "../components/SignalStabilityCard";
import { SignalToNoiseRatio } from "../components/SignalToNoiseRatio";
import { SimCardManager } from "../components/SimCardManager";
import { SpeedTestBanner } from "../components/SpeedTestBanner";
import { StorageHealthChecker } from "../components/StorageHealthChecker";
import { ThermalWarningIndicator } from "../components/ThermalWarningIndicator";
import { ThroughputGraph } from "../components/ThroughputGraph";
import { TowerCongestionIndicator } from "../components/TowerCongestionIndicator";
import { TowerHealthScore } from "../components/TowerHealthScore";
import { WifiStabilizer } from "../components/WifiStabilizer";
import type { GPSPosition } from "../hooks/useGPS";
import { getSignalQuality } from "../utils/geo";
import type { LangCode } from "../utils/i18n";
import { t } from "../utils/i18n";

interface HomePageProps {
  rssi: number;
  nearestTower: Tower | null;
  distanceKm: number;
  onNavigate: (tab: string) => void;
  gpsStatus: string;
  batterySaver: boolean;
  onBatterySaverChange: (val: boolean) => void;
  isOnline: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  userPosition: GPSPosition;
  lowBandwidth: boolean;
  onLowBandwidthChange: (val: boolean) => void;
  largeText: boolean;
  onLargeTextChange: (val: boolean) => void;
  lang: LangCode;
  towers?: Tower[];
  elderMode?: boolean;
  onElderModeChange?: (val: boolean) => void;
}

function FixGPSBanner({ gpsStatus }: { gpsStatus: string }) {
  const isDenied = gpsStatus === "denied";

  function handleFixGPS() {
    const ua = navigator.userAgent.toLowerCase();
    let url = "https://support.google.com/chrome/answer/142065";
    if (ua.includes("firefox")) {
      url =
        "https://support.mozilla.org/kb/firefox-android-location-permissions";
    } else if (ua.includes("samsung")) {
      url = "https://support.google.com/chrome/answer/142065";
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

function OfflineSmsBanner({
  nearestTower,
  userPosition,
}: {
  nearestTower: Tower | null;
  userPosition: GPSPosition;
}) {
  const handleSendSms = () => {
    const towerName = nearestTower?.name ?? "Unknown Tower";
    const lat = userPosition.latitude.toFixed(4);
    const lon = userPosition.longitude.toFixed(4);
    const body = `Signal+issue+at+lat+${lat}+lon+${lon}+Tower+${encodeURIComponent(towerName)}`;
    window.location.href = `sms:+256700000000?body=${body}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-2 rounded-xl p-3 border bg-destructive/10 border-destructive/20"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">📵</span>
        <p className="text-sm font-semibold text-destructive">
          You're offline — using cached data
        </p>
      </div>
      <Button
        data-ocid="home.sms_fallback.button"
        size="sm"
        variant="outline"
        className="h-9 text-xs font-bold border-destructive/40 text-destructive hover:bg-destructive/10 w-full"
        onClick={handleSendSms}
      >
        💬 Send SMS to Airtel Support
      </Button>
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
  isOnline,
  isDarkMode,
  onToggleDarkMode,
  userPosition,
  lowBandwidth,
  onLowBandwidthChange,
  largeText,
  onLargeTextChange,
  lang,
  towers = [],
  elderMode = false,
  onElderModeChange,
}: HomePageProps) {
  // Elder Mode: simplified 3-button layout
  if (elderMode) {
    return <ElderModeView onNavigate={onNavigate} />;
  }

  const quality = getSignalQuality(rssi);
  const qualityText = {
    strong: {
      label: t("Strong Signal", lang),
      icon: "✅",
      desc: "Excellent positioning for antenna install",
    },
    moderate: {
      label: t("Moderate Signal", lang),
      icon: "⚠️",
      desc: "Can be improved — follow guidance",
    },
    weak: {
      label: t("Weak Signal", lang),
      icon: "❌",
      desc: "Move higher or adjust direction",
    },
  }[quality];

  return (
    <div data-ocid="home.page" className="space-y-4">
      {/* Speed Test Banner — always visible at top */}
      {!lowBandwidth && <SpeedTestBanner />}

      {/* WiFi Stabilizer — collapsible */}
      <WifiStabilizer />

      {/* Offline SMS banner */}
      {!isOnline && (
        <OfflineSmsBanner
          nearestTower={nearestTower}
          userPosition={userPosition}
        />
      )}

      {/* Data Usage Tracker */}
      <div className="mx-2">
        <DataUsageTracker />
      </div>

      {!lowBandwidth ? (
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
            {t("Find the Best", lang) === "Find the Best" ? (
              <>
                Find the Best
                <br />
                <span className="text-primary">Airtel Signal</span>
              </>
            ) : (
              <>{t("Find the Best Airtel Signal", lang)}</>
            )}
          </h1>
          <p className="text-muted-foreground text-base max-w-sm mx-auto mb-6">
            GPS-guided antenna positioning for Moroto &amp; Kosiroi, Uganda.
            Find the strongest Airtel 4G signal direction in seconds.
          </p>
          <Button
            data-ocid="home.start.primary_button"
            className="btn-airtel h-14 px-10 text-lg font-bold rounded-full shadow-compass"
            onClick={() => onNavigate("compass")}
          >
            <Navigation className="w-5 h-5 mr-2" />
            {t("Start Signal Guide", lang)}
          </Button>
        </motion.div>
      ) : (
        <div className="text-center py-6 px-4">
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {t("Find the Best Airtel Signal", lang)}
          </h1>
          <Button
            data-ocid="home.start.primary_button"
            className="btn-airtel h-14 px-10 text-lg font-bold rounded-full"
            onClick={() => onNavigate("compass")}
          >
            <Navigation className="w-5 h-5 mr-2" />
            {t("Start Signal Guide", lang)}
          </Button>
        </div>
      )}

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
            {t("Current Status", lang)}
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
              <p className="text-xs text-muted-foreground">
                {t("Nearest Tower", lang)}
              </p>
              <p className="font-semibold text-foreground text-sm leading-tight">
                {nearestTower?.name ?? t("Loading...", lang)}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-xs text-muted-foreground">
                {t("Distance", lang)}
              </p>
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

      {/* Feature V11-1: Multi-tower comparison */}
      {towers.length > 0 && (
        <div className="mx-2">
          <MultiTowerComparison towers={towers} userPosition={userPosition} />
        </div>
      )}

      {/* Feature V11-2: Signal Degradation Timer */}
      <div className="mx-2">
        <SignalDegradationTimer rssi={rssi} />
      </div>

      {/* Feature V11-3: Band Steering Advisor */}
      <div className="mx-2">
        <BandSteeringAdvisor />
      </div>

      {/* Feature V11-4: Packet Loss Detector */}
      <div className="mx-2">
        <PacketLossDetector rssi={rssi} />
      </div>

      {/* Feature V11-5: Network Jitter Meter */}
      <div className="mx-2">
        <NetworkJitterMeter rssi={rssi} />
      </div>

      {/* Feature V11-6: Signal-to-Noise Ratio */}
      <div className="mx-2">
        <SignalToNoiseRatio rssi={rssi} />
      </div>

      {/* Feature V11-7: Doppler Effect Detector */}
      <div className="mx-2">
        <DopplerEffectDetector userPosition={userPosition} />
      </div>

      {/* Feature V11-8: Auto Band Locking Guide */}
      <div className="mx-2">
        <AutoBandLockingGuide />
      </div>

      {/* Feature V11-9: Tower Congestion Indicator */}
      {towers.length > 0 && (
        <div className="mx-2">
          <TowerCongestionIndicator
            towers={towers}
            userPosition={userPosition}
          />
        </div>
      )}

      {/* Feature V11-10: Throughput Graph */}
      <div className="mx-2">
        <ThroughputGraph rssi={rssi} />
      </div>

      {/* Feature V10-1: Signal Forecast Engine */}
      <div className="mx-2">
        <SignalForecastEngine currentRssi={rssi} />
      </div>

      {/* Feature V10-2: Tower Health Score */}
      <div className="mx-2">
        <TowerHealthScore tower={nearestTower} distanceKm={distanceKm} />
      </div>

      {/* Feature: Frequency Band Detector */}
      <div className="mx-2">
        <FrequencyBandCard distanceKm={distanceKm} />
      </div>

      {/* Feature: Signal Stability Score */}
      <div className="mx-2">
        <SignalStabilityCard rssi={rssi} />
      </div>

      {/* Feature V11-44: RAM Usage Monitor */}
      <div className="mx-2">
        <RAMUsageMonitor />
      </div>

      {/* Feature V11-45: Storage Health Checker */}
      <div className="mx-2">
        <StorageHealthChecker />
      </div>

      {/* Feature V11-46: GPS Accuracy Logger */}
      <div className="mx-2">
        <GPSAccuracyLogger userPosition={userPosition} />
      </div>

      {/* Feature V11-47: Screen Brightness Optimizer */}
      <div className="mx-2">
        <ScreenBrightnessOptimizer />
      </div>

      {/* Feature V11-48: Thermal Warning Indicator */}
      <div className="mx-2">
        <ThermalWarningIndicator />
      </div>

      {/* Feature V10-16: Battery Drain Monitor */}
      <div className="mx-2">
        <BatteryDrainMonitor />
      </div>

      {/* Feature V10-18: APN Auto-Detect */}
      <div className="mx-2">
        <ApnAutoDetect />
      </div>

      {/* Feature V10-9: SIM Card Manager */}
      <div className="mx-2">
        <SimCardManager />
      </div>

      {/* Feature V10-3: Interference Detector */}
      <div className="mx-2">
        <InterferenceDetector />
      </div>

      {/* Feature V10-19: Signal Hunter Score */}
      <div className="mx-2">
        <SignalHunterScore />
      </div>

      {/* Feature V10-20: Achievement Badges */}
      <div className="mx-2">
        <AchievementBadges />
      </div>

      {/* Settings: Battery Saver + Night Mode + Low-BW + Large Text + Elder Mode */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mx-2 bg-card rounded-xl p-4 border border-border shadow-xs space-y-3"
      >
        {/* Battery Saver */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <BatteryLow className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <Label
                htmlFor="battery-saver"
                className="font-semibold text-sm text-foreground cursor-pointer"
              >
                {t("Battery Saver", lang)}
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
        </div>

        {/* Night Mode */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              {isDarkMode ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <Label
                htmlFor="night-mode"
                className="font-semibold text-sm text-foreground cursor-pointer"
              >
                {t("Night Mode", lang)}
              </Label>
              <p className="text-xs text-muted-foreground">
                Dark theme for low-light environments
              </p>
            </div>
          </div>
          <Switch
            id="night-mode"
            data-ocid="home.night_mode.switch"
            checked={isDarkMode}
            onCheckedChange={onToggleDarkMode}
          />
        </div>

        {/* Low-Bandwidth */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <Label
                htmlFor="low-bandwidth"
                className="font-semibold text-sm text-foreground cursor-pointer"
              >
                📡 Low-Bandwidth Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Strips animations for 2G / slow connections
              </p>
            </div>
          </div>
          <Switch
            id="low-bandwidth"
            data-ocid="home.low_bandwidth.switch"
            checked={lowBandwidth}
            onCheckedChange={onLowBandwidthChange}
          />
        </div>

        {/* Large Text */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Type className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <Label
                htmlFor="large-text"
                className="font-semibold text-sm text-foreground cursor-pointer"
              >
                🔤 Large Text
              </Label>
              <p className="text-xs text-muted-foreground">
                Increases font size for easier reading
              </p>
            </div>
          </div>
          <Switch
            id="large-text"
            data-ocid="home.large_text.switch"
            checked={largeText}
            onCheckedChange={onLargeTextChange}
          />
        </div>

        {/* V11-50: Elder Mode */}
        {onElderModeChange && (
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <Label
                  htmlFor="elder-mode"
                  className="font-semibold text-sm text-foreground cursor-pointer"
                >
                  👴 {t("Elder Mode", lang)}
                </Label>
                <p className="text-xs text-muted-foreground">
                  Simplified 3-button interface for easy use
                </p>
              </div>
            </div>
            <Switch
              id="elder-mode"
              data-ocid="home.elder_mode.switch"
              checked={elderMode}
              onCheckedChange={onElderModeChange}
            />
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-3 gap-3 mx-2 pb-4">
        {[
          {
            tab: "compass",
            icon: Navigation,
            label: t("Compass", lang),
            color: "bg-primary/10 text-primary",
          },
          {
            tab: "map",
            icon: MapPin,
            label: t("Tower Map", lang),
            color: "bg-blue-50 text-blue-600",
          },
          {
            tab: "guidance",
            icon: Wifi,
            label: t("Guidance", lang),
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
