import type { Tower } from "../backend.d";
import { ARCompassRose } from "../components/ARCompassRose";
import { ARInstallationPath } from "../components/ARInstallationPath";
import { ARObstacleHeightEstimator } from "../components/ARObstacleHeightEstimator";
import { ARTowerLabelOverlay } from "../components/ARTowerLabelOverlay";
import { ARView } from "../components/ARView";
import type { GPSPosition } from "../hooks/useGPS";

interface ARPageProps {
  bearing: number;
  relativeAngle: number;
  rssi: number;
  towerName: string;
  isOptimal: boolean;
  towers?: Tower[];
  userPosition?: GPSPosition;
}

export function ARPage({
  bearing,
  relativeAngle,
  rssi,
  towerName,
  isOptimal,
  towers = [],
  userPosition,
}: ARPageProps) {
  return (
    <div data-ocid="ar.page" className="pb-4">
      <div className="mx-2">
        <ARView
          bearing={bearing}
          relativeAngle={relativeAngle}
          rssi={rssi}
          towerName={towerName}
          isOptimal={isOptimal}
        />
      </div>

      {/* AR overlay features — these render as absolute-positioned overlays inside a relative container */}
      {userPosition && towers.length > 0 && (
        <div className="mx-2 mt-2">
          <div
            className="relative bg-secondary/20 rounded-xl overflow-hidden"
            style={{ minHeight: 100 }}
          >
            <ARCompassRose bearing={bearing} />
            <ARInstallationPath />
            <ARTowerLabelOverlay
              towers={towers}
              userPosition={userPosition}
              bearing={bearing}
            />
            <div className="px-4 py-3 text-xs text-muted-foreground text-center">
              AR overlays: compass rose, path guide, and tower labels
            </div>
          </div>
        </div>
      )}

      {/* Obstacle Height Estimator */}
      {userPosition && (
        <div className="mx-2 mt-2 relative">
          <div className="bg-card rounded-xl border border-border shadow-card p-4">
            <h4 className="text-xs font-bold text-foreground mb-2">
              Obstacle Height Estimator
            </h4>
            <p className="text-[10px] text-muted-foreground mb-2">
              Enter approximate horizontal distance to obstacle, then use the
              estimator when AR is active.
            </p>
            <ARObstacleHeightEstimator distanceToObstacle={20} />
          </div>
        </div>
      )}

      <div className="mx-2 mt-4 bg-card rounded-xl p-4 border border-border">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">
          AR Mode Tips
        </h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Point rear camera at rooftop or pole location</li>
          <li>• Rotate phone until arrow points straight up</li>
          <li>• Green badge appears when direction is optimal</li>
          <li>• Works best in landscape mode for mounting reference</li>
          <li>• Use Night Vision toggle for low-light installation</li>
          <li>• Tower labels show distance to each cell tower</li>
        </ul>
      </div>
    </div>
  );
}
