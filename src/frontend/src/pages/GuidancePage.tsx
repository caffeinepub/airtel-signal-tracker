import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Loader2, RotateCcw, Save } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Tower } from "../backend.d";
import { AntennaAngleCalculator } from "../components/AntennaAngleCalculator";
import { AntennaGainComparator } from "../components/AntennaGainComparator";
import { AntennaWizard } from "../components/AntennaWizard";
import { ApnResetGuide } from "../components/ApnResetGuide";
import { AzimuthElevationPlotter } from "../components/AzimuthElevationPlotter";
import { CableLossCalculator } from "../components/CableLossCalculator";
import { CoaxCableHealthChecker } from "../components/CoaxCableHealthChecker";
import { ConnectorTypeGuide } from "../components/ConnectorTypeGuide";
import { FresnelZoneCalculator } from "../components/FresnelZoneCalculator";
import { GroundingGuide } from "../components/GroundingGuide";
import { GuidancePanel } from "../components/GuidancePanel";
import { HeightOptimizer } from "../components/HeightOptimizer";
import { InstallationCostEstimator } from "../components/InstallationCostEstimator";
import { MountingAngleMemory } from "../components/MountingAngleMemory";
import { PolarizationAdvisor } from "../components/PolarizationAdvisor";
import { SavedPositions } from "../components/SavedPositions";
import { SavedProfiles } from "../components/SavedProfiles";
import { SignalBudgetPlanner } from "../components/SignalBudgetPlanner";
import { SignalPredictionCard } from "../components/SignalPredictionCard";
import { SunPositionCard } from "../components/SunPositionCard";
import { WeatherImpactCard } from "../components/WeatherImpactCard";
import { WindCard } from "../components/WindCard";
import { WindLoadEstimator } from "../components/WindLoadEstimator";
import { useActor } from "../hooks/useActor";
import type { GPSPosition } from "../hooks/useGPS";
import { useSavePosition, useSignalPositions } from "../hooks/useQueries";
import { getMountingHeightMeters } from "../utils/geo";

const CHECKLIST_KEY = "install_checklist";

const CHECKLIST_ITEMS = [
  "Choose mounting pole (3–12m height)",
  "Align antenna per compass bearing",
  "Tighten all bolts and clamps",
  "Run coaxial cable (max 10m, LMR-400 recommended)",
  "Weatherproof connections with self-amalgamating tape",
  "Ground the mast with earthing wire",
  "Connect router and test signal",
];

function loadChecklist(): boolean[] {
  try {
    const stored = localStorage.getItem(CHECKLIST_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === CHECKLIST_ITEMS.length) {
        return parsed as boolean[];
      }
    }
  } catch {
    /* ignore */
  }
  return new Array(CHECKLIST_ITEMS.length).fill(false);
}

function getHourColor(hour: number): string {
  if (
    (hour >= 6 && hour < 9) ||
    (hour >= 12 && hour < 14) ||
    (hour >= 17 && hour < 21)
  )
    return "bg-red-500";
  if ((hour >= 9 && hour < 12) || (hour >= 14 && hour < 17))
    return "bg-yellow-400";
  return "bg-signal-green";
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);

