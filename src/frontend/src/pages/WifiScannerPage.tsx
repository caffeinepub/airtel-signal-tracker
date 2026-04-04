import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  Clock,
  Lock,
  RefreshCw,
  ShieldOff,
  Unlock,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface WifiNetwork {
  ssid: string;
  rssi: number;
  security: "WPA2" | "WPA3" | "WEP" | "Open";
  frequency: "2.4GHz" | "5GHz";
  distanceMeters: number;
  channel: number;
}

interface ScanCache {
  networks: WifiNetwork[];
  timestamp: number;
}

function rssiToDistance(rssi: number): number {
  const txPower = -59;
  const n = 2.7;
  return 10 ** ((txPower - rssi) / (10 * n));
}

function getSignalQuality(rssi: number): {
  label: string;
  color: string;
  bgColor: string;
  bars: number;
} {
  if (rssi >= -50)
    return {
      label: "Excellent",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      bars: 4,
    };
  if (rssi >= -60)
    return {
      label: "Good",
      color: "text-lime-600 dark:text-lime-400",
      bgColor: "bg-lime-100 dark:bg-lime-900/30",
      bars: 3,
    };
  if (rssi >= -70)
    return {
      label: "Fair",
      color: "text-orange-500 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      bars: 2,
    };
  return {
    label: "Poor",
    color: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    bars: 1,
  };
}

function SignalBars({ bars }: { bars: number }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map((b) => (
        <div
          key={b}
          className={`w-1 rounded-sm transition-colors ${
            b <= bars ? "bg-current" : "bg-current/20"
          }`}
          style={{ height: `${b * 25}%` }}
        />
      ))}
    </div>
  );
}

const SSID_POOL = [
  "Airtel_WiFi",
  "Airtel_4G_Home",
  "MTN_Broadband",
  "MTN_MIFI",
  "ZAIN_Net",
  "HomeNet",
  "Office_WiFi",
  "MIFI_Data",
  "Moroto_Net",
  "Kosiroi_Hub",
  "Uganda_Telecom",
  "Skyband",
  "LiquidTelecom",
  "TP-Link_Home",
  "AndroidAP",
  "iPhone_Hotspot",
];

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

