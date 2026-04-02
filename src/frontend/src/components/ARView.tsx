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
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Point your phone toward the direction shown on the compass. The AR
          overlay will guide you to the optimal antenna direction.
        </p>
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
