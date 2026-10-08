import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import syntheticJson from './src/data/synthetic/dev.dataset.json';
import type { TransitDataset } from './src/data/contract';
import { CatalogPicker, type CatalogOption } from './src/components/CatalogPicker';
import { findDirectItineraries, type DirectSearchResult } from './src/routing/direct';
import { SyntheticMap } from './src/map/SyntheticMap';

// Solo desarrollo: este catálogo y este mapa NO describen transporte real de Bogotá.
const dataset = syntheticJson as unknown as TransitDataset;

function stopName(id: string): string {
  return dataset.stops.find((stop) => stop.id === id)?.name ?? 'Parada fuera del catálogo';
}

function TripResult({ result }: { result: DirectSearchResult | null }) {
  if (result === null) {
    return <Text style={styles.resultText}>Selecciona ciudad, origen y destino para calcular una ruta de prueba.</Text>;
  }
  if (result.status === 'ok') {
    const trip = result.itineraries[0];
    if (!trip) return <Text style={styles.resultText}>No se pudo presentar el resultado.</Text>;

    return (
      <View style={styles.resultDetails}>
        <Text style={styles.resultTitle}>Viaje directo de prueba · {trip.routeCode ?? trip.routeName}</Text>
        <Text style={styles.resultText}>Sin transbordos. Sentido: {trip.headsign ?? trip.directionId}.</Text>
        <Text style={styles.resultText}>1. Aborda en {stopName(trip.boardingStopId)}.</Text>
        <Text style={styles.resultText}>2. Continúa {trip.stopIds.length - 1} tramo(s) entre paradas del catálogo.</Text>
        <Text style={styles.resultText}>3. Desciende en {stopName(trip.alightingStopId)}.</Text>
        {result.itineraries.length > 1 && (
          <Text style={styles.resultNote}>
            Se muestra una de {result.itineraries.length} alternativas directas, sin ranking de tiempo.
          </Text>
        )}
      </View>
    );
  }

  const explanations: Record<Exclude<DirectSearchResult['status'], 'ok'>, string> = {
    'not-covered': 'El origen, destino o ciudad no está dentro del catálogo cubierto.',
    'same-stop': 'El origen y el destino son la misma parada. No se necesita un viaje en bus.',
    'invalid-data': 'El catálogo contiene un recorrido inconsistente. Se bloquea el cálculo.',
    'no-direct-service': 'No hay viaje directo documentado en este sentido. Aún no se calculan transbordos.',
  };

  return (
    <View style={styles.resultDetails}>
      <Text style={styles.resultTitle}>No se presenta itinerario</Text>
      <Text style={styles.resultText}>{explanations[result.status]}</Text>
    </View>
  );
}

export default function App() {
  const [cityId, setCityId] = useState<string | null>(null);
  const [originId, setOriginId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [result, setResult] = useState<DirectSearchResult | null>(null);
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'failed'>('loading');

  const cities = useMemo<CatalogOption[]>(
    () => dataset.cities.map((city) => ({ id: city.id, label: city.name })), [],
  );
  const availableStops = useMemo<CatalogOption[]>(
    () => dataset.stops
      .filter((stop) => stop.cityId === cityId)
      .map((stop) => ({ id: stop.id, label: stop.name }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es')),
    [cityId],
  );

  const selectCity = (id: string) => {
    setCityId(id);
    setOriginId(null);
    setDestinationId(null);
    setResult(null);
  };
  const selectOrigin = (id: string) => {
    setOriginId(id);
    setResult(null);
  };
  const selectDestination = (id: string) => {
    setDestinationId(id);
    setResult(null);
  };

  const canCalculate = cityId !== null && originId !== null && destinationId !== null;
  const calculate = () => {
    if (!cityId || !originId || !destinationId) return;
    setResult(findDirectItineraries(dataset, {
      cityId,
      originStopId: originId,
      destinationStopId: destinationId,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>RUTA COLOMBIA · MVP ANDROID</Text>
          <Text style={styles.title}>Consulta de rutas</Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>DATOS SINTÉTICOS — NO PUBLICABLES</Text>
          <Text style={styles.warningBody}>Catálogo ficticio {dataset.datasetVersion}; no usar para desplazamientos reales.</Text>
        </View>

        <View style={styles.form}>
          <CatalogPicker
            label="Ciudad"
            placeholder="Selecciona una ciudad"
            selectedId={cityId}
            options={cities}
            onSelect={selectCity}
          />
          <View style={styles.fieldsRow}>
            <CatalogPicker
              label="Origen"
              placeholder="Parada de origen"
              selectedId={originId}
              options={availableStops}
              onSelect={selectOrigin}
              disabled={!cityId}
            />
            <CatalogPicker
              label="Destino"
              placeholder="Parada de destino"
              selectedId={destinationId}
              options={availableStops}
              onSelect={selectDestination}
              disabled={!cityId}
            />
          </View>
          <Pressable
            style={[styles.calculateButton, !canCalculate && styles.calculateDisabled]}
            disabled={!canCalculate}
            accessibilityRole="button"
            accessibilityLabel="Calcular viaje directo"
            onPress={calculate}
          >
            <Text style={styles.calculateLabel}>Calcular viaje directo</Text>
          </Pressable>
        </View>

        <View style={styles.tripCard}>
          <TripResult result={result} />
        </View>

        <Text style={styles.mapTitle}>Mapa de referencia: patrón ficticio completo</Text>
        <View style={styles.mapArea}>
          <SyntheticMap
            onMapLoaded={() => setMapState('ready')}
            onMapFailed={() => setMapState('failed')}
          />
        </View>
        <Text style={styles.mapStatus}>
          Mapa base {mapState === 'ready' ? 'cargado' : mapState === 'failed' ? 'no disponible' : 'cargando…'}.
          {' '}El itinerario se calcula con el catálogo local, aunque el mapa falle.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, gap: 8 },
  header: { gap: 2 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.9, color: '#475569' },
  title: { fontSize: 21, fontWeight: '800', color: '#0F172A' },
  warningCard: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningTitle: { fontSize: 11, fontWeight: '800', color: '#92400E' },
  warningBody: { marginTop: 2, fontSize: 10, color: '#92400E' },
  form: { gap: 7 },
  fieldsRow: { flexDirection: 'row', gap: 8 },
  calculateButton: {
    backgroundColor: '#5B21B6', minHeight: 40, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  calculateDisabled: { backgroundColor: '#A78BFA' },
  calculateLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  tripCard: {
    padding: 10, borderRadius: 10, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#CBD5E1',
  },
  resultDetails: { gap: 2 },
  resultTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  resultText: { fontSize: 11, lineHeight: 16, color: '#334155' },
  resultNote: { fontSize: 10, lineHeight: 14, color: '#64748B' },
  mapTitle: { color: '#334155', fontSize: 11, fontWeight: '700' },
  mapArea: { flex: 1, minHeight: 160 },
  mapStatus: { color: '#475569', fontSize: 10, lineHeight: 14 },
});
