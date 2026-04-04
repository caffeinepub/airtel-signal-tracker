import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AzimuthElevationPlotterProps {
  bearing: number;
  distanceKm?: number;
}

export function AzimuthElevationPlotter({
  bearing,
  distanceKm = 3,
}: AzimuthElevationPlotterProps) {
  const [userHeight, setUserHeight] = useState(5);
  const [towerHeight, setTowerHeight] = useState(30);

  // Elevation angle calculation
  const distanceM = distanceKm * 1000;
  const heightDiff = towerHeight - userHeight;
  const elevAngleDeg = (Math.atan2(heightDiff, distanceM) * 180) / Math.PI;

  // SVG side-view dimensions
  const svgW = 300;
  const svgH = 140;
  const leftX = 40;
  const rightX = 260;
  const groundY = 120;
  const userY = groundY - userHeight * 2;
  const towerBaseY = groundY;
  const towerTopY = groundY - towerHeight * 2;

  // Compass rose for azimuth
  const cx = 40;
  const cy = 40;
  const r = 30;
  const arrowAngle = ((bearing - 90) * Math.PI) / 180;
  const arrowEndX = cx + r * Math.cos(arrowAngle);
  const arrowEndY = cy + r * Math.sin(arrowAngle);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-base">📐</span>
        <h4 className="font-bold text-sm text-foreground">
          3D Azimuth &amp; Elevation Plotter
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">
            Your Roof Height (m)
          </Label>
          <input
            type="range"
            min={1}
            max={20}
            value={userHeight}
            onChange={(e) => setUserHeight(Number(e.target.value))}
            className="w-full mt-1 accent-primary"
          />
          <span className="text-xs font-semibold text-foreground">
            {userHeight} m
          </span>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">
            Tower Height (m)
          </Label>
          <input
            type="range"
            min={10}
            max={60}
            value={towerHeight}
            onChange={(e) => setTowerHeight(Number(e.target.value))}
            className="w-full mt-1 accent-primary"
          />
          <span className="text-xs font-semibold text-foreground">
            {towerHeight} m
          </span>
        </div>
      </div>

      {/* Side view SVG */}
      <div>
        <p className="text-xs text-muted-foreground mb-1">
          Side View (Elevation)
        </p>
        <svg
          role="img"
          aria-label="Elevation diagram"
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full border border-border rounded-lg bg-secondary/20"
          style={{ height: 140 }}
        >
          <title>Elevation diagram</title>
          {/* Ground */}
          <line
            x1={0}
            y1={groundY}
            x2={svgW}
            y2={groundY}
            stroke="oklch(0.65 0.04 240)"
            strokeWidth={1}
          />

          {/* User pole */}
          <line
            x1={leftX}
            y1={groundY}
            x2={leftX}
            y2={userY}
            stroke="oklch(0.46 0.22 24.5)"
            strokeWidth={3}
          />
          <circle cx={leftX} cy={userY} r={4} fill="oklch(0.46 0.22 24.5)" />
          <text
            x={leftX}
            y={groundY + 12}
            textAnchor="middle"
            fontSize={9}
            fill="oklch(0.48 0.025 240)"
          >
            You
          </text>
          <text
            x={leftX}
            y={userY - 6}
            textAnchor="middle"
            fontSize={8}
            fill="oklch(0.46 0.22 24.5)"
          >
            {userHeight}m
          </text>

          {/* Tower */}
          <line
            x1={rightX}
            y1={towerBaseY}
            x2={rightX}
            y2={towerTopY}
            stroke="oklch(0.28 0.12 240)"
            strokeWidth={4}
          />
          <polygon
            points={`${rightX - 6},${towerTopY + 8} ${rightX + 6},${towerTopY + 8} ${rightX},${towerTopY}`}
            fill="oklch(0.28 0.12 240)"
          />
          <text
            x={rightX}
            y={groundY + 12}
            textAnchor="middle"
            fontSize={9}
            fill="oklch(0.48 0.025 240)"
          >
            Tower
          </text>
          <text
            x={rightX}
            y={towerTopY - 6}
            textAnchor="middle"
            fontSize={8}
            fill="oklch(0.28 0.12 240)"
          >
            {towerHeight}m
          </text>

          {/* Line of sight */}
          <line
            x1={leftX}
            y1={userY}
            x2={rightX}
            y2={towerTopY}
            stroke="oklch(0.62 0.2 145)"
            strokeWidth={2}
            strokeDasharray="5,3"
          />

          {/* Angle label */}
          <text
            x={(leftX + rightX) / 2}
            y={(userY + towerTopY) / 2 - 6}
            textAnchor="middle"
            fontSize={10}
            fill="oklch(0.62 0.2 145)"
            fontWeight="bold"
          >
            {elevAngleDeg.toFixed(1)}°
          </text>
        </svg>
      </div>

      {/* Azimuth compass rose */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Azimuth (Top View)
          </p>
          <svg
            role="img"
            aria-label="Azimuth compass rose"
            viewBox="0 0 80 80"
            width={80}
            height={80}
          >
            <title>Azimuth compass rose</title>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="oklch(0.85 0.02 240)"
              strokeWidth={1.5}
            />
            {["N", "E", "S", "W"].map((d, i) => {
              const a = (i * 90 - 90) * (Math.PI / 180);
              return (
                <text
                  key={d}
                  x={cx + (r + 8) * Math.cos(a)}
                  y={cy + (r + 8) * Math.sin(a) + 3}
                  textAnchor="middle"
                  fontSize={8}
                  fill="oklch(0.48 0.025 240)"
                  fontWeight="bold"
                >
                  {d}
                </text>
              );
            })}
            {/* Arrow */}
            <line
              x1={cx}
              y1={cy}
              x2={arrowEndX}
              y2={arrowEndY}
              stroke="oklch(0.46 0.22 24.5)"
              strokeWidth={2.5}
            />
            <circle
              cx={arrowEndX}
              cy={arrowEndY}
              r={3.5}
              fill="oklch(0.46 0.22 24.5)"
            />
            <circle cx={cx} cy={cy} r={3} fill="oklch(0.28 0.12 240)" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Azimuth (Bearing)</span>
              <span className="font-bold text-foreground">
                {bearing.toFixed(1)}°
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Elevation Angle</span>
              <span className="font-bold text-signal-green">
                {elevAngleDeg.toFixed(1)}°
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Height Diff</span>
              <span className="font-bold text-foreground">
                {heightDiff.toFixed(0)} m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
