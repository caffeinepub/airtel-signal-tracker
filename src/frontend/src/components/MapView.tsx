import { useEffect, useRef, useState } from "react";
import type { Tower } from "../backend.d";
import type { GPSPosition } from "../hooks/useGPS";

interface MapViewProps {
  userPosition: GPSPosition;
  towers: Tower[];
  nearestTower: Tower | null;
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

interface LeafletStatic {
  map(el: HTMLElement, options?: object): LMap;
  tileLayer(url: string, options?: object): LTileLayer;
  divIcon(options: object): LIcon;
  marker(latlng: [number, number], options?: object): LMarker;
  polyline(latlngs: Array<[number, number]>, options?: object): LPolyline;
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

export function MapView({ userPosition, towers, nearestTower }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LMap | null>(null);
  const layersRef = useRef<unknown[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Effect 1: Init map once on mount ──────────────────────────────────────
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

  // ── Effect 2: Re-draw markers + line whenever position / towers change ────
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

    // Blue pulsing dot — user location
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

    // Red satellite icons — all towers
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

    // Bold bright-red line from user → nearest tower
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
          // Animated dash offset via CSS on the SVG path is not natively
          // supported in Leaflet, so we use a solid line for maximum clarity.
        },
      ).addTo(map);
      layersRef.current.push(line);
    }
  }, [userPosition, towers, nearestTower]);

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