function BestTimeCard() {
  const currentHour = new Date().getHours();
  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-card">
      <h4 className="font-bold text-sm text-foreground mb-3">
        ⏰ Best Time to Connect
      </h4>
      <div className="flex gap-px overflow-hidden rounded-md">
        {HOURS.map((h) => (
          <div
            key={h}
            className={`flex-1 h-6 ${getHourColor(h)} ${h === currentHour ? "ring-2 ring-white ring-offset-1 relative z-10" : ""}`}
            title={`${h}:00`}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 mt-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-sm bg-signal-green inline-block" />{" "}
          Low
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400 inline-block" />{" "}
          Medium
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />{" "}
          High
        </span>
        <span className="text-xs text-primary font-semibold ml-auto">
          {currentHour}:00 now
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Best signal window:{" "}
        <span className="font-semibold text-signal-green">10 PM – 6 AM</span>{" "}
        (low congestion)
      </p>
    </div>
  );
}

function InstallationChecklist() {
  const [open, setOpen] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(loadChecklist);
  const completed = checks.filter(Boolean).length;
  const progress = (completed / CHECKLIST_ITEMS.length) * 100;

  const toggle = (idx: number) => {
    setChecks((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    const cleared = new Array(CHECKLIST_ITEMS.length).fill(false);
    setChecks(cleared);
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(cleared));
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <button
        type="button"
        data-ocid="guidance.checklist.toggle"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            📋 Installation Checklist
          </span>
          <span className="text-xs text-muted-foreground">
            {completed}/{CHECKLIST_ITEMS.length}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      <div className="px-4 pb-1">
        <Progress
          data-ocid="guidance.checklist.progress"
          value={progress}
          className="h-2"
        />
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 space-y-3 mt-3"
        >
          {CHECKLIST_ITEMS.map((item, idx) => (
            <div key={item} className="flex items-start gap-3">
              <Checkbox
                id={`check-${idx}`}
                data-ocid={`guidance.checklist.checkbox.${idx + 1}`}
                checked={checks[idx]}
                onCheckedChange={() => toggle(idx)}
                className="mt-0.5"
              />
              <Label
                htmlFor={`check-${idx}`}
                className={`text-sm cursor-pointer leading-snug ${checks[idx] ? "line-through text-muted-foreground" : "text-foreground"}`}
              >
                {item}
              </Label>
            </div>
          ))}
          <Button
            data-ocid="guidance.checklist.reset.button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs h-7 mt-1"
            onClick={reset}
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
        </motion.div>
      )}
    </div>
  );
}

interface GuidancePageProps {
  distanceKm: number;
  rssi: number;
  bearing: number;
  userPosition: GPSPosition;
  nearestTower?: Tower | null;
}

export function GuidancePage({
  distanceKm,
  rssi,
  bearing,
  userPosition,
  nearestTower,
}: GuidancePageProps) {
  const [isSaving, setIsSaving] = useState(false);
  const savePosition = useSavePosition();
  const { data: savedPositions = [] } = useSignalPositions();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePosition.mutateAsync({
        latitude: userPosition.latitude,
        longitude: userPosition.longitude,
        compassHeading: bearing,
        rssiDbm: rssi,
        heightRecommendation: getMountingHeightMeters(distanceKm),
        tiltAngle: 4,
      });
      toast.success("Position saved! ✅", {
        description: `Signal: ${rssi.toFixed(0)} dBm at ${bearing.toFixed(0)}°`,
      });
    } catch {
      toast.error("Failed to save position");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!actor) return;
    try {
      await actor.clearSignalPositions();
      queryClient.invalidateQueries({ queryKey: ["signal-positions"] });
      toast.success("Positions cleared");
    } catch {
      toast.error("Failed to clear positions");
    }
  };

  return (
    <div data-ocid="guidance.page" className="space-y-4 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-2"
      >
        <GuidancePanel
          distanceKm={distanceKm}
          rssi={rssi}
          bearing={bearing}
          userPosition={userPosition}
          nearestTower={nearestTower}
        />
      </motion.div>

      {/* V11-11: Polarization Advisor */}
      <div className="mx-2">
        <PolarizationAdvisor nearestTower={nearestTower} />
      </div>

      {/* V11-12: Fresnel Zone Calculator */}
      <div className="mx-2">
        <FresnelZoneCalculator />
      </div>

      {/* V11-13: Antenna Gain Comparator */}
      <div className="mx-2">
        <AntennaGainComparator rssi={rssi} />
      </div>

      {/* V11-14: Connector Type Guide */}
      <div className="mx-2">
        <ConnectorTypeGuide />
      </div>

      {/* V11-15: Mounting Angle Memory */}
      <div className="mx-2">
        <MountingAngleMemory />
      </div>

      {/* V11-16: Wind Load Estimator */}
      <div className="mx-2">
        <WindLoadEstimator />
      </div>

      {/* V11-17: Signal Budget Planner */}
      <div className="mx-2">
        <SignalBudgetPlanner />
      </div>

      {/* V11-18: Grounding Guide */}
      <div className="mx-2">
        <GroundingGuide />
      </div>

      {/* V11-19: Coax Cable Health Checker */}
      <div className="mx-2">
        <CoaxCableHealthChecker />
      </div>

      {/* V11-20: Installation Cost Estimator */}
      <div className="mx-2">
        <InstallationCostEstimator />
      </div>

      {/* Signal Prediction */}
      <div className="mx-2">
        <SignalPredictionCard />
      </div>

      {/* Best Time of Day */}
      <div className="mx-2">
        <BestTimeCard />
      </div>

      {/* Weather Impact */}
      <div className="mx-2">
        <WeatherImpactCard />
      </div>

      {/* Wind */}
      <div className="mx-2">
        <WindCard userPosition={userPosition} />
      </div>

      {/* Sun Position */}
      <div className="mx-2">
        <SunPositionCard userPosition={userPosition} antennaBearing={bearing} />
      </div>

      {/* Antenna Angle Calculator */}
      <div className="mx-2">
        <AntennaAngleCalculator />
      </div>

      {/* 3D Azimuth + Elevation Plotter */}
      <div className="mx-2">
        <AzimuthElevationPlotter bearing={bearing} distanceKm={distanceKm} />
      </div>

      {/* Cable Loss Calculator */}
      <div className="mx-2">
        <CableLossCalculator />
      </div>

      {/* Antenna Wizard */}
      <div className="mx-2">
        <AntennaWizard />
      </div>

      {/* Height Optimizer */}
      <div className="mx-2">
        <HeightOptimizer distanceKm={distanceKm} />
      </div>

      {/* APN Reset Guide */}
      <div className="mx-2">
        <ApnResetGuide />
      </div>

      <div className="mx-2">
        <Button
          data-ocid="guidance.save.primary_button"
          className="btn-airtel w-full text-base font-bold rounded-full h-14"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {isSaving ? "Saving..." : "Save Best Signal Position"}
        </Button>
      </div>

      <div className="mx-2">
        <SavedProfiles
          latitude={userPosition.latitude}
          longitude={userPosition.longitude}
          bearing={bearing}
          rssi={rssi}
        />
      </div>

      <div className="mx-2 bg-card rounded-2xl p-4 border border-border shadow-card">
        <h3 className="font-bold text-base text-foreground mb-4">
          Saved Positions
        </h3>
        <SavedPositions
          positions={savedPositions}
          onClear={handleClear}
          isClearing={false}
        />
      </div>

      <div className="mx-2">
        <InstallationChecklist />
      </div>
    </div>
  );
}
