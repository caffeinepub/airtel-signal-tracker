/**
 * Calculate bearing from point A to point B (degrees, 0=North, clockwise)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLon = toRad(lon2 - lon1);
  const la1 = toRad(lat1);
  const la2 = toRad(lat2);
  const y = Math.sin(dLon) * Math.cos(la2);
  const x =
    Math.cos(la1) * Math.sin(la2) -
    Math.sin(la1) * Math.cos(la2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Calculate distance between two lat/lon points in km (haversine)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate RSSI based on distance to tower
 */
export function estimateRSSI(distanceKm: number): number {
  let base: number;
  if (distanceKm < 2) {
    base = -70;
  } else if (distanceKm < 5) {
    base = -83;
  } else {
    base = -100;
  }
  return base + (Math.random() * 10 - 5);
}

/**
 * Get signal quality from RSSI
 */
export function getSignalQuality(rssi: number): "strong" | "moderate" | "weak" {
  if (rssi >= -75) return "strong";
  if (rssi >= -90) return "moderate";
  return "weak";
}

/**
 * Get recommended mounting height string
 */
export function getMountingHeight(distanceKm: number): string {
  if (distanceKm < 2) return "3-4 meters";
  if (distanceKm < 5) return "5-8 meters";
  return "8-12 meters";
}

/**
 * Get recommended mounting height in meters (number)
 */
export function getMountingHeightMeters(distanceKm: number): number {
  if (distanceKm < 2) return 3;
  if (distanceKm < 5) return 5;
  return 8;
}

/**
 * Convert bearing to compass direction label
 */
export function bearingToDirection(bearing: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(bearing / 45) % 8;
  return dirs[idx];
}

/**
 * Get signal bar count (1-5) from RSSI
 */
export function rssiToBars(rssi: number): number {
  if (rssi >= -70) return 5;
  if (rssi >= -78) return 4;
  if (rssi >= -85) return 3;
  if (rssi >= -92) return 2;
  return 1;
}
