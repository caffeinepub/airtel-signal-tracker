import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import type { Tower } from "../backend.d";
import { CompassView } from "../components/CompassView";
import { SignalMeter } from "../components/SignalMeter";

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
        </ul>
      </div>
    </div>
  );
}
