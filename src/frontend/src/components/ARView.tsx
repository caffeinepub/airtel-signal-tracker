import { Button } from "@/components/ui/button";
import { AlertCircle, Camera, CameraOff } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { bearingToDirection } from "../utils/geo";

interface ARViewProps {
  bearing: number;
  relativeAngle: number;
  rssi: number;
  towerName: string;
  isOptimal: boolean;
}

// Feature V10-13: AR Distance Rings
function DistanceRings({ towerDistanceKm }: { towerDistanceKm: number }) {
  const rings = [
    { km: 0.5, color: "white", strokeWidth: 1.5, r: 60 },
    { km: 1, color: "#facc15", strokeWidth: 1.5, r: 100 },
    { km: 2, color: "#f97316", strokeWidth: 2, r: 140 },
  ];

  const nearestRingIdx = rings.reduce((best, ring, i) => {
    const prev = rings[best];
    return Math.abs(ring.km - towerDistanceKm) <
      Math.abs(prev.km - towerDistanceKm)
      ? i
      : best;
  }, 0);

  return (
    <svg
      viewBox="0 0 300 300"
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
      role="img"
      aria-label="AR distance rings"
    >
      <title>Distance rings</title>
      {rings.map((ring, i) => (
        <g key={ring.km}>
          <circle
            cx={150}
            cy={150}
            r={ring.r}
            fill="none"
            stroke={ring.color}
            strokeWidth={
              i === nearestRingIdx ? ring.strokeWidth + 1.5 : ring.strokeWidth
            }
            opacity={i === nearestRingIdx ? 1 : 0.5}
            strokeDasharray={i === nearestRingIdx ? "none" : "6,4"}
          />
          {i === nearestRingIdx && (
            <circle
              cx={150}
              cy={150}
              r={ring.r}
              fill="none"
              stroke={ring.color}
              strokeWidth={4}
              opacity={0.3}
              className="animate-ping"
            />
          )}
          <text
            x={150 + ring.r - 6}
            y={150 + 4}
            textAnchor="middle"
            fontSize={10}
            fill={ring.color}
            fontWeight="bold"
            opacity={0.8}
          >
            {ring.km}km
          </text>
        </g>
      ))}
    </svg>
  );
}

// Feature V10-14: AR Signal Strength Overlay
function SignalDirectionOverlay({ relativeAngle }: { relativeAngle: number }) {
  // Green = toward tower (relativeAngle near 0), yellow = ±30°, red = opposite
  const towardTower = relativeAngle <= 15 || relativeAngle >= 345;
  const nearTower =
    (relativeAngle <= 30 && relativeAngle > 15) ||
    (relativeAngle >= 330 && relativeAngle < 345);

  const gradientId = "signal-gradient";

  return (
    <svg
      viewBox="0 0 300 300"
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
      role="img"
      aria-label="Signal direction overlay"
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="100%" r="80%">
          <stop
            offset="0%"
            stopColor={
              towardTower ? "#22c55e" : nearTower ? "#facc15" : "#ef4444"
            }
            stopOpacity={0.4}
          />
          <stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* Bottom half gradient arc */}
      <ellipse
        cx={150}
        cy={260}
        rx={130}
        ry={80}
        fill={`url(#${gradientId})`}
      />
      {/* Direction text label */}
      <text
        x={150}
        y={290}
        textAnchor="middle"
        fontSize={11}
        fill={towardTower ? "#22c55e" : nearTower ? "#facc15" : "#ef4444"}
        fontWeight="bold"
      >
        {towardTower
          ? "↑ Tower Direction"
          : nearTower
            ? "↗ Almost aligned"
            : "← Rotate toward tower"}
      </text>
    </svg>
  );
}

export function ARView({
  bearing,
  relativeAngle,
  rssi,
  towerName,
  isOptimal,
}: ARViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  // Mock tower distance for rings (in a real app, pass as prop)
  const towerDistanceKm = 1.5;

  const startAR = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setStream(mediaStream);
      setIsActive(true);
    } catch (err) {
      const e = err as Error;
      if (e.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access.");
      } else if (e.name === "NotFoundError") {
        setError("No rear camera found on this device.");
      } else {
        setError(`Camera unavailable: ${e.message}`);
      }
    }
  };

  const stopAR = () => {
    if (stream) {
      for (const t of stream.getTracks()) t.stop();
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        for (const t of stream.getTracks()) t.stop();
      }
    };
  }, [stream]);

  const direction = bearingToDirection(bearing);

  if (!isActive) {
    return (
      <div
        data-ocid="ar.panel"
        className="flex flex-col items-center justify-center min-h-[400px] bg-card rounded-2xl border border-border p-8 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Camera className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold font-display mb-2">AR Camera Mode</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Point your phone toward the direction shown on the compass. The AR
          overlay will guide you to the optimal antenna direction.
        </p>

        {/* Preview of AR features */}
        <div className="w-full max-w-xs text-left space-y-2 mb-6">
          <p className="text-xs font-semibold text-foreground">AR Overlays:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "◯", text: "Distance rings (0.5/1/2km)" },
              { icon: "🟢", text: "Signal direction gradient" },
              { icon: "↑", text: "Rotating bearing arrow" },
              { icon: "✅", text: "Optimal zone indicator" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span className="text-base">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div
            data-ocid="ar.error_state"
            className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4 w-full"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <Button
          data-ocid="ar.start.button"
          className="btn-airtel w-full max-w-xs h-12 text-base font-bold rounded-full"
          onClick={startAR}
        >
          <Camera className="w-5 h-5 mr-2" />
          Activate AR Camera
        </Button>
      </div>
    );
  }

  return (
    <div
      data-ocid="ar.active.panel"
      className="relative rounded-2xl overflow-hidden bg-black"
      style={{ minHeight: 400 }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        style={{ minHeight: 400 }}
      />

      {/* Feature V10-13: Distance rings overlay */}
      <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
        <DistanceRings towerDistanceKm={towerDistanceKm} />
      </div>

      {/* Feature V10-14: Signal strength direction overlay */}
      <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
        <SignalDirectionOverlay relativeAngle={relativeAngle} />
      </div>

      <div
        className="absolute inset-0 flex flex-col items-center justify-between p-6"
        style={{ pointerEvents: "none" }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full flex items-center justify-between bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2"
        >
          <span className="text-white text-sm font-bold">{towerName}</span>
          <span className="text-white text-sm">{rssi.toFixed(0)} dBm</span>
        </motion.div>

        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: relativeAngle }}
            transition={{ type: "spring", stiffness: 60, damping: 18 }}
            className="bg-primary/80 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center shadow-lg"
          >
            <svg
              viewBox="0 0 40 40"
              width="40"
              height="40"
              role="img"
              aria-label="Direction arrow"
            >
              <title>Direction arrow</title>
              <polygon points="20,4 30,30 20,24 10,30" fill="white" />
            </svg>
          </motion.div>
          <div className="mt-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-white font-bold text-lg">
              {direction} {bearing.toFixed(0)}°
            </span>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full"
          style={{ pointerEvents: "auto" }}
        >
          {isOptimal && (
            <div className="text-center mb-3">
              <span className="bg-signal-green/80 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                ✅ OPTIMAL — Hold steady!
              </span>
            </div>
          )}
          <div className="flex items-center justify-between bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2">
            <p className="text-white/80 text-xs">Point antenna toward arrow</p>
            <Button
              data-ocid="ar.stop.button"
              size="sm"
              variant="secondary"
              onClick={stopAR}
              className="h-8"
            >
              <CameraOff className="w-3 h-3 mr-1" />
              Exit AR
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
