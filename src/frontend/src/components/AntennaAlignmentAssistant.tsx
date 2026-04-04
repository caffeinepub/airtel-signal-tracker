import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Lock, Radio, Vibrate } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STRONG_SIGNAL_THRESHOLD = -65;

function calcDbm(angle: number): number {
  // Peak signal near 45°, sinusoidal variation, range -95 to -55
  const rad = ((angle - 45) * Math.PI) / 180;
  const normalized = Math.cos(rad); // -1 to 1
  return -75 + normalized * 20; // range -95 to -55
}

function getSignalColor(dbm: number): string {
  if (dbm > STRONG_SIGNAL_THRESHOLD) return "bg-green-500";
  if (dbm > -80) return "bg-yellow-400";
  return "bg-red-500";
}

function getSignalLabel(dbm: number): string {
  if (dbm > STRONG_SIGNAL_THRESHOLD) return "Excellent";
  if (dbm > -80) return "Fair";
  return "Weak";
}

export function AntennaAlignmentAssistant() {
  const [angle, setAngle] = useState([135]);
  const [lockedAngle, setLockedAngle] = useState<number | null>(() => {
    const stored = localStorage.getItem("best_antenna_angle");
    return stored ? Number(stored) : null;
  });
  const wasStrongRef = useRef(false);

  const dbm = calcDbm(angle[0]);
  const isStrong = dbm > STRONG_SIGNAL_THRESHOLD;
  const barPercent = Math.round(((dbm + 95) / 40) * 100);

  useEffect(() => {
    if (isStrong && !wasStrongRef.current) {
      if ("vibrate" in navigator) {
        navigator.vibrate(200);
      }
    }
    wasStrongRef.current = isStrong;
  }, [isStrong]);

  const handleLock = () => {
    localStorage.setItem("best_antenna_angle", String(angle[0]));
    setLockedAngle(angle[0]);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Radio className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Antenna Alignment Assistant
        </h4>
        {isStrong && (
          <Badge className="ml-auto bg-green-500 text-white text-xs animate-pulse">
            HOLD HERE ✅
          </Badge>
        )}
      </div>

      {/* dBm readout */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-foreground">
            {dbm.toFixed(1)}
            <span className="text-base font-normal text-muted-foreground ml-1">
              dBm
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {getSignalLabel(dbm)} signal
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-primary">{angle[0]}°</p>
          <p className="text-xs text-muted-foreground">rotation</p>
        </div>
      </div>

      {/* Signal strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>−95 dBm (Weak)</span>
          <span>−55 dBm (Strong)</span>
        </div>
        <div className="h-4 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ${getSignalColor(dbm)}`}
            style={{ width: `${barPercent}%` }}
          />
        </div>
      </div>

      {/* Hold here banner */}
      {isStrong && (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <Vibrate className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-xs text-green-700 dark:text-green-300 font-semibold">
            Strong signal detected! Hold the antenna at {angle[0]}° and tighten
            the mount.
          </p>
        </div>
      )}

      {/* Rotation slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-muted-foreground">
            Rotate Antenna
          </Label>
          <span className="text-xs font-bold text-foreground">{angle[0]}°</span>
        </div>
        <Slider
          data-ocid="antenna.alignment.angle.input"
          min={0}
          max={360}
          step={1}
          value={angle}
          onValueChange={setAngle}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0°</span>
          <span>90°</span>
          <span>180°</span>
          <span>270°</span>
          <span>360°</span>
        </div>
      </div>

      {/* Lock button */}
      <Button
        data-ocid="antenna.alignment.lock.button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleLock}
      >
        <Lock className="w-3 h-3 mr-2" />
        Lock Best Angle ({angle[0]}°)
      </Button>

      {lockedAngle !== null && (
        <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2">
          <Lock className="w-3 h-3 text-primary shrink-0" />
          <p className="text-xs text-primary font-semibold">
            Saved best angle: {lockedAngle}°
          </p>
        </div>
      )}
    </div>
  );
}
