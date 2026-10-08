import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import { StyleSheet, View } from 'react-native';
import datasetJson from '../data/synthetic/dev.dataset.json';

const dataset = datasetJson;
const pattern = dataset.patterns[0];
if (!pattern) {
  throw new Error('Fixture sintético inválido: falta un patrón de recorrido.');
}

const routeFeature = {
  type: 'Feature' as const,
  properties: { kind: 'synthetic-route' },
  geometry: {
    type: 'LineString' as const,
    coordinates: pattern.geometry.coordinates,
  },
};

const stopFeatures = {
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

interface SyntheticMapProps {
  onMapLoaded: () => void;
  onMapFailed: () => void;
}

export function SyntheticMap({ onMapLoaded, onMapFailed }: SyntheticMapProps) {
  return (
    <View style={styles.frame}>
      <Map
        style={styles.map}
        mapStyle="https://demotiles.maplibre.org/style.json"
        attribution
        logo={false}
        onDidFinishLoadingMap={onMapLoaded}
        onDidFailLoadingMap={onMapFailed}
      >
        <Camera
          initialViewState={{
            center: [-74.0815, 4.6490],
            zoom: 13.8,
          }}
        />

        <GeoJSONSource id="dev-route" data={routeFeature}>
          <Layer
            id="dev-route-line"
            type="line"
            paint={{
              'line-color': '#5B21B6',
              'line-width': 5,
              'line-opacity': 0.9,
            }}
            layout={{
              'line-cap': 'round',
              'line-join': 'round',
            }}
          />
        </GeoJSONSource>

        <GeoJSONSource id="dev-stops" data={stopFeatures}>
          <Layer
            id="dev-stop-circles"
            type="circle"
            paint={{
              'circle-radius': 7,
              'circle-color': '#FFFFFF',
              'circle-stroke-color': '#5B21B6',
              'circle-stroke-width': 3,
            }}
          />
        </GeoJSONSource>
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    minHeight: 260,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  map: {
    flex: 1,
  },
});
