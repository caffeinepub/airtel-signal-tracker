import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CommunitySignalReport,
  CoverageGapReport,
  SignalPosition,
  Tower,
  TowerStatusLog,
} from "../backend.d";
import { SignalQuality } from "../backend.d";
import { useActor } from "./useActor";

const TOWERS_CACHE_KEY = "airtel_towers_cache";
// Version key — bump this string to force a re-seed when tower coordinates change
const TOWERS_SEEDED_KEY = "airtel_towers_seeded_v2";

// Tower coordinates are offset from the GPS fallback point (2.5341, 34.6622)
// so that distance never reads 0.0 km when GPS is unavailable.
const SEED_TOWERS: Array<{
  name: string;
  region: string;
  lat: number;
  lon: number;
}> = [
  // ~0.6 km NE of town-center fallback
  { name: "Moroto Town Tower", region: "Moroto", lat: 2.5382, lon: 34.6681 },
  { name: "Kosiroi Hill Tower", region: "Moroto", lat: 2.598, lon: 34.715 },
  { name: "Lotome Tower", region: "Moroto", lat: 2.48, lon: 34.73 },
  { name: "Rupa Tower", region: "Moroto", lat: 2.61, lon: 34.69 },
  { name: "Nadunget Tower", region: "Moroto", lat: 2.56, lon: 34.75 },
];

export function useTowers() {
  const { actor, isFetching } = useActor();
  return useQuery<Tower[]>({
    queryKey: ["towers"],
    queryFn: async () => {
      if (actor) {
        try {
          const towers = await actor.getTowers();
          if (towers.length > 0) {
            localStorage.setItem(TOWERS_CACHE_KEY, JSON.stringify(towers));
            return towers;
          }
        } catch {
          // Fall through to cache
        }
      }
      const cached = localStorage.getItem(TOWERS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached) as Tower[];
      }
      return SEED_TOWERS.map((t) => ({
        name: t.name,
        region: t.region,
        latitude: t.lat,
        longitude: t.lon,
      }));
    },
    enabled: !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSeedTowers() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["seed-towers"],
    queryFn: async () => {
      if (!actor) return false;
      const alreadySeeded = localStorage.getItem(TOWERS_SEEDED_KEY);
      if (alreadySeeded === "true") return true;

      // Clear stale cache from old seed version so fresh coordinates are used
      localStorage.removeItem(TOWERS_CACHE_KEY);
      localStorage.removeItem("airtel_towers_seeded");

      try {
        const existing = await actor.getTowers();
        if (existing.length === 0) {
          await Promise.all(
            SEED_TOWERS.map((t) =>
              actor.addTower(t.name, t.region, t.lat, t.lon),
            ),
          );
          queryClient.invalidateQueries({ queryKey: ["towers"] });
        }
        localStorage.setItem(TOWERS_SEEDED_KEY, "true");
        const towers = await actor.getTowers();
        localStorage.setItem(TOWERS_CACHE_KEY, JSON.stringify(towers));
      } catch {
        const fallback = SEED_TOWERS.map((t) => ({
          name: t.name,
          region: t.region,
          latitude: t.lat,
          longitude: t.lon,
        }));
        localStorage.setItem(TOWERS_CACHE_KEY, JSON.stringify(fallback));
      }
      return true;
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useSignalPositions() {
  const { actor, isFetching } = useActor();
  return useQuery<SignalPosition[]>({
    queryKey: ["signal-positions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSignalPositions();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSavePosition() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      latitude: number;
      longitude: number;
      compassHeading: number;
      rssiDbm: number;
      heightRecommendation: number;
      tiltAngle: number;
    }) => {
      if (!actor) throw new Error("No actor available");
      const id = `pos-${Date.now()}`;
      await actor.saveSignalPosition(
        id,
        params.latitude,
        params.longitude,
        params.compassHeading,
        BigInt(Math.round(params.rssiDbm)),
        BigInt(Math.round(params.heightRecommendation)),
        params.tiltAngle,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signal-positions"] });
    },
  });
}

// ─── Community Signal Reports ─────────────────────────────────────────────────

export function useCommunitySignalReports() {
  const { actor, isFetching } = useActor();
  return useQuery<CommunitySignalReport[]>({
    queryKey: ["community-signal-reports"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCommunitySignalReports();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddCommunitySignalReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      latitude: number;
      longitude: number;
      quality: SignalQuality;
      note: string | null;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.addCommunitySignalReport(
        params.latitude,
        params.longitude,
        params.quality,
        params.note,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-signal-reports"] });
    },
  });
}

// ─── Coverage Gap Reports ─────────────────────────────────────────────────────

export function useCoverageGapReports() {
  const { actor, isFetching } = useActor();
  return useQuery<CoverageGapReport[]>({
    queryKey: ["coverage-gap-reports"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCoverageGapReports();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddCoverageGapReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      latitude: number;
      longitude: number;
      description: string;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.addCoverageGapReport(
        params.latitude,
        params.longitude,
        params.description,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coverage-gap-reports"] });
    },
  });
}

// ─── Tower Status Logs ────────────────────────────────────────────────────────

export function useTowerStatusLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<TowerStatusLog[]>({
    queryKey: ["tower-status-logs"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllTowerStatusLogs();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}

export function useAddTowerStatusLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      towerName: string;
      reachable: boolean;
      latencyMs: bigint;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.addTowerStatusLog(
        params.towerName,
        params.reachable,
        params.latencyMs,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tower-status-logs"] });
    },
  });
}

export { SignalQuality };
