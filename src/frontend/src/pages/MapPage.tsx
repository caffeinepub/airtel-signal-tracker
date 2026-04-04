import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardCopy,
  Download,
  Loader2,
  MapPin,
  Radio,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Tower } from "../backend.d";
import { SignalQuality } from "../backend.d";
import { CommunityAntennaClub } from "../components/CommunityAntennaClub";
import { CrowdFundedTowerRequest } from "../components/CrowdFundedTowerRequest";
import { GroupSignalSurveyMode } from "../components/GroupSignalSurveyMode";
import { InstallerDirectory } from "../components/InstallerDirectory";
import { InstallerJobBoard } from "../components/InstallerJobBoard";
import { MapView, generateNearbyUsers } from "../components/MapView";
import { NeighborhoodSignalChampion } from "../components/NeighborhoodSignalChampion";
import { ObstacleMapper } from "../components/ObstacleMapper";
import { awardPoints } from "../components/SignalHunterScore";
import { SignalImprovementTracker } from "../components/SignalImprovementTracker";
import { SignalLeaderboard } from "../components/SignalLeaderboard";
import { SignalVotingSystem } from "../components/SignalVotingSystem";
import { TowerAdoptionProgram } from "../components/TowerAdoptionProgram";
import {
  TowerOutageBanner,
  getOutageBadge,
} from "../components/TowerOutageBanner";
import type { GPSPosition } from "../hooks/useGPS";
import {
  useAddCommunitySignalReport,
  useAddCoverageGapReport,
  useCommunitySignalReports,
  useCoverageGapReports,
} from "../hooks/useQueries";
import { calculateDistance } from "../utils/geo";

interface MapPageProps {
  userPosition: GPSPosition;
  towers: Tower[];
  nearestTower: Tower | null;
  isOffline: boolean;
}

interface TowerRatings {
  [towerName: string]: { up: number; down: number };
}

const RATINGS_KEY = "tower_ratings";
const MAP_CACHED_KEY = "map_cached";
const GAPS_KEY = "coverage_gaps";

// Moroto region OSM tile URLs (zoom 12-13, covering lat 2.4-2.7, lon 34.6-34.9)
const MOROTO_TILES = [
  "https://tile.openstreetmap.org/12/2461/1963.png",
  "https://tile.openstreetmap.org/12/2461/1964.png",
  "https://tile.openstreetmap.org/12/2462/1963.png",
  "https://tile.openstreetmap.org/12/2462/1964.png",
  "https://tile.openstreetmap.org/13/4922/3927.png",
  "https://tile.openstreetmap.org/13/4922/3928.png",
  "https://tile.openstreetmap.org/13/4923/3927.png",
  "https://tile.openstreetmap.org/13/4923/3928.png",
  "https://tile.openstreetmap.org/13/4924/3927.png",
  "https://tile.openstreetmap.org/13/4924/3928.png",
];

interface LocalGap {
  lat: number;
  lon: number;
  description: string;
  date: string;
}

function loadLocalGaps(): LocalGap[] {
  try {
    const s = localStorage.getItem(GAPS_KEY);
    return s ? (JSON.parse(s) as LocalGap[]) : [];
  } catch {
    return [];
  }
}

