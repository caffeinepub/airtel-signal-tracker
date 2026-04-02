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
export interface Tower {
    region: string;
    latitude: number;
    name: string;
    longitude: number;
}
export interface backendInterface {
    addTower(name: string, region: string, latitude: number, longitude: number): Promise<void>;
    clearSignalPositions(): Promise<void>;
    getAllAppSettings(): Promise<Array<[string, string]>>;
    getAppSetting(key: string): Promise<string | null>;
    getSignalPositions(): Promise<Array<SignalPosition>>;
    getTowerByName(name: string): Promise<Tower | null>;
    getTowers(): Promise<Array<Tower>>;
    saveSignalPosition(id: string, latitude: number, longitude: number, compassHeading: number, rssiDbm: bigint, heightRecommendation: bigint, tiltAngle: number): Promise<void>;
    setAppSetting(key: string, value: string): Promise<void>;
}
