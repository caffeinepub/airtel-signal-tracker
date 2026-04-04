import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SignalPosition {
    latitude: number;
    compassHeading: number;
    longitude: number;
    timestamp: bigint;
    tiltAngle: number;
    heightRecommendation: bigint;
    rssiDbm: bigint;
}
export interface TowerStatusLog {
    latencyMs: bigint;
    timestamp: bigint;
    towerName: string;
    reachable: boolean;
}
export interface CoverageGapReport {
    id: bigint;
    latitude: number;
    description: string;
    longitude: number;
    timestamp: bigint;
}
export interface CommunitySignalReport {
    id: bigint;
    latitude: number;
    quality: SignalQuality;
    note?: string;
    longitude: number;
    timestamp: bigint;
}
export interface Tower {
    region: string;
    latitude: number;
    name: string;
    longitude: number;
}
export enum SignalQuality {
    Good = "Good",
    None = "None",
    Weak = "Weak",
    Excellent = "Excellent"
}
export interface backendInterface {
    addCommunitySignalReport(latitude: number, longitude: number, quality: SignalQuality, note: string | null): Promise<bigint>;
    addCoverageGapReport(latitude: number, longitude: number, description: string): Promise<bigint>;
    addTower(name: string, region: string, latitude: number, longitude: number): Promise<void>;
    addTowerStatusLog(towerName: string, reachable: boolean, latencyMs: bigint): Promise<bigint>;
    clearCommunitySignalReports(): Promise<void>;
    clearOldTowerStatusLogs(olderThanSeconds: bigint): Promise<void>;
    clearSignalPositions(): Promise<void>;
    getAllAppSettings(): Promise<Array<[string, string]>>;
    getAllTowerStatusLogs(): Promise<Array<TowerStatusLog>>;
    getAppSetting(key: string): Promise<string | null>;
    getCommunitySignalReports(): Promise<Array<CommunitySignalReport>>;
    getCoverageGapReports(): Promise<Array<CoverageGapReport>>;
    getSignalPositions(): Promise<Array<SignalPosition>>;
    getTowerByName(name: string): Promise<Tower | null>;
    getTowers(): Promise<Array<Tower>>;
    saveSignalPosition(id: string, latitude: number, longitude: number, compassHeading: number, rssiDbm: bigint, heightRecommendation: bigint, tiltAngle: number): Promise<void>;
    setAppSetting(key: string, value: string): Promise<void>;
}
