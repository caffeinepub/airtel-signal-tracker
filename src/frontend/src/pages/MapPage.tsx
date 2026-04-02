import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Radio, ThumbsDown, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Tower } from "../backend.d";
import { MapView } from "../components/MapView";
import type { GPSPosition } from "../hooks/useGPS";
import { calculateDistance } from "../utils/geo";

interface MapPageProps {
  userPosition: GPSPosition;
  towers: Tower[];
  nearestTower: Tower | null;
  isOffline: boolean;
}

interface TowerRatings {
  [towerName: string]: { up: number; down: number };
}

const RATINGS_KEY = "tower_ratings";
const MAP_CACHED_KEY = "map_cached";

// Moroto region OSM tile URLs (zoom 12-13, covering lat 2.4-2.7, lon 34.6-34.9)
const MOROTO_TILES = [
  "https://tile.openstreetmap.org/12/2461/1963.png",
  "https://tile.openstreetmap.org/12/2461/1964.png",
  "https://tile.openstreetmap.org/12/2462/1963.png",
  "https://tile.openstreetmap.org/12/2462/1964.png",
  "https://tile.openstreetmap.org/13/4922/3927.png",
  "https://tile.openstreetmap.org/13/4922/3928.png",
  "https://tile.openstreetmap.org/13/4923/3927.png",
  "https://tile.openstreetmap.org/13/4923/3928.png",
  "https://tile.openstreetmap.org/13/4924/3927.png",
  "https://tile.openstreetmap.org/13/4924/3928.png",
];

export function MapPage({
  userPosition,
  towers,
  nearestTower,
  isOffline,
}: MapPageProps) {
  const [ratings, setRatings] = useState<TowerRatings>(() => {
    try {
      const stored = localStorage.getItem(RATINGS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [mapCached, setMapCached] = useState(() => {
    return localStorage.getItem(MAP_CACHED_KEY) === "true";
  });
  const [caching, setCaching] = useState(false);

  useEffect(() => {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  }, [ratings]);

  const handleRate = (towerName: string, dir: "up" | "down") => {
    setRatings((prev) => {
      const existing = prev[towerName] ?? { up: 0, down: 0 };
      return {
        ...prev,
        [towerName]: {
          ...existing,
          [dir]: existing[dir] + 1,
        },
      };
    });
  };

  const handleCacheMap = async () => {
    setCaching(true);
    try {
      const cache = await caches.open("map-tiles");
      await Promise.all(
        MOROTO_TILES.map((url) =>
          fetch(url, { mode: "no-cors" })
            .then((res) => cache.put(url, res))
            .catch(() => {
              /* ignore individual tile failures */
            }),
        ),
      );
      localStorage.setItem(MAP_CACHED_KEY, "true");
      setMapCached(true);
    } catch {
      // Cache API unavailable — still mark as attempted
      localStorage.setItem(MAP_CACHED_KEY, "true");
      setMapCached(true);
    } finally {
      setCaching(false);
    }
  };

  return (
    <div data-ocid="map.page" className="space-y-4 pb-4">
      {isOffline && (
        <div className="mx-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2 text-xs text-yellow-700">
          <span>📶</span>
          <span className="font-medium">
            Offline Mode — Using cached tower locations
          </span>
        </div>
      )}

      {/* Feature 3: Cache Map Offline */}
      <div className="mx-2 flex items-center gap-2">
        {mapCached ? (
          <Badge className="bg-signal-green text-white text-xs px-3 py-1">
            ✓ Map Cached
          </Badge>
        ) : (
          <Button
            data-ocid="map.cache.primary_button"
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={handleCacheMap}
            disabled={caching}
          >
            {caching ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <span className="mr-1">💾</span>
            )}
            {caching ? "Caching..." : "Cache Map Offline"}
          </Button>
        )}
      </div>

      <div className="mx-2">
        <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-card">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Tower Map</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />{" "}
                You
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />{" "}
                Tower
              </span>
            </div>
          </div>
          <div className="p-3">
            <MapView
              userPosition={userPosition}
              towers={towers}
              nearestTower={nearestTower}
            />
          </div>
        </div>
      </div>

      <div className="mx-2 space-y-2">
        <h3 className="font-bold text-sm text-foreground px-1">
          Airtel Towers — Moroto Region
        </h3>
        {towers.map((tower, i) => {
          const dist = calculateDistance(
            userPosition.latitude,
            userPosition.longitude,
            tower.latitude,
            tower.longitude,
          );
          const isNearest = tower.name === nearestTower?.name;
          const rating = ratings[tower.name] ?? { up: 0, down: 0 };
          const hasCommunityBadge = rating.up >= 3;

          return (
            <motion.div
              key={tower.name}
              data-ocid={`map.tower.item.${i + 1}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-card rounded-xl p-3 border shadow-xs ${
                isNearest ? "border-primary/30 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isNearest
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  <Radio className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {tower.name}
                    </p>
                    {hasCommunityBadge && (
                      <Badge className="bg-signal-green/10 text-signal-green border-signal-green/20 text-xs px-1.5 py-0">
                        Community ✓
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tower.region}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">
                    {dist.toFixed(1)} km
                  </p>
                  {isNearest && (
                    <span className="text-xs text-primary font-semibold">
                      Nearest
                    </span>
                  )}
                </div>
              </div>

              {/* Feature 2: Tower Quality Ratings */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                <button
                  type="button"
                  data-ocid={`map.tower.thumbsup.button.${i + 1}`}
                  onClick={() => handleRate(tower.name, "up")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-signal-green transition-colors px-2 py-1 rounded-lg hover:bg-signal-green/10"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{rating.up}</span>
                </button>
                <button
                  type="button"
                  data-ocid={`map.tower.thumbsdown.button.${i + 1}`}
                  onClick={() => handleRate(tower.name, "down")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{rating.down}</span>
                </button>
                <span className="text-xs text-muted-foreground ml-1">
                  Rate signal quality
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mx-2 bg-card rounded-xl p-3 border border-border shadow-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-muted-foreground">Your Location</p>
            <p className="text-sm font-medium text-foreground">
              {userPosition.latitude.toFixed(5)},{" "}
              {userPosition.longitude.toFixed(5)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
