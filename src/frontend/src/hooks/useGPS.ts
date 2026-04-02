import { useEffect, useState } from "react";

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type GPSStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "fallback";

const MOROTO_FALLBACK: GPSPosition = {
  latitude: 2.5341,
  longitude: 34.6622,
  accuracy: 0,
};

interface UseGPSOptions {
  batterySaver?: boolean;
}

export function useGPS(options?: UseGPSOptions) {
  const [position, setPosition] = useState<GPSPosition>(MOROTO_FALLBACK);
  const [status, setStatus] = useState<GPSStatus>("idle");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      setPosition(MOROTO_FALLBACK);
      return;
    }

    setStatus("requesting");

    const gpsOptions: PositionOptions = options?.batterySaver
      ? { enableHighAccuracy: false, timeout: 60000, maximumAge: 30000 }
      : { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus("granted");
      },
      (err) => {
        console.warn("GPS error:", err);
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
        } else {
          setStatus("fallback");
        }
        setPosition(MOROTO_FALLBACK);
      },
      gpsOptions,
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [options?.batterySaver]);

  return { position, status };
}
