import { useEffect, useRef, useState } from "react";
import type {
  CommunitySignalReport,
  CoverageGapReport,
  Tower,
} from "../backend.d";
import { SignalQuality } from "../backend.d";
import type { GPSPosition } from "../hooks/useGPS";

export interface NearbyUser {
  lat: number;
  lon: number;
  rssi: number;
}

interface MapViewProps {
  userPosition: GPSPosition;
  towers: Tower[];
  nearestTower: Tower | null;
  communityReports?: CommunitySignalReport[];
  gapReports?: CoverageGapReport[];
  showHeatmap?: boolean;
  nearbyUsers?: NearbyUser[];
}

// Minimal Leaflet types we need (loaded via CDN)
interface LMap {
  remove(): void;
  setView(center: [number, number], zoom?: number): LMap;
  removeLayer(layer: unknown): LMap;
}

interface LIcon {
  options: unknown;
}

interface LMarker {
  addTo(map: LMap): LMarker;
  bindPopup(content: string): LMarker;
}

interface LPolyline {
  addTo(map: LMap): LPolyline;
}

interface LTileLayer {
  addTo(map: LMap): LTileLayer;
}

interface LCircle {
  addTo(map: LMap): LCircle;
  bindPopup(content: string): LCircle;
}

interface LeafletStatic {
  map(el: HTMLElement, options?: object): LMap;
  tileLayer(url: string, options?: object): LTileLayer;
  divIcon(options: object): LIcon;
  marker(latlng: [number, number], options?: object): LMarker;
  polyline(latlngs: Array<[number, number]>, options?: object): LPolyline;
  circle(latlng: [number, number], options?: object): LCircle;
}

function getLeafletFromWindow(): LeafletStatic | null {
  return (
    ((window as unknown as Record<string, unknown>).L as LeafletStatic) ?? null
  );
}

