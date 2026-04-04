import { Button } from "@/components/ui/button";
import { Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ConnectionInfo {
  type: string;
  effectiveType: string;
  downlink: number;
}

function getConnectionInfo(): ConnectionInfo {
  const nav = navigator as Navigator & {
    connection?: { type?: string; effectiveType?: string; downlink?: number };
  };
  const conn = nav.connection ?? {};
  return {
    type: conn.type ?? "unknown",
    effectiveType: conn.effectiveType ?? "unknown",
    downlink: conn.downlink ?? 0,
  };
}

function connectionLabel(info: ConnectionInfo): {
  label: string;
  color: string;
  icon: string;
} {
  const et = info.effectiveType;
  if (info.type === "wifi")
    return { label: "WiFi", color: "text-signal-green", icon: "📶" };
  if (et === "4g")
    return { label: "4G LTE", color: "text-signal-green", icon: "📡" };
  if (et === "3g") return { label: "3G", color: "text-yellow-500", icon: "📡" };
  if (et === "2g") return { label: "2G", color: "text-orange-500", icon: "⚠️" };
  if (et === "slow-2g")
    return { label: "Slow 2G", color: "text-destructive", icon: "🐌" };
  return { label: "Unknown", color: "text-muted-foreground", icon: "❓" };
}

export function ApnAutoDetect() {
  const [conn, setConn] = useState<ConnectionInfo>(getConnectionInfo);
  const info = connectionLabel(conn);
  const showApnWarning =
    conn.effectiveType === "slow-2g" ||
    (conn.effectiveType === "2g" && conn.downlink < 1);

  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: {
        addEventListener: (e: string, fn: () => void) => void;
        removeEventListener: (e: string, fn: () => void) => void;
      };
    };
    const update = () => setConn(getConnectionInfo());
    nav.connection?.addEventListener("change", update);
    return () => nav.connection?.removeEventListener("change", update);
  }, []);

  const handleCopyApn = () => {
    navigator.clipboard
      .writeText("internet")
      .then(() => toast.success("APN copied: internet"))
      .catch(() => toast.error("Could not copy"));
  };

  return (
    <div
      className={`rounded-xl border p-3 ${
        showApnWarning
          ? "bg-yellow-50 border-yellow-200"
          : "bg-card border-border shadow-xs"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Wifi className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-foreground">
          Connection Status
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xl">{info.icon}</span>
        <div className="flex-1">
          <span className={`text-sm font-bold ${info.color}`}>
            {info.label}
          </span>
          {conn.downlink > 0 && (
            <span className="text-xs text-muted-foreground ml-2">
              {conn.downlink} Mbps
            </span>
          )}
        </div>
      </div>

      {showApnWarning && (
        <div className="mt-2 text-xs text-yellow-700">
          ⚠️ <strong>Slow connection detected.</strong> Check your APN settings.
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground">
            Airtel Uganda Recommended APN
          </p>
          <p className="text-sm font-mono font-bold text-primary">internet</p>
        </div>
        <Button
          data-ocid="home.apn.copy.button"
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={handleCopyApn}
        >
          📋 Copy APN
        </Button>
      </div>
    </div>
  );
}
