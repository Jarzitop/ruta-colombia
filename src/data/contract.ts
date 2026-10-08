export type SourceKind = 'official' | 'secondary' | 'synthetic';

export interface SourceRef {
  id: string;
  kind: SourceKind;
  publisher: string;
  title: string;
  url?: string;
  consultedAt: string;
  publishedAt?: string;
  validFrom?: string;
  validTo?: string;
  license?: string;
  notes?: string;
}

export interface City {
  id: string;
  name: string;
  countryCode: 'CO';
  sourceRefIds: string[];
}

export interface Stop {
  id: string;
  cityId: string;
  name: string;
  latitude: number;
  longitude: number;
  sourceRefIds: string[];
}

export interface Route {
  id: string;
  cityId: string;
  publicCode?: string;
  name: string;
  operator?: string;
  sourceRefIds: string[];
}

export interface PatternStop {
  stopId: string;
  sequence: number;
  boardingAllowed: boolean;
  alightingAllowed: boolean;
}

export interface RoutePattern {
  id: string;
  cityId: string;
  routeId: string;
  directionId: string;
  headsign?: string;
  stops: PatternStop[];
  geometry?: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  sourceRefIds: string[];
}

export interface WalkingConnection {
  id: string;
  cityId: string;
  fromStopId: string;
  toStopId: string;
  bidirectional: boolean;
  distanceMeters: number;
  geometry?: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  sourceRefIds: string[];
}

export interface TransitDataset {
  schemaVersion: '0.1.0';
  datasetVersion: string;
  label: string;
  publishable: boolean;
  sourceRefs: SourceRef[];
  cities: City[];
  stops: Stop[];
  routes: Route[];
  patterns: RoutePattern[];
  walkingConnections: WalkingConnection[];
}