function getLastSignalReport(): {
  rssi: number;
  lat: number;
  lon: number;
} | null {
  try {
    const s = localStorage.getItem("last_signal_report");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function MapPage({
  userPosition,
  towers,
  nearestTower,
  isOffline,
}: MapPageProps) {
  const [ratings, setRatings] = useState<TowerRatings>(() => {
    try {
      const stored = localStorage.getItem(RATINGS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [mapCached, setMapCached] = useState(() => {
    return localStorage.getItem(MAP_CACHED_KEY) === "true";
  });
  const [caching, setCaching] = useState(false);

  // Heatmap toggle
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Feature V10-12: Dead zone toggle
  const [showDeadZones, setShowDeadZones] = useState(false);
  const [localGaps, setLocalGaps] = useState<LocalGap[]>(loadLocalGaps);

  // Report Signal modal
  const [reportSignalOpen, setReportSignalOpen] = useState(false);
  const [signalQuality, setSignalQuality] = useState<SignalQuality>(
    SignalQuality.Good,
  );
  const [signalNote, setSignalNote] = useState("");

  // Report Dead Zone modal
  const [reportGapOpen, setReportGapOpen] = useState(false);
  const [gapDescription, setGapDescription] = useState(
    "No signal at this location",
  );

  // Data from backend
  const { data: communityReports = [] } = useCommunitySignalReports();
  const { data: gapReports = [] } = useCoverageGapReports();
  const addSignalReport = useAddCommunitySignalReport();
  const addGapReport = useAddCoverageGapReport();

  // Nearby user simulations (deterministic)
  const nearbyUsers = useMemo(() => generateNearbyUsers(towers), [towers]);

  useEffect(() => {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  }, [ratings]);

  // Track offline usage for achievements
  useEffect(() => {
    if (isOffline) {
      localStorage.setItem("used_while_offline", "true");
    }
  }, [isOffline]);

  const handleRate = (towerName: string, dir: "up" | "down") => {
    setRatings((prev) => {
      const existing = prev[towerName] ?? { up: 0, down: 0 };
      return {
        ...prev,
        [towerName]: {
          ...existing,
          [dir]: existing[dir] + 1,
        },
      };
    });
  };

  const handleCacheMap = async () => {
    setCaching(true);
    try {
      const cache = await caches.open("map-tiles");
      await Promise.all(
        MOROTO_TILES.map((url) =>
          fetch(url, { mode: "no-cors" })
            .then((res) => cache.put(url, res))
            .catch(() => {
              /* ignore individual tile failures */
            }),
        ),
      );
      localStorage.setItem(MAP_CACHED_KEY, "true");
      setMapCached(true);
    } catch {
      localStorage.setItem(MAP_CACHED_KEY, "true");
      setMapCached(true);
    } finally {
      setCaching(false);
    }
  };

  // Feature V10-7: Save map as image (Canvas-based)
  const handleSaveMapImage = () => {
    const canvas = document.createElement("canvas");
    const size = 600;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#1a2233";
    ctx.fillRect(0, 0, size, size);

    // Grid lines
    ctx.strokeStyle = "#2a3a55";
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Airtel Signal Map — Moroto", size / 2, 30);

    // Date & coordinates
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText(
      `Lat: ${userPosition.latitude.toFixed(4)} Lon: ${userPosition.longitude.toFixed(4)} | ${new Date().toLocaleDateString()}`,
      size / 2,
      52,
    );

    // Map area bounds (Moroto region)
    const latMin = 2.45;
    const latMax = 2.62;
    const lonMin = 34.62;
    const lonMax = 34.75;
    const toCanvasX = (lon: number) =>
      ((lon - lonMin) / (lonMax - lonMin)) * (size - 80) + 40;
    const toCanvasY = (lat: number) =>
      size - ((lat - latMin) / (latMax - latMin)) * (size - 80) - 40;

    // Draw towers
    for (const tower of towers) {
      const x = toCanvasX(tower.longitude);
      const y = toCanvasY(tower.latitude);
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = tower.name === nearestTower?.name ? "#ef4444" : "#f97316";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tower.name.slice(0, 10), x, y - 12);
    }

    // Draw user
    const ux = toCanvasX(userPosition.longitude);
    const uy = toCanvasY(userPosition.latitude);
    ctx.beginPath();
    ctx.arc(ux, uy, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("You", ux, uy - 12);

    // Draw line to nearest tower
    if (nearestTower) {
      const tx = toCanvasX(nearestTower.longitude);
      const ty = toCanvasY(nearestTower.latitude);
      ctx.beginPath();
      ctx.moveTo(ux, uy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Scale bar
    ctx.fillStyle = "#888888";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("~5km", 40, size - 15);
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, size - 20);
    ctx.lineTo(100, size - 20);
    ctx.stroke();

    // Download
    const link = document.createElement("a");
    link.download = `airtel-signal-map-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Map image saved!");
  };

  // Feature V10-11: Signal change alerts
  const handleSubmitSignalReport = async () => {
    // Check for signal change
    const qualityToRssi: Record<string, number> = {
      [SignalQuality.Excellent]: -68,
      [SignalQuality.Good]: -80,
      [SignalQuality.Weak]: -92,
      [SignalQuality.None]: -105,
    };
    const newRssi = qualityToRssi[signalQuality] ?? -80;
    const last = getLastSignalReport();

    try {
      await addSignalReport.mutateAsync({
        latitude: userPosition.latitude,
        longitude: userPosition.longitude,
        quality: signalQuality,
        note: signalNote.trim() || null,
      });

      // Award points
      awardPoints("report");

      // Signal change alert
      if (last) {
        const latDiff = Math.abs(last.lat - userPosition.latitude);
        const lonDiff = Math.abs(last.lon - userPosition.longitude);
        const sameArea = latDiff < 0.1 && lonDiff < 0.1;
        if (sameArea) {
          const diff = newRssi - last.rssi;
          if (diff >= 10) {
            toast.success(
              `📶 Signal improved in your area! +${Math.abs(diff)} dBm`,
              {
                style: { background: "oklch(0.62 0.2 145)" },
              },
            );
          } else if (diff <= -10) {
            toast.error(
              `⚠️ Signal degraded in your area! −${Math.abs(diff)} dBm`,
            );
          }
        }
      }

      localStorage.setItem(
        "last_signal_report",
        JSON.stringify({
          rssi: newRssi,
          lat: userPosition.latitude,
          lon: userPosition.longitude,
        }),
      );

      toast.success("Signal report submitted! ✅");
      setReportSignalOpen(false);
      setSignalNote("");
    } catch {
      toast.error("Failed to submit report");
    }
  };

  const handleSubmitGapReport = async () => {
    try {
      await addGapReport.mutateAsync({
        latitude: userPosition.latitude,
        longitude: userPosition.longitude,
        description: gapDescription.trim() || "No signal at this location",
      });

      // Save to local gaps too
      const newGap: LocalGap = {
        lat: userPosition.latitude,
        lon: userPosition.longitude,
        description: gapDescription.trim() || "No signal",
        date: new Date().toLocaleDateString(),
      };
      const updated = [...localGaps, newGap];
      setLocalGaps(updated);
      localStorage.setItem(GAPS_KEY, JSON.stringify(updated));

      toast.success("Dead zone reported to Airtel 📡");
      setReportGapOpen(false);
      setGapDescription("No signal at this location");
    } catch {
      toast.error("Failed to submit report");
    }
  };

  // Feature V10-12: Export dead zone report
  const handleExportDeadZones = () => {
    const allGaps = [...localGaps];
    const text = [
      "Airtel Uganda — Dead Zone Report",
      `Generated: ${new Date().toLocaleString()}`,
      "Location: Moroto District, Uganda",
      "",
      `Total dead zones reported: ${allGaps.length}`,
      "",
      ...allGaps.map(
        (g, i) =>
          `${i + 1}. Lat: ${g.lat.toFixed(5)}, Lon: ${g.lon.toFixed(5)} | ${g.description} | ${g.date}`,
      ),
      "",
      "Please investigate and improve coverage in these areas.",
      "Contact: Airtel Uganda Customer Support | 0800 100 100",
    ].join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Dead zone report copied to clipboard!"))
      .catch(() => toast.error("Could not copy"));
  };

  return (
    <div data-ocid="map.page" className="space-y-4 pb-4">
      {isOffline && (
        <div className="mx-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2 text-xs text-yellow-700">
          <span>📦</span>
          <span className="font-medium">
            Offline Mode — Using cached tower locations
          </span>
        </div>
      )}

      {/* Tower Outage Banner */}
      <TowerOutageBanner
        nearestTower={nearestTower}
        communityReports={communityReports}
      />

      {/* Control row */}
      <div className="mx-2 flex items-center gap-2 flex-wrap">
        {mapCached ? (
          <Badge className="bg-signal-green text-white text-xs px-3 py-1">
            ✓ Map Cached
          </Badge>
        ) : (
          <Button
            data-ocid="map.cache.primary_button"
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={handleCacheMap}
            disabled={caching}
          >
            {caching ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <span className="mr-1">💾</span>
            )}
            {caching ? "Caching..." : "Cache Map Offline"}
          </Button>
        )}

        {/* Feature V10-7: Save as image */}
        <Button
          data-ocid="map.save_image.button"
          size="sm"
          variant="outline"
          className="text-xs h-8 gap-1"
          onClick={handleSaveMapImage}
        >
          <Download className="w-3 h-3" />
          Save Map
        </Button>

        {/* Heatmap toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <Label
            htmlFor="heatmap-switch"
            className="text-xs text-muted-foreground cursor-pointer"
          >
            🗺️ Heatmap
          </Label>
          <Switch
            id="heatmap-switch"
            data-ocid="map.heatmap.toggle"
            checked={showHeatmap}
            onCheckedChange={setShowHeatmap}
          />
        </div>
      </div>

      {/* Feature V10-12: Dead zone toggle */}
      <div className="mx-2 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="dead-zones-switch"
            className="text-xs text-muted-foreground cursor-pointer"
          >
            🔴 Dead Zones
          </Label>
          <Switch
            id="dead-zones-switch"
            data-ocid="map.dead_zones.toggle"
            checked={showDeadZones}
            onCheckedChange={setShowDeadZones}
          />
          {localGaps.length > 0 && (
            <span className="text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-2 py-0.5">
              {localGaps.length} dead zones
            </span>
          )}
        </div>
        {showDeadZones && localGaps.length > 0 && (
          <Button
            data-ocid="map.dead_zones.export.button"
            size="sm"
            variant="outline"
            className="h-7 text-xs ml-auto gap-1"
            onClick={handleExportDeadZones}
          >
            <ClipboardCopy className="w-3 h-3" />
            Export Report
          </Button>
        )}
      </div>

      <div className="mx-2">
        <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-card">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Tower Map</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />{" "}
                You
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />{" "}
                Tower
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" />{" "}
                Nearby
              </span>
            </div>
          </div>
          <div className="p-3">
            <MapView
              userPosition={userPosition}
              towers={towers}
              nearestTower={nearestTower}
              communityReports={communityReports}
              gapReports={gapReports}
              showHeatmap={showHeatmap}
              nearbyUsers={nearbyUsers}
            />
          </div>
        </div>
      </div>

      {/* Report buttons */}
      <div className="mx-2 grid grid-cols-2 gap-2">
        <Button
          data-ocid="map.report_signal.open_modal_button"
          variant="outline"
          size="sm"
          className="h-10 text-xs font-bold border-signal-green/40 text-signal-green hover:bg-signal-green/10 gap-1.5"
          onClick={() => setReportSignalOpen(true)}
        >
          <span>📶</span> Report Signal
        </Button>
        <Button
          data-ocid="map.report_gap.open_modal_button"
          variant="outline"
          size="sm"
          className="h-10 text-xs font-bold border-orange-300 text-orange-500 hover:bg-orange-50 gap-1.5"
          onClick={() => setReportGapOpen(true)}
        >
          <span>❌</span> Dead Zone
        </Button>
      </div>

      {/* Community reports count */}
      {communityReports.length > 0 && (
        <div className="mx-2 text-xs text-muted-foreground px-1">
          👥 {communityReports.length} community signal report
          {communityReports.length !== 1 ? "s" : ""} · {gapReports.length} dead
          zone{gapReports.length !== 1 ? "s" : ""} reported
        </div>
      )}

      {/* Tower list */}
      <div className="mx-2 space-y-2">
        <h3 className="font-bold text-sm text-foreground px-1">
          Airtel Towers — Moroto Region
        </h3>
        {towers.map((tower, i) => {
          const dist = calculateDistance(
            userPosition.latitude,
            userPosition.longitude,
            tower.latitude,
            tower.longitude,
          );
          const isNearest = tower.name === nearestTower?.name;
          const rating = ratings[tower.name] ?? { up: 0, down: 0 };
          const hasCommunityBadge = rating.up >= 3;
          const hasOutage = getOutageBadge(tower.name, communityReports);

          return (
            <motion.div
              key={tower.name}
              data-ocid={`map.tower.item.${i + 1}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-card rounded-xl p-3 border shadow-xs ${
                isNearest ? "border-primary/30 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isNearest
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  <Radio className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {tower.name}
                    </p>
                    {hasCommunityBadge && (
                      <Badge className="bg-signal-green/10 text-signal-green border-signal-green/20 text-xs px-1.5 py-0">
                        Community ✓
                      </Badge>
                    )}
                    {hasOutage && (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs px-1.5 py-0">
                        ⚠️ Outage Reported
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tower.region}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">
                    {dist.toFixed(1)} km
                  </p>
                  {isNearest && (
                    <span className="text-xs text-primary font-semibold">
                      Nearest
                    </span>
                  )}
                </div>
              </div>

              {/* Tower Quality Ratings */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                <button
                  type="button"
                  data-ocid={`map.tower.thumbsup.button.${i + 1}`}
                  onClick={() => handleRate(tower.name, "up")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-signal-green transition-colors px-2 py-1 rounded-lg hover:bg-signal-green/10"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{rating.up}</span>
                </button>
                <button
                  type="button"
                  data-ocid={`map.tower.thumbsdown.button.${i + 1}`}
                  onClick={() => handleRate(tower.name, "down")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{rating.down}</span>
                </button>
                <span className="text-xs text-muted-foreground ml-1">
                  Rate signal quality
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Signal Leaderboard */}
      <div className="mx-2">
        <SignalLeaderboard communityReports={communityReports} />
      </div>

      {/* Installer Directory */}
      <div className="mx-2">
        <InstallerDirectory />
      </div>

      {/* Obstacle Mapper */}
      <div className="mx-2">
        <ObstacleMapper userPosition={userPosition} />
      </div>

      {/* V11-31: Signal Voting System */}
      <div className="mx-2">
        <SignalVotingSystem
          lat={userPosition.latitude}
          lon={userPosition.longitude}
        />
      </div>

      {/* V11-32: Installer Job Board */}
      <div className="mx-2">
        <InstallerJobBoard />
      </div>

      {/* V11-33: Tower Adoption Program */}
      {towers.length > 0 && (
        <div className="mx-2">
          <TowerAdoptionProgram towers={towers} />
        </div>
      )}

      {/* V11-34: Group Signal Survey Mode */}
      <div className="mx-2">
        <GroupSignalSurveyMode />
      </div>

      {/* V11-35: Community Antenna Club */}
      <div className="mx-2">
        <CommunityAntennaClub />
      </div>

      {/* V11-36: Crowd-Funded Tower Request */}
      <div className="mx-2">
        <CrowdFundedTowerRequest userPosition={userPosition} />
      </div>

      {/* V11-37: Signal Improvement Tracker */}
      <div className="mx-2">
        <SignalImprovementTracker />
      </div>

      {/* V11-38: Neighborhood Signal Champion */}
      <div className="mx-2">
        <NeighborhoodSignalChampion />
      </div>

      <div className="mx-2 bg-card rounded-xl p-3 border border-border shadow-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-muted-foreground">Your Location</p>
            <p className="text-sm font-medium text-foreground">
              {userPosition.latitude.toFixed(5)},{" "}
              {userPosition.longitude.toFixed(5)}
            </p>
          </div>
        </div>
      </div>

      {/* Report Signal Modal */}
      <Dialog open={reportSignalOpen} onOpenChange={setReportSignalOpen}>
        <DialogContent
          data-ocid="map.report_signal.dialog"
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>📶 Report Signal Quality</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Signal Quality</Label>
              <Select
                value={signalQuality}
                onValueChange={(v) => setSignalQuality(v as SignalQuality)}
              >
                <SelectTrigger
                  data-ocid="map.report_signal.select"
                  className="mt-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SignalQuality.Excellent}>
                    🟢 Excellent
                  </SelectItem>
                  <SelectItem value={SignalQuality.Good}>🟡 Good</SelectItem>
                  <SelectItem value={SignalQuality.Weak}>🟠 Weak</SelectItem>
                  <SelectItem value={SignalQuality.None}>🔴 None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Note (optional)</Label>
              <Textarea
                data-ocid="map.report_signal.textarea"
                placeholder="e.g. Good signal near the church"
                value={signalNote}
                onChange={(e) => setSignalNote(e.target.value)}
                className="mt-1 h-20 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="map.report_signal.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setReportSignalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="map.report_signal.submit_button"
                className="btn-airtel flex-1"
                onClick={handleSubmitSignalReport}
                disabled={addSignalReport.isPending}
              >
                {addSignalReport.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : null}
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dead Zone Modal */}
      <Dialog open={reportGapOpen} onOpenChange={setReportGapOpen}>
        <DialogContent data-ocid="map.report_gap.dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>❌ Report Dead Zone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your location ({userPosition.latitude.toFixed(4)},{" "}
              {userPosition.longitude.toFixed(4)}) will be reported as a
              coverage gap to help Airtel improve the network.
            </p>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                data-ocid="map.report_gap.textarea"
                value={gapDescription}
                onChange={(e) => setGapDescription(e.target.value)}
                className="mt-1 h-20 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="map.report_gap.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setReportGapOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="map.report_gap.submit_button"
                className="btn-airtel flex-1"
                onClick={handleSubmitGapReport}
                disabled={addGapReport.isPending}
              >
                {addGapReport.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : null}
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
