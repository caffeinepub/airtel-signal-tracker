import { ARView } from "../components/ARView";

interface ARPageProps {
  bearing: number;
  relativeAngle: number;
  rssi: number;
  towerName: string;
  isOptimal: boolean;
}

export function ARPage({
  bearing,
  relativeAngle,
  rssi,
  towerName,
  isOptimal,
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
      <div className="mx-2 mt-4 bg-card rounded-xl p-4 border border-border">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">
          AR Mode Tips
        </h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Point rear camera at rooftop or pole location</li>
          <li>• Rotate phone until arrow points straight up</li>
          <li>• Green badge appears when direction is optimal</li>
          <li>• Works best in landscape mode for mounting reference</li>
        </ul>
      </div>
    </div>
  );
}