function loadLeafletCdn(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (getLeafletFromWindow()) {
      resolve();
      return;
    }
    const existing = document.querySelector("script[src*='leaflet']");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function qualityToColor(quality: SignalQuality): string {
  switch (quality) {
    case SignalQuality.Excellent:
      return "#22c55e";
    case SignalQuality.Good:
      return "#86efac";
    case SignalQuality.Weak:
      return "#facc15";
    case SignalQuality.None:
      return "#ef4444";
    default:
      return "#94a3b8";
  }
}

// Generate deterministic nearby users from tower positions
export function generateNearbyUsers(towers: Tower[]): NearbyUser[] {
  const users: NearbyUser[] = [];
  for (const tower of towers) {
    const seed = Math.floor(tower.latitude * 1000);
    const count = 1 + (seed % 2); // 1-2 per tower
    for (let i = 0; i < count; i++) {
      const pseudoRand1 = ((seed * 9301 + 49297 * i) % 233280) / 233280;
      const pseudoRand2 = ((seed * 6673 + 47291 * (i + 1)) % 233280) / 233280;
      const pseudoRand3 = ((seed * 3513 + 91011 * (i + 2)) % 233280) / 233280;
      users.push({
        lat: tower.latitude + (pseudoRand1 - 0.5) * 0.04,
        lon: tower.longitude + (pseudoRand2 - 0.5) * 0.04,
        rssi: -70 - Math.floor(pseudoRand3 * 30),
      });
    }
  }
  return users;
}

export function MapView({
  userPosition,
  towers,
  nearestTower,
  communityReports = [],
  gapReports = [],
  showHeatmap = false,
  nearbyUsers = [],
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LMap | null>(null);
  const layersRef = useRef<unknown[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Effect 1: Init map once on mount ──────────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: map is initialized once
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapRef.current) return;

      if (!document.querySelector("link[href*='leaflet']")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      try {
        await loadLeafletCdn();
        const L = getLeafletFromWindow();
        if (!L) throw new Error("Leaflet not available");
        if (!isMounted || !mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
          center: [userPosition.latitude, userPosition.longitude],
          zoom: 12,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "\u00a9 OpenStreetMap",
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;
        if (isMounted) setIsLoading(false);
      } catch (err) {
        console.error("Map load error:", err);
        if (isMounted) {
          setMapError("Map unavailable \u2014 tower locations shown below");
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ── Effect 2: Re-draw markers + line whenever data changes ──────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const L = getLeafletFromWindow();
    if (!L) return;

    // Clear previously added layers
    for (const layer of layersRef.current) {
      map.removeLayer(layer);
    }
    layersRef.current = [];

    // Re-center map to user position
    map.setView([userPosition.latitude, userPosition.longitude]);

    // —— Nearby simulated users (gray dots) ——
    for (const user of nearbyUsers) {
      const userDotHtml = `<div style="width:10px;height:10px;background:#94a3b8;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`;
      const userDotIcon = L.divIcon({
        html: userDotHtml,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
        className: "",
      });
      const dot = L.marker([user.lat, user.lon], { icon: userDotIcon })
        .addTo(map)
        .bindPopup(`Anonymous user \u2014 ${user.rssi} dBm`);
      layersRef.current.push(dot);
    }

    // —— Heatmap circles from community reports ——
    if (showHeatmap) {
      for (const report of communityReports) {
        const color = qualityToColor(report.quality);
        const circle = L.circle([report.latitude, report.longitude], {
          radius: 300,
          color,
          fillColor: color,
          fillOpacity: 0.3,
          weight: 1,
        }).addTo(map);
        layersRef.current.push(circle);
      }
    }

    // —— Community report pins (colored small circles) ——
    for (const report of communityReports) {
      const color = qualityToColor(report.quality);
      const pinHtml = `<div style="width:12px;height:12px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`;
      const pinIcon = L.divIcon({
        html: pinHtml,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        className: "",
      });
      const marker = L.marker([report.latitude, report.longitude], {
        icon: pinIcon,
      })
        .addTo(map)
        .bindPopup(
          `Signal: ${report.quality}${report.note ? `<br>${report.note}` : ""}`,
        );
      layersRef.current.push(marker);
    }

    // —— Gap report X markers (orange) ——
    for (const gap of gapReports) {
      const gapHtml = `<div style="width:16px;height:16px;background:#f97316;border:2px solid white;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:white;box-shadow:0 1px 4px rgba(0,0,0,0.3);">\u2715</div>`;
      const gapIcon = L.divIcon({
        html: gapHtml,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: "",
      });
      const gapMarker = L.marker([gap.latitude, gap.longitude], {
        icon: gapIcon,
      })
        .addTo(map)
        .bindPopup(`Dead zone: ${gap.description}`);
      layersRef.current.push(gapMarker);
    }

    // —— Blue pulsing dot — user location ——
    const userIcon = L.divIcon({
      html: `
        <div style="
          width:20px;height:20px;
          background:#2563eb;
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 0 0 4px rgba(37,99,235,0.35),0 2px 8px rgba(0,0,0,0.45);
          animation:user-pulse 1.8s ease-in-out infinite;
        "></div>
        <style>
          @keyframes user-pulse {
            0%,100%{box-shadow:0 0 0 4px rgba(37,99,235,0.35),0 2px 8px rgba(0,0,0,0.45);}
            50%{box-shadow:0 0 0 10px rgba(37,99,235,0.1),0 2px 8px rgba(0,0,0,0.45);}
          }
        </style>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: "",
    });

    const userMarker = L.marker(
      [userPosition.latitude, userPosition.longitude],
      { icon: userIcon },
    )
      .addTo(map)
      .bindPopup("\ud83d\udccd Your Location");
    layersRef.current.push(userMarker);

    // —— Red satellite icons — all towers ——
    const towerHtml =
      '<div style="width:26px;height:26px;background:#e10b0b;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.35);font-size:13px">\ud83d\udce1</div>';
    const towerIcon = L.divIcon({
      html: towerHtml,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      className: "",
    });

    for (const tower of towers) {
      const marker = L.marker([tower.latitude, tower.longitude], {
        icon: towerIcon,
      })
        .addTo(map)
        .bindPopup(`<b>${tower.name}</b><br>Region: ${tower.region}`);
      layersRef.current.push(marker);
    }

    // —— Bold bright-red line from user \u2192 nearest tower ——
    if (nearestTower) {
      const line = L.polyline(
        [
          [userPosition.latitude, userPosition.longitude],
          [nearestTower.latitude, nearestTower.longitude],
        ],
        {
          color: "#E10B0B",
          weight: 4,
          opacity: 0.92,
        },
      ).addTo(map);
      layersRef.current.push(line);
    }
  }, [
    userPosition,
    towers,
    nearestTower,
    communityReports,
    gapReports,
    showHeatmap,
    nearbyUsers,
  ]);

  if (mapError) {
    return (
      <div
        data-ocid="map.error_state"
        className="bg-card rounded-xl p-4 border border-border"
      >
        <p className="text-sm text-muted-foreground mb-3">{mapError}</p>
        <div className="space-y-2">
          {towers.map((tower, i) => (
            <div
              key={tower.name}
              data-ocid={`map.tower.item.${i + 1}`}
              className="flex items-center gap-2 text-sm"
            >
              <span className="text-base">📡</span>
              <span className="font-medium">{tower.name}</span>
              <span className="text-muted-foreground text-xs">
                ({tower.latitude.toFixed(4)}, {tower.longitude.toFixed(4)})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: 320 }}>
      {isLoading && (
        <div
          data-ocid="map.loading_state"
          className="absolute inset-0 flex items-center justify-center bg-secondary rounded-xl z-10"
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-xl" />
    </div>
  );
}