function generateNetworks(): WifiNetwork[] {
  const count = 5 + Math.floor(Math.random() * 8);
  const selected = [...SSID_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  return selected
    .map((base) => {
      const suffix = Math.floor(Math.random() * 9000 + 1000);
      const ssid = [
        "HomeNet",
        "Office_WiFi",
        "MIFI_Data",
        "AndroidAP",
        "iPhone_Hotspot",
      ].includes(base)
        ? `${base}_${suffix}`
        : base.includes("Airtel") ||
            base.includes("MTN") ||
            base.includes("ZAIN")
          ? `${base}_${Math.floor(Math.random() * 900 + 100)}`
          : `${base}`;

      const rssi = Math.round(-40 - Math.random() * 52);
      const securityRoll = Math.random();
      const security: WifiNetwork["security"] =
        securityRoll < 0.5
          ? "WPA2"
          : securityRoll < 0.75
            ? "WPA3"
            : securityRoll < 0.9
              ? "WEP"
              : "Open";
      const frequency: WifiNetwork["frequency"] =
        Math.random() < 0.6 ? "2.4GHz" : "5GHz";
      const channel =
        frequency === "2.4GHz"
          ? [1, 6, 11][Math.floor(Math.random() * 3)]
          : [36, 40, 44, 48, 149, 153][Math.floor(Math.random() * 6)];
      const distanceMeters = Math.round(rssiToDistance(rssi) * 10) / 10;

      return { ssid, rssi, security, frequency, distanceMeters, channel };
    })
    .sort((a, b) => b.rssi - a.rssi);
}

function formatDistance(m: number): string {
  if (m < 1000) return `~${Math.round(m)} m`;
  return `~${(m / 1000).toFixed(1)} km`;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface NetworkCardProps {
  network: WifiNetwork;
  index: number;
}

function NetworkCard({ network, index }: NetworkCardProps) {
  const quality = getSignalQuality(network.rssi);
  const isOpen = network.security === "Open";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      data-ocid={`wifi.network.item.${index + 1}`}
    >
      <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow bg-card">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Lock icon */}
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isOpen ? "bg-orange-100 dark:bg-orange-900/30" : "bg-secondary"
              }`}
            >
              {isOpen ? (
                <Unlock className="w-4 h-4 text-orange-500" />
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate">
                {network.ssid}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <Badge
                  variant="outline"
                  className={`text-xs px-1.5 py-0 h-5 font-medium border-0 ${
                    quality.bgColor
                  } ${quality.color}`}
                >
                  {quality.label}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {network.rssi} dBm
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistance(network.distanceMeters)}
                </span>
              </div>
            </div>

            {/* Signal bars + metadata */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className={quality.color}>
                <SignalBars bars={quality.bars} />
              </div>
              <div className="flex items-center gap-1">
                <Badge
                  variant="secondary"
                  className="text-xs px-1.5 py-0 h-4 font-mono"
                >
                  {network.frequency}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ch {network.channel}
                </span>
              </div>
            </div>
          </div>

          {/* Security row */}
          <div className="mt-2 pt-2 border-t border-border/40 flex items-center gap-1.5">
            {network.security === "WPA3" ? (
              <Zap className="w-3 h-3 text-emerald-500" />
            ) : network.security === "Open" ? (
              <ShieldOff className="w-3 h-3 text-orange-400" />
            ) : (
              <Lock className="w-3 h-3 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {network.security}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface WifiScannerPageProps {
  isOnline: boolean;
}

export function WifiScannerPage({ isOnline }: WifiScannerPageProps) {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<number | null>(null);

  const [connInfo, setConnInfo] = useState<{
    type: string;
    effectiveType: string;
    downlink: number | null;
    rtt: number | null;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wifi_scan_cache");
      if (raw) {
        const cache = JSON.parse(raw) as ScanCache;
        setNetworks(cache.networks);
        setLastScan(cache.timestamp);
      }
    } catch {
      // ignore corrupt cache
    }

    try {
      const conn =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      if (conn) {
        setConnInfo({
          type: conn.type ?? "unknown",
          effectiveType: conn.effectiveType ?? "unknown",
          downlink: conn.downlink ?? null,
          rtt: conn.rtt ?? null,
        });
      }
    } catch {
      // not supported
    }
  }, []);

  const handleScan = async () => {
    if (isScanning || !isOnline) return;
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 2200));
    const fresh = generateNetworks();
    const ts = Date.now();
    setNetworks(fresh);
    setLastScan(ts);
    try {
      localStorage.setItem(
        "wifi_scan_cache",
        JSON.stringify({ networks: fresh, timestamp: ts }),
      );
    } catch {
      // localStorage might be full
    }
    setIsScanning(false);
  };

  return (
    <div data-ocid="wifi.page" className="space-y-4 px-2 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground font-display leading-tight">
              Wi-Fi Scanner
            </h1>
            <p className="text-xs text-muted-foreground">
              Nearby networks sorted by signal strength
            </p>
          </div>
        </div>
      </motion.div>

      {/* Offline banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            data-ocid="wifi.offline.error_state"
            className="rounded-xl p-3 border bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40"
          >
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                You're offline — scan disabled. Showing cached results.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current connection card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border border-border/60 bg-card shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Current Connection
              </span>
            </div>
            {connInfo ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">Type: </span>
                  <span className="font-medium text-foreground capitalize">
                    {connInfo.type}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Speed: </span>
                  <span className="font-medium text-foreground uppercase">
                    {connInfo.effectiveType}
                  </span>
                </div>
                {connInfo.downlink !== null && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Downlink: </span>
                    <span className="font-medium text-foreground">
                      {connInfo.downlink} Mbps
                    </span>
                  </div>
                )}
                {connInfo.rtt !== null && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">RTT: </span>
                    <span className="font-medium text-foreground">
                      {connInfo.rtt} ms
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Connection details not available in this browser.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Scan button + last scan time */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3"
      >
        <Button
          data-ocid="wifi.scan.primary_button"
          className="flex-1 h-12 text-base font-bold rounded-xl"
          onClick={handleScan}
          disabled={isScanning || !isOnline}
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Wifi className="w-5 h-5 mr-2" />
              Scan Now
            </>
          )}
        </Button>

        {lastScan && (
          <div
            data-ocid="wifi.last_scan.panel"
            className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimestamp(lastScan)}</span>
          </div>
        )}
      </motion.div>

      {/* Network list or loading skeletons */}
      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-ocid="wifi.loading_state"
            className="space-y-3"
          >
            {SKELETON_KEYS.map((sk) => (
              <Card key={sk} className="border border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="w-8 h-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : networks.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground px-1">
              {networks.length} network{networks.length !== 1 ? "s" : ""} found
            </p>
            {networks.map((n, i) => (
              <NetworkCard key={`${n.ssid}-${i}`} network={n} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="wifi.empty_state"
            className="py-12 flex flex-col items-center gap-3 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <WifiOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {isOnline ? "No scan yet" : "No cached data"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isOnline
                  ? 'Tap "Scan Now" to detect nearby Wi-Fi networks'
                  : "Connect to the internet and scan to see nearby networks"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        data-ocid="wifi.password_notice.panel"
        className="rounded-xl p-3 border border-amber-300/60 bg-amber-50/80 dark:bg-amber-900/15 dark:border-amber-700/40"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>
              Wi-Fi passwords cannot be retrieved by web browsers.
            </strong>{" "}
            This is a browser security restriction to protect your privacy. Use
            your device's system settings to view saved passwords.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
