import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "./components/AppHeader";
import { BottomNav } from "./components/BottomNav";
import { TutorialOverlay } from "./components/TutorialOverlay";
import { ARPage } from "./pages/ARPage";
import { CompassPage } from "./pages/CompassPage";
import { GpsDirectionPage } from "./pages/GpsDirectionPage";
import { GuidancePage } from "./pages/GuidancePage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { MapPage } from "./pages/MapPage";
import { SafetyPage } from "./pages/SafetyPage";
import { TroubleshootingPage } from "./pages/TroubleshootingPage";
import { UssdPage } from "./pages/UssdPage";
import { WifiScannerPage } from "./pages/WifiScannerPage";

import { useCompass } from "./hooks/useCompass";
import { useGPS } from "./hooks/useGPS";
import { useNightMode } from "./hooks/useNightMode";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import {
  useSeedTowers,
  useSignalPositions,
  useTowers,
} from "./hooks/useQueries";

import type { Tower } from "./backend.d";
import { calculateBearing, calculateDistance, estimateRSSI } from "./utils/geo";
import type { LangCode } from "./utils/i18n";

const TUTORIAL_KEY = "tutorial_shown";

type TabId =
  | "home"
  | "compass"
  | "gps"
  | "map"
  | "guidance"
  | "ar"
  | "history"
  | "wifi"
  | "ussd"
  | "help"
  | "safety";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [rssi, setRssi] = useState(-85);
  const [nearestTower, setNearestTower] = useState<Tower | null>(null);
  const [distanceKm, setDistanceKm] = useState(3);
  const [bearing, setBearing] = useState(0);
  const [hasAlertedOptimal, setHasAlertedOptimal] = useState(false);
  const rssiTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tutorial overlay
  const [showTutorial, setShowTutorial] = useState(
    () => localStorage.getItem(TUTORIAL_KEY) !== "true",
  );

  // Battery Saver Mode
  const [batterySaver, setBatterySaver] = useState(
    () => localStorage.getItem("battery_saver") === "true",
  );

  // Feature 14: Low-Bandwidth Mode
  const [lowBandwidth, setLowBandwidth] = useState(
    () => localStorage.getItem("low_bandwidth") === "true",
  );

  // Feature 15: Large Text Mode
  const [largeText, setLargeText] = useState(
    () => localStorage.getItem("large_text") === "true",
  );

  // Feature 13: Language
  const [lang, setLang] = useState<LangCode>(
    () => (localStorage.getItem("app_language") as LangCode) ?? "en",
  );

  // V11 Feature 50: Elder Mode
  const [elderMode, setElderMode] = useState(
    () => localStorage.getItem("elder_mode") === "true",
  );

  const handleElderModeChange = (val: boolean) => {
    setElderMode(val);
    localStorage.setItem("elder_mode", String(val));
  };

  const handleBatterySaverChange = (val: boolean) => {
    setBatterySaver(val);
    localStorage.setItem("battery_saver", String(val));
  };

  const handleLowBandwidthChange = (val: boolean) => {
    setLowBandwidth(val);
    localStorage.setItem("low_bandwidth", String(val));
  };

  const handleLargeTextChange = (val: boolean) => {
    setLargeText(val);
    localStorage.setItem("large_text", String(val));
  };

  const handleLangChange = (newLang: LangCode) => {
    setLang(newLang);
    localStorage.setItem("app_language", newLang);
  };

  // Night Mode
  const { isDark, toggle: toggleNightMode } = useNightMode();

  // Online status monitor
  const isOnline = useOnlineStatus();
  const prevOnlineRef = useRef<boolean>(isOnline);

  useEffect(() => {
    const wasOnline = prevOnlineRef.current;
    prevOnlineRef.current = isOnline;

    if (!isOnline && wasOnline) {
      toast.warning("You are offline — using cached data", {
        duration: 5000,
      });
    } else if (isOnline && !wasOnline) {
      toast.success("Connection restored ✅", { duration: 3000 });
    }
  }, [isOnline]);

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

  const PageWrapper = lowBandwidth ? "div" : motion.div;

  return (
    <div
      className={`min-h-screen bg-background flex flex-col${largeText ? " large-text" : ""}`}
    >
      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay onComplete={() => setShowTutorial(false)} />
      )}

      <AppHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        lang={lang}
        onLangChange={handleLangChange}
        lowBandwidth={lowBandwidth}
      />

      <main className="flex-1 pb-20 md:pb-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <PageWrapper
            key={activeTab}
            {...(!lowBandwidth
              ? {
                  variants: pageVariants,
                  initial: "initial",
                  animate: "animate",
                  exit: "exit",
                  transition: { duration: 0.2 },
                }
              : {})}
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
                isOnline={isOnline}
                isDarkMode={isDark}
                onToggleDarkMode={toggleNightMode}
                userPosition={userPosition}
                lowBandwidth={lowBandwidth}
                onLowBandwidthChange={handleLowBandwidthChange}
                largeText={largeText}
                onLargeTextChange={handleLargeTextChange}
                lang={lang}
                towers={towers}
                elderMode={elderMode}
                onElderModeChange={handleElderModeChange}
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
            {activeTab === "gps" && (
              <GpsDirectionPage
                userPosition={userPosition}
                gpsStatus={gpsStatus}
                deviceHeading={deviceHeading}
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
                towers={towers}
                userPosition={userPosition}
              />
            )}
            {activeTab === "history" && (
              <HistoryPage
                positions={savedPositions}
                towers={towers}
                userPosition={userPosition}
                rssi={rssi}
                distanceKm={distanceKm}
                nearestTowerName={nearestTower?.name ?? "Unknown Tower"}
              />
            )}
            {activeTab === "wifi" && <WifiScannerPage isOnline={isOnline} />}
            {activeTab === "ussd" && <UssdPage />}
            {activeTab === "help" && <TroubleshootingPage />}
            {activeTab === "safety" && (
              <SafetyPage
                rssi={rssi}
                userPosition={userPosition}
                isOnline={isOnline}
              />
            )}
          </PageWrapper>
        </AnimatePresence>
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        elderMode={elderMode}
      />

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
              onClick={() => setActiveTab("ussd")}
              className="hover:text-white transition-colors"
            >
              USSD Codes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("safety")}
              className="hover:text-white transition-colors"
            >
              Safety
            </button>
            <span>Optimized for Mobile</span>
          </div>
        </div>
      </footer>

      <Toaster position="top-center" />
    </div>
  );
}
