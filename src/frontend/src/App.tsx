import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "./components/AppHeader";
import { BottomNav } from "./components/BottomNav";
import { ARPage } from "./pages/ARPage";
import { CompassPage } from "./pages/CompassPage";
import { GuidancePage } from "./pages/GuidancePage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { MapPage } from "./pages/MapPage";

import { useCompass } from "./hooks/useCompass";
import { useGPS } from "./hooks/useGPS";
import {
  useSeedTowers,
  useSignalPositions,
  useTowers,
} from "./hooks/useQueries";

import type { Tower } from "./backend.d";
import { calculateBearing, calculateDistance, estimateRSSI } from "./utils/geo";

type TabId = "home" | "compass" | "map" | "guidance" | "ar" | "history";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [rssi, setRssi] = useState(-85);
  const [nearestTower, setNearestTower] = useState<Tower | null>(null);
  const [distanceKm, setDistanceKm] = useState(3);
  const [bearing, setBearing] = useState(0);
  const [hasAlertedOptimal, setHasAlertedOptimal] = useState(false);
  const rssiTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Feature 7: Battery Saver Mode
  const [batterySaver, setBatterySaver] = useState(
    () => localStorage.getItem("battery_saver") === "true",
  );

  const handleBatterySaverChange = (val: boolean) => {
    setBatterySaver(val);
    localStorage.setItem("battery_saver", String(val));
  };

  const { position: userPosition, status: gpsStatus } = useGPS({
    batterySaver,
  });
  const {
    heading: deviceHeading,
    supported: compassSupported,
    permissionGranted: compassPermissionGranted,
    requestPermission: requestCompassPermission,
  } = useCompass();

  useSeedTowers();
  const { data: towers = [], isError: towersError } = useTowers();
  const { data: savedPositions = [] } = useSignalPositions();

  useEffect(() => {
    if (towers.length === 0) return;

    let closest: Tower | null = null;
    let closestDist = Number.POSITIVE_INFINITY;

    for (const tower of towers) {
      const dist = calculateDistance(
        userPosition.latitude,
        userPosition.longitude,
        tower.latitude,
        tower.longitude,
      );
      if (dist < closestDist) {
        closestDist = dist;
        closest = tower;
      }
    }

    if (closest) {
      setNearestTower(closest);
      setDistanceKm(closestDist);
      setBearing(
        calculateBearing(
          userPosition.latitude,
          userPosition.longitude,
          closest.latitude,
          closest.longitude,
        ),
      );
    }
  }, [userPosition, towers]);

  useEffect(() => {
    if (rssiTimerRef.current) clearInterval(rssiTimerRef.current);
    rssiTimerRef.current = setInterval(() => {
      setRssi(estimateRSSI(distanceKm));
    }, 2000);
    return () => {
      if (rssiTimerRef.current) clearInterval(rssiTimerRef.current);
    };
  }, [distanceKm]);

  useEffect(() => {
    setRssi(estimateRSSI(distanceKm));
  }, [distanceKm]);

  const relativeAngle =
    deviceHeading !== null ? (bearing - deviceHeading + 360) % 360 : bearing;
  const isOptimal =
    compassPermissionGranted &&
    deviceHeading !== null &&
    (relativeAngle <= 15 || relativeAngle >= 345);

  useEffect(() => {
    if (isOptimal && !hasAlertedOptimal) {
      setHasAlertedOptimal(true);
      toast.success("🎯 Optimal Direction Reached!", {
        description: `Pointing toward ${nearestTower?.name ?? "nearest tower"}`,
        duration: 5000,
      });
    } else if (!isOptimal) {
      setHasAlertedOptimal(false);
    }
  }, [isOptimal, hasAlertedOptimal, nearestTower]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as TabId);
  }, []);

  const handleRecalibrate = () => {
    toast.info("Compass recalibrated", {
      description: "Rotate phone in figure-8 to improve accuracy",
    });
  };

  const handleGetTowerDetails = () => {
    if (nearestTower) {
      toast.info(nearestTower.name, {
        description: `Region: ${nearestTower.region} | Distance: ${distanceKm.toFixed(1)} km | Bearing: ${bearing.toFixed(0)}°`,
        duration: 6000,
      });
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 pb-20 md:pb-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="pt-4"
          >
            {activeTab === "home" && (
              <HomePage
                rssi={rssi}
                nearestTower={nearestTower}
                distanceKm={distanceKm}
                onNavigate={handleTabChange}
                gpsStatus={gpsStatus}
                batterySaver={batterySaver}
                onBatterySaverChange={handleBatterySaverChange}
              />
            )}
            {activeTab === "compass" && (
              <CompassPage
                bearing={bearing}
                deviceHeading={deviceHeading}
                rssi={rssi}
                nearestTower={nearestTower}
                distanceKm={distanceKm}
                isOptimal={isOptimal}
                compassSupported={compassSupported}
                compassPermissionGranted={compassPermissionGranted}
                onRequestCompassPermission={requestCompassPermission}
                onRecalibrate={handleRecalibrate}
                onGetTowerDetails={handleGetTowerDetails}
              />
            )}
            {activeTab === "map" && (
              <MapPage
                userPosition={userPosition}
                towers={towers}
                nearestTower={nearestTower}
                isOffline={!!towersError}
              />
            )}
            {activeTab === "guidance" && (
              <GuidancePage
                distanceKm={distanceKm}
                rssi={rssi}
                bearing={bearing}
                userPosition={userPosition}
                nearestTower={nearestTower}
              />
            )}
            {activeTab === "ar" && (
              <ARPage
                bearing={bearing}
                relativeAngle={relativeAngle}
                rssi={rssi}
                towerName={nearestTower?.name ?? "Nearest Tower"}
                isOptimal={isOptimal}
              />
            )}
            {activeTab === "history" && (
              <HistoryPage positions={savedPositions} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      <footer className="hidden md:block bg-footer-bg text-white py-5 px-4">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-white/90 hover:text-white"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <button
              type="button"
              onClick={() => setActiveTab("home")}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("compass")}
              className="hover:text-white transition-colors"
            >
              Compass
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("map")}
              className="hover:text-white transition-colors"
            >
              Coverage Map
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className="hover:text-white transition-colors"
            >
              History
            </button>
            <span>Optimized for Mobile</span>
          </div>
        </div>
      </footer>

      <Toaster position="top-center" />
    </div>
  );
}
