import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import { StyleSheet, View } from 'react-native';
import syntheticJson from '../data/synthetic/dev.dataset.json';
import type { TransitDataset } from '../data/contract';
import type { DirectItinerary } from '../routing/direct';
import { boundsForStops } from './viewport';

// A network-free MapLibre background is not a street map. It is intentionally
// used until an online tile provider has been chosen and its terms checked.
const LOCAL_STYLE = {
  version: 8 as const,
  name: 'Ruta Colombia - base esquemática local',
  sources: {},
  layers: [{
    id: 'offline-background',
    type: 'background' as const,
    paint: { 'background-color': '#EFF6FF' },
  }],
};

const dataset = syntheticJson as unknown as TransitDataset;
const pattern = dataset.patterns[0];
if (!pattern) throw new Error('Fixture sintético inválido: falta un patrón.');

const allStopFeatures = {
  type: 'FeatureCollection' as const,
  features: dataset.stops.map((stop) => ({
    type: 'Feature' as const,
    properties: { id: stop.id, name: stop.name },
    geometry: {
      type: 'Point' as const,
      coordinates: [stop.longitude, stop.latitude],
    },
  })),
};

function marker(stopId: string | null) {
  const stop = dataset.stops.find((item) => item.id === stopId);
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

interface SyntheticMapProps {
  cityId: string | null;
  originStopId: string | null;
  destinationStopId: string | null;
  itinerary: DirectItinerary | null;
  onMapLoaded: () => void;
  onMapFailed: () => void;
}

export function SyntheticMap({
  cityId, originStopId, destinationStopId, itinerary, onMapLoaded, onMapFailed,
}: SyntheticMapProps) {
  const cityStops = dataset.stops.filter((stop) => !cityId || stop.cityId === cityId);
  const requestedIds = itinerary?.stopIds ??
    [originStopId, destinationStopId].filter((id): id is string => id !== null);
  const focusIds = requestedIds.length ? requestedIds : cityStops.map((stop) => stop.id);
  const bounds = boundsForStops(dataset, focusIds);

  // Never present a full documented geometry as the partial trip's geometry.
  const exactFullPattern = itinerary !== null && itinerary.patternId === pattern!.id &&
    itinerary.stopIds.length === pattern!.stops.length &&
    itinerary.stopIds.every((id, index) => id === pattern!.stops[index]?.stopId);
  const showFullReference = itinerary === null;
  const showLine = (exactFullPattern || showFullReference) && pattern!.geometry?.coordinates;

  const routeFeature = showLine ? {
    type: 'Feature' as const,
    properties: { kind: exactFullPattern ? 'complete-trip' : 'full-pattern-reference' },
    geometry: { type: 'LineString' as const, coordinates: pattern!.geometry!.coordinates },
  } : null;

  const origin = marker(originStopId);
  const destination = marker(destinationStopId);

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
          <GeoJSONSource id="dev-route" data={routeFeature}>
            <Layer
              id="dev-route-line"
              type="line"
              paint={{
                'line-color': '#6D28D9',
                'line-width': 4,
                'line-opacity': exactFullPattern ? 0.9 : 0.35,
              }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
          </GeoJSONSource>
        )}

        <GeoJSONSource id="dev-stops" data={allStopFeatures}>
          <Layer
            id="dev-stop-circles"
            type="circle"
            paint={{
              'circle-radius': 6,
              'circle-color': '#FFFFFF',
              'circle-stroke-color': '#6D28D9',
              'circle-stroke-width': 2,
            }}
          />
        </GeoJSONSource>

        {origin && (
          <GeoJSONSource id="dev-origin" data={origin}>
            <Layer
              id="dev-origin-marker"
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
          <GeoJSONSource id="dev-destination" data={destination}>
            <Layer
              id="dev-destination-marker"
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
    flex: 1,
    minHeight: 120,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  map: { flex: 1 },
});
