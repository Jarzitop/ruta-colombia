import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import { StyleSheet, View } from 'react-native';
import type { TransitDataset, Stop } from '../data/contract';
import type { DirectItinerary } from '../routing/direct';
import { boundsForStops } from './viewport';

// Self-contained schematic: zero external sources, fonts or tile requests.
// A licensed street-map provider can be added separately later.
const LOCAL_STYLE = {
  version: 8 as const,
  name: 'Ruta Colombia - esquema sin conexión',
  sources: {},
  layers: [{
    id: 'offline-background',
    type: 'background' as const,
    paint: { 'background-color': '#EFF6FF' },
  }],
};

function stopMarker(stop: Stop | undefined) {
  if (!stop) return null;
  return {
    type: 'Feature' as const,
    properties: { id: stop.id },
    geometry: {
      type: 'Point' as const,
      coordinates: [stop.longitude, stop.latitude],
    },
  };
}

export interface TransitMapProps {
  dataset: TransitDataset;
  cityId: string | null;
  originStopId: string | null;
  destinationStopId: string | null;
  itinerary: DirectItinerary | null;
  /** Highlight only known stops in the chosen segment; never infer roads. */
  highlightedStopIds: string[] | null;
  onMapLoaded: () => void;
  onMapFailed: () => void;
}

export function TransitMap({
  dataset, cityId, originStopId, destinationStopId,
  itinerary, highlightedStopIds, onMapLoaded, onMapFailed,
}: TransitMapProps) {
  const cityStops = dataset.stops.filter((stop) => !cityId || stop.cityId === cityId);
  const wanted = highlightedStopIds ?? itinerary?.stopIds ??
    [originStopId, destinationStopId].filter((id): id is string => id !== null);
  const focusIds = wanted.length ? wanted : cityStops.map((stop) => stop.id);
  const bounds = boundsForStops(dataset, focusIds);

  const currentPattern = itinerary
    ? dataset.patterns.find((pattern) => pattern.id === itinerary.patternId)
    : undefined;

  // Only draw route geometry when the requested trip covers the entire
  // documented pattern. Slicing a polyline by stop order would invent shape.
  const wholePattern = Boolean(itinerary && currentPattern &&
    itinerary.stopIds.length === currentPattern.stops.length &&
    itinerary.stopIds.every((id, index) => currentPattern.stops[index]?.stopId === id));
  const geometry = wholePattern ? currentPattern?.geometry : undefined;
  const routeFeature = geometry ? {
    type: 'Feature' as const,
    properties: { kind: 'verified-entire-pattern' },
    geometry: { type: 'LineString' as const, coordinates: geometry.coordinates },
  } : null;

  const allStopFeatures = {
    type: 'FeatureCollection' as const,
    features: cityStops.map((stop) => ({
      type: 'Feature' as const,
      properties: { id: stop.id, name: stop.name },
      geometry: {
        type: 'Point' as const,
        coordinates: [stop.longitude, stop.latitude],
      },
    })),
  };
  const selectedIds = new Set(highlightedStopIds ?? []);
  const selectedStopFeatures = {
    type: 'FeatureCollection' as const,
    features: cityStops.filter((stop) => selectedIds.has(stop.id)).map((stop) => ({
      type: 'Feature' as const,
      properties: { id: stop.id },
      geometry: {
        type: 'Point' as const,
        coordinates: [stop.longitude, stop.latitude],
      },
    })),
  };
  const origin = stopMarker(dataset.stops.find((stop) => stop.id === originStopId && stop.cityId === cityId));
  const destination = stopMarker(dataset.stops.find((stop) => stop.id === destinationStopId && stop.cityId === cityId));

  return (
    <View style={styles.frame}>
      <Map
        style={styles.map}
        mapStyle={LOCAL_STYLE}
        androidView="texture"
        attribution={false}
        logo={false}
        compass={false}
        dragPan
        touchZoom
        doubleTapZoom
        onDidFinishLoadingMap={onMapLoaded}
        onDidFailLoadingMap={onMapFailed}
      >
        {bounds && (
          <Camera
            key={focusIds.join(':')}
            initialViewState={{
              bounds,
              padding: { top: 30, right: 30, bottom: 30, left: 30 },
            }}
          />
        )}

        {routeFeature && (
          <GeoJSONSource id="route-pattern" data={routeFeature}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#6D28D9',
                'line-width': 4,
                'line-opacity': 0.9,
              }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
          </GeoJSONSource>
        )}

        <GeoJSONSource id="catalog-stops" data={allStopFeatures}>
          <Layer
            id="catalog-stop-circles"
            type="circle"
            paint={{
              'circle-radius': 6,
              'circle-color': '#FFFFFF',
              'circle-stroke-color': '#6D28D9',
              'circle-stroke-width': 2,
            }}
          />
        </GeoJSONSource>

        {selectedStopFeatures.features.length > 0 && (
          <GeoJSONSource id="chosen-trip-stops" data={selectedStopFeatures}>
            <Layer
              id="chosen-trip-markers"
              type="circle"
              paint={{
                'circle-radius': 9,
                'circle-color': '#DDD6FE',
                'circle-stroke-color': '#6D28D9',
                'circle-stroke-width': 2,
              }}
            />
          </GeoJSONSource>
        )}

        {origin && (
          <GeoJSONSource id="trip-origin" data={origin}>
            <Layer
              id="trip-origin-marker"
              type="circle"
              paint={{
                'circle-radius': 9,
                'circle-color': '#16A34A',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#FFFFFF',
              }}
            />
          </GeoJSONSource>
        )}
        {destination && (
          <GeoJSONSource id="trip-destination" data={destination}>
            <Layer
              id="trip-destination-marker"
              type="circle"
              paint={{
                'circle-radius': 9,
                'circle-color': '#EA580C',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#FFFFFF',
              }}
            />
          </GeoJSONSource>
        )}
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1, minHeight: 120, overflow: 'hidden', borderRadius: 12,
    backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#CBD5E1',
  },
  map: { flex: 1 },
});
