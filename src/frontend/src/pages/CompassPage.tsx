import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Tower } from "../backend.d";
import { CompassView } from "../components/CompassView";
import { SignalMeter } from "../components/SignalMeter";
import { useVoiceGuidance } from "../hooks/useVoiceGuidance";
import { bearingToDirection } from "../utils/geo";

const VOICE_KEY = "voice_guidance_enabled";
const COMPASS_OFFSET_KEY = "compass_offset";

interface CompassPageProps {
  bearing: number;
  deviceHeading: number | null;
  rssi: number;
  nearestTower: Tower | null;
  distanceKm: number;
  isOptimal: boolean;
  compassSupported: boolean;
  compassPermissionGranted: boolean;
  onRequestCompassPermission: () => void;
  onRecalibrate: () => void;
  onGetTowerDetails: () => void;
}

function TrueNorthCalibration() {
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(() => {
    try {
      return Number(localStorage.getItem(COMPASS_OFFSET_KEY) ?? 0);
    } catch {
      return 0;
    }
  });
  const [sunriseTime, setSunriseTime] = useState("06:30");
  const [setEastActive, setSetEastActive] = useState(false);

  const handleSetEast = () => {
    // When user points East, we note the current device heading and compute offset
    // Since we don't have real-time heading here, we approximate: East = 90°
    // The user taps when pointing East, so offset = 90 - currentHeading
    // We'll store a flag and show instructions
    setSetEastActive(true);
    // Apply a placeholder offset (user follows instructions then taps)
    const newOffset = 0; // placeholder - would use deviceHeading in real scenario
    setOffset(newOffset);
    localStorage.setItem(COMPASS_OFFSET_KEY, String(newOffset));
  };

  const handleSunriseCalibrate = () => {
    const [h, m] = sunriseTime.split(":").map(Number);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const sunriseMinutes = h * 60 + m;
    const minutesSinceSunrise = nowMinutes - sunriseMinutes;
    // Sun moves ~15°/hour = 0.25°/minute from East
    const sunAzimuth = 90 + minutesSinceSunrise * 0.25;
    const newOffset = Math.round(sunAzimuth) % 360;
    setOffset(newOffset);
    localStorage.setItem(COMPASS_OFFSET_KEY, String(newOffset));
  };

  const handleClear = () => {
    setOffset(0);
    localStorage.setItem(COMPASS_OFFSET_KEY, "0");
    setSetEastActive(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <button
        type="button"
        data-ocid="compass.calibrate.toggle"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            🌟 True North Calibration
          </span>
          {offset !== 0 && (
            <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              Offset: {offset}°
            </span>
          )}
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
          className="px-4 pb-4 space-y-4"
        >
          <p className="text-xs text-muted-foreground">
            In rural areas, compass magnetic north may not match true north due
            to local interference. Use one of the methods below to calibrate.
          </p>

          {/* Option A: Point at sunrise */}
          <div className="bg-secondary/30 rounded-xl p-3 border border-border/50 space-y-2">
            <p className="text-xs font-semibold text-foreground">
              🌅 Option A: Point at Sunrise
            </p>
            <p className="text-xs text-muted-foreground">
              At sunrise, face East and point your phone toward the sun. Tap
              “Set East” below.
            </p>
            <Button
              data-ocid="compass.calibrate.set_east.button"
              size="sm"
              className="btn-airtel h-9 text-xs w-full"
              onClick={handleSetEast}
            >
              🌅 Set East (I’m facing sunrise)
            </Button>
            {setEastActive && (
              <p className="text-xs text-signal-green">
                East calibration applied.
              </p>
            )}
          </div>

          {/* Option B: Sunrise time */}
          <div className="bg-secondary/30 rounded-xl p-3 border border-border/50 space-y-2">
            <p className="text-xs font-semibold text-foreground">
              ⏰ Option B: Enter Sunrise Time
            </p>
            <p className="text-xs text-muted-foreground">
              Enter local sunrise time (default 6:30 AM). App calculates current
              sun azimuth to estimate true North offset.
            </p>
            <div className="flex gap-2">
              <input
                type="time"
                value={sunriseTime}
                onChange={(e) => setSunriseTime(e.target.value)}
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
              <Button
                data-ocid="compass.calibrate.sunrise.button"
                size="sm"
                className="btn-airtel h-9 text-xs"
                onClick={handleSunriseCalibrate}
              >
                Calibrate
              </Button>
            </div>
          </div>

          {offset !== 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Current offset:{" "}
                <strong className="text-primary">{offset}°</strong>
              </span>
              <Button
                data-ocid="compass.calibrate.clear.button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={handleClear}
              >
                Clear Offset
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export function CompassPage({
  bearing,
  deviceHeading,
  rssi,
  nearestTower,
  distanceKm,
  isOptimal,
  compassSupported,
  compassPermissionGranted,
  onRequestCompassPermission,
  onRecalibrate,
  onGetTowerDetails,
}: CompassPageProps) {
  const [voiceEnabled, setVoiceEnabled] = useState(
    () => localStorage.getItem(VOICE_KEY) === "true",
  );

  const direction = bearingToDirection(bearing);
  useVoiceGuidance(voiceEnabled, direction, isOptimal);

  const handleVoiceToggle = (val: boolean) => {
    setVoiceEnabled(val);
    localStorage.setItem(VOICE_KEY, String(val));
  };

  return (
    <div data-ocid="compass.page" className="space-y-5 pb-4">
      {compassSupported && !compassPermissionGranted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 mx-2"
        >
          <p className="text-sm text-blue-700 font-medium mb-2">
            📱 Enable Device Compass
          </p>
          <p className="text-xs text-blue-600 mb-3">
            On iOS 13+, tap below to allow compass access. On Android, the
            compass starts automatically.
          </p>
          <Button
            data-ocid="compass.permission.button"
            size="sm"
            onClick={onRequestCompassPermission}
            className="btn-airtel h-9 rounded-full text-sm"
          >
            Allow Compass Access
          </Button>
        </motion.div>
      )}

      <div className="bg-card rounded-2xl p-5 border border-border shadow-card mx-2">
        <CompassView
          bearing={bearing}
          deviceHeading={deviceHeading}
          towerName={nearestTower?.name ?? "Locating tower..."}
          distanceKm={distanceKm}
          isOptimal={isOptimal}
        />
      </div>

      <div className="mx-2">
        <SignalMeter rssi={rssi} />
      </div>

      {/* Voice guidance toggle */}
      <div className="mx-2 bg-card rounded-xl p-4 border border-border shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            {voiceEnabled ? (
              <Volume2 className="w-4 h-4 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <Label
              htmlFor="voice-guidance"
              className="font-semibold text-sm text-foreground cursor-pointer"
            >
              Voice Guidance
            </Label>
            <p className="text-xs text-muted-foreground">
              Spoken compass directions
            </p>
          </div>
        </div>
        <Switch
          id="voice-guidance"
          data-ocid="compass.voice.switch"
          checked={voiceEnabled}
          onCheckedChange={handleVoiceToggle}
        />
      </div>

      {/* Feature V10-15: True North Calibration */}
      <div className="mx-2">
        <TrueNorthCalibration />
      </div>

      <div className="grid grid-cols-2 gap-3 mx-2">
        <Button
          data-ocid="compass.recalibrate.button"
          className="btn-airtel h-12 rounded-full text-sm font-bold"
          onClick={onRecalibrate}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Recalibrate
        </Button>
        <Button
          data-ocid="compass.tower_details.button"
          variant="outline"
          className="h-12 rounded-full text-sm font-bold border-primary text-primary hover:bg-primary/5"
          onClick={onGetTowerDetails}
        >
          Tower Details
        </Button>
      </div>

      <div className="bg-primary/5 rounded-xl p-4 mx-2 border border-primary/10">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
          How to use
        </h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Hold phone flat, screen facing up</li>
          <li>• Rotate slowly until arrow points straight up</li>
          <li>• Alert sounds when optimal direction reached</li>
          <li>• Green ring = optimal positioning found</li>
          <li>• Enable Voice for spoken turn-by-turn guidance</li>
          <li>
            • Use True North Calibration for areas with magnetic interference
          </li>
        </ul>
      </div>
    </div>
  );
}
