import { useCallback, useEffect, useState } from "react";

export interface CompassData {
  heading: number | null;
  supported: boolean;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
}

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>;
};

type DeviceOrientationEventWithWebkit = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

export function useCompass(): CompassData {
  const [heading, setHeading] = useState<number | null>(null);
  const [supported, setSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const iosHeading = (event as DeviceOrientationEventWithWebkit)
      .webkitCompassHeading;
    if (iosHeading !== undefined && iosHeading !== null) {
      setHeading(iosHeading);
    } else if (event.alpha !== null) {
      const h = (360 - event.alpha) % 360;
      setHeading(h);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      setSupported(true);
      const DevOr =
        DeviceOrientationEvent as DeviceOrientationEventWithPermission;
      if (typeof DevOr.requestPermission !== "function") {
        window.addEventListener("deviceorientation", handleOrientation, true);
        setPermissionGranted(true);
        return () =>
          window.removeEventListener(
            "deviceorientation",
            handleOrientation,
            true,
          );
      }
    } else {
      setSupported(false);
    }
    return undefined;
  }, [handleOrientation]);

  const requestPermission = useCallback(async () => {
    const DevOr =
      DeviceOrientationEvent as DeviceOrientationEventWithPermission;
    if (typeof DevOr.requestPermission === "function") {
      try {
        const result = await DevOr.requestPermission();
        if (result === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
          setPermissionGranted(true);
        }
      } catch (e) {
        console.warn("DeviceOrientation permission error:", e);
      }
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true);
      setPermissionGranted(true);
    }
  }, [handleOrientation]);

  return { heading, supported, permissionGranted, requestPermission };
}
