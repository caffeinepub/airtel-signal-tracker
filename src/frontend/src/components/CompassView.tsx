import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { bearingToDirection } from "../utils/geo";

interface CompassViewProps {
  bearing: number;
  deviceHeading: number | null;
  towerName: string;
  distanceKm: number;
  isOptimal: boolean;
}

export function CompassView({
  bearing,
  deviceHeading,
  towerName,
  distanceKm,
  isOptimal,
}: CompassViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const relativeAngle =
    deviceHeading !== null ? (bearing - deviceHeading + 360) % 360 : bearing;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 8;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#d9dee6";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r - 16, 0, Math.PI * 2);
    ctx.strokeStyle = "#eef2f5";
    ctx.lineWidth = 1;
    ctx.stroke();

    const labels = [
      { text: "N", angle: -90 },
      { text: "NE", angle: -45 },
      { text: "E", angle: 0 },
      { text: "SE", angle: 45 },
      { text: "S", angle: 90 },
      { text: "SW", angle: 135 },
      { text: "W", angle: 180 },
      { text: "NW", angle: -135 },
    ];

    for (const { text, angle } of labels) {
      const rad = (angle * Math.PI) / 180;
      const lx = cx + (r - 10) * Math.cos(rad);
      const ly = cy + (r - 10) * Math.sin(rad);
      ctx.font =
        text.length === 1 ? "bold 13px sans-serif" : "bold 10px sans-serif";
      ctx.fillStyle = text === "N" ? "#e10b0b" : "#444a52";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, lx, ly);
    }

    for (let i = 0; i < 72; i++) {
      const ang = (i * 5 * Math.PI) / 180;
      const isMajor = i % 9 === 0;
      const tickLen = isMajor ? 10 : 5;
      const innerR = r - 22;
      const outerR = r - 22 + tickLen;
      ctx.beginPath();
      ctx.moveTo(
        cx + innerR * Math.cos(ang - Math.PI / 2),
        cy + innerR * Math.sin(ang - Math.PI / 2),
      );
      ctx.lineTo(
        cx + outerR * Math.cos(ang - Math.PI / 2),
        cy + outerR * Math.sin(ang - Math.PI / 2),
      );
      ctx.strokeStyle = isMajor ? "#888" : "#ccc";
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#e10b0b";
    ctx.fill();
  }, []);

  const direction = bearingToDirection(bearing);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 220, height: 220 }}>
        <canvas
          ref={canvasRef}
          width={220}
          height={220}
          className="absolute inset-0"
        />

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: "none" }}
        >
          <motion.div
            animate={{ rotate: relativeAngle }}
            transition={{ type: "spring", stiffness: 60, damping: 18 }}
            style={{ originX: "50%", originY: "50%" }}
          >
            <svg
              width="40"
              height="100"
              viewBox="0 0 40 100"
              role="img"
              aria-label="Compass arrow"
            >
              <title>Compass arrow</title>
              <polygon
                points="20,4 32,50 20,44 8,50"
                fill="#e10b0b"
                className={isOptimal ? "compass-arrow-pulse" : ""}
              />
              <polygon points="20,96 32,50 20,56 8,50" fill="#c0c8d0" />
            </svg>
          </motion.div>
        </div>

        {isOptimal && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 rounded-full border-4 border-signal-green shadow-lg"
          />
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
          LIVE DIRECTION
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-bold font-display text-foreground">
            {direction}
          </span>
          <span className="text-xl font-semibold text-muted-foreground">
            {bearing.toFixed(0)}°
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">→ {towerName}</p>
        <p className="text-xs text-muted-foreground">
          {distanceKm.toFixed(1)} km away
        </p>

        {isOptimal && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-2 inline-flex items-center gap-1 bg-signal-green/10 border border-signal-green/30 text-signal-green text-xs font-bold px-3 py-1 rounded-full"
          >
            ✅ OPTIMAL DIRECTION REACHED
          </motion.div>
        )}

        {deviceHeading === null && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            Compass unavailable — showing tower bearing only
          </p>
        )}
      </div>
    </div>
  );
}
