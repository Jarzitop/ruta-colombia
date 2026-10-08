import { useReducer, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { activeDataset, activeScheduledCatalog } from './src/data/active';
import { describeCatalog } from './src/data/notice';
import { CatalogPicker, type CatalogOption } from './src/components/CatalogPicker';
import { ScheduledTripPanel } from './src/components/ScheduledTripPanel';
import { findDirectItineraries, type DirectItinerary, type DirectSearchResult } from './src/routing/direct';
import { initialPlannerState, reducePlanner } from './src/planner/state';
import { TransitMap } from './src/map/TransitMap';

const dataset = activeDataset;
const notice = describeCatalog(dataset);

function stopName(id: string): string {
  return dataset.stops.find((stop) => stop.id === id)?.name ?? 'Parada fuera del catálogo';
}

function TripResult({ result }: { result: DirectSearchResult | null }) {
  if (!result) {
    return <Text style={styles.resultText}>Selecciona ciudad, origen y destino para consultar un viaje directo.</Text>;
  }
  if (result.status === 'ok') {
    const trip = result.itineraries[0];
    if (!trip) return <Text style={styles.resultText}>No hay un viaje que mostrar.</Text>;
    return (
      <View style={styles.resultDetails}>
        <Text style={styles.resultTitle}>Viaje directo · {trip.routeCode ?? trip.routeName}</Text>
        <Text style={styles.resultText}>Sentido: {trip.headsign ?? trip.directionId} · 0 transbordos</Text>
        <Text style={styles.resultText}>1. Aborda en {stopName(trip.boardingStopId)}.</Text>
        <Text style={styles.resultText}>
          2. Sigue el servicio por {trip.stopIds.length - 1} tramo(s) entre paradas documentadas.
        </Text>
        <Text style={styles.resultText}>3. Desciende en {stopName(trip.alightingStopId)}.</Text>
        {result.itineraries.length > 1 && (
          <Text style={styles.resultNote}>
            Hay {result.itineraries.length} opciones directas; se presenta la primera por código, no por tiempo.
          </Text>
        )}
      </View>
    );
  }

  const explanations: Record<Exclude<DirectSearchResult['status'], 'ok'>, string> = {
    'not-covered': 'Alguna de las ubicaciones está fuera del catálogo de esta ciudad.',
    'same-stop': 'El origen y el destino coinciden; no es necesario tomar un bus.',
    'invalid-data': 'Hay un error en el recorrido del catálogo; no se puede ofrecer un viaje confiable.',
    'no-direct-service': 'No existe un viaje directo documentado en este sentido. Todavía no calculamos transbordos.',
  };
  return (
    <View style={styles.resultDetails}>
      <Text style={styles.resultTitle}>Sin itinerario directo</Text>
      <Text style={styles.resultText}>{explanations[result.status]}</Text>
    </View>
  );
}

export default function App() {
  const { height: screenHeight } = useWindowDimensions();
  const compactScreen = screenHeight < 700;
  const [planner, dispatch] = useReducer(
    (state: typeof initialPlannerState, action: Parameters<typeof reducePlanner>[1]) =>
      reducePlanner(state, action, dataset),
    initialPlannerState,
  );
  const [scheduleMode, setScheduleMode] = useState(false);
  const [serviceDateText, setServiceDateText] = useState('2026-10-12');
  const [mapVisible, setMapVisible] = useState(() => screenHeight >= 700);
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'failed'>('loading');

  const cities: CatalogOption[] = dataset.cities.map((city) => ({
    id: city.id,
    label: city.name,
  }));
  const stops: CatalogOption[] = dataset.stops
    .filter((stop) => stop.cityId === planner.cityId)
    .map((stop) => ({ id: stop.id, label: stop.name }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));

  const changeMode = (nextScheduleMode: boolean) => {
    if (nextScheduleMode === scheduleMode) return;
    dispatch({ type: 'clear-result' });
    setScheduleMode(nextScheduleMode);
  };
  const canCalculate = Boolean(planner.cityId && planner.originStopId && planner.destinationStopId);
  const calculate = () => {
    if (!planner.cityId || !planner.originStopId || !planner.destinationStopId) return;
    dispatch({
      type: 'result',
      value: findDirectItineraries(dataset, {
        cityId: planner.cityId,
        originStopId: planner.originStopId,
        destinationStopId: planner.destinationStopId,
      }),
    });
  };
  const itinerary: DirectItinerary | null =
    !scheduleMode && planner.result?.status === 'ok' ? planner.result.itineraries[0] ?? null : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>RUTA COLOMBIA · MVP ANDROID</Text>
          <Text style={styles.title}>¿Cómo quieres viajar?</Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>{notice.title}</Text>
          <Text style={styles.warningBody}>
            {notice.description}
          </Text>
        </View>

        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeButton, !scheduleMode && styles.modeActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: !scheduleMode }}
            onPress={() => changeMode(false)}
          >
            <Text style={[styles.modeLabel, !scheduleMode && styles.modeLabelActive]}>Recorrido directo</Text>
          </Pressable>
          <Pressable
            style={[styles.modeButton, scheduleMode && styles.modeActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: scheduleMode }}
            onPress={() => changeMode(true)}
          >
            <Text style={[styles.modeLabel, scheduleMode && styles.modeLabelActive]}>Por fecha de servicio</Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <CatalogPicker
            label="Ciudad"
            placeholder="Selecciona una ciudad"
            selectedId={planner.cityId}
            options={cities}
            onSelect={(id) => dispatch({ type: 'city', id })}
          />
          <View style={styles.fieldsRow}>
            <CatalogPicker
              label="Origen"
              placeholder="Parada de origen"
              selectedId={planner.originStopId}
              options={stops}
              onSelect={(id) => dispatch({ type: 'origin', id })}
              disabled={!planner.cityId}
            />
            <Pressable
              style={[styles.swapButton, !(planner.originStopId && planner.destinationStopId) && styles.disabled]}
              disabled={!planner.originStopId || !planner.destinationStopId}
              accessibilityLabel="Intercambiar origen y destino"
              accessibilityRole="button"
              onPress={() => dispatch({ type: 'swap' })}
            >
              <Text style={styles.swapLabel}>⇄</Text>
            </Pressable>
            <CatalogPicker
              label="Destino"
              placeholder="Parada de destino"
              selectedId={planner.destinationStopId}
              options={stops}
              onSelect={(id) => dispatch({ type: 'destination', id })}
              disabled={!planner.cityId}
            />
          </View>
          {!scheduleMode && <Pressable
            style={[styles.calculateButton, !canCalculate && styles.calculateDisabled]}
            disabled={!canCalculate}
            accessibilityRole="button"
            accessibilityLabel="Calcular viaje directo"
            onPress={calculate}
          >
            <Text style={styles.calculateLabel}>Comprobar recorrido directo</Text>
          </Pressable>}
        </View>

        <View style={[styles.tripCard, scheduleMode && styles.scheduleCard, compactScreen && styles.compactTripCard]}>
          <ScrollView
            nestedScrollEnabled
            style={styles.resultScroll}
            contentContainerStyle={styles.resultScrollContent}
            showsVerticalScrollIndicator
          >
            {scheduleMode ? (
              <ScheduledTripPanel
                key={String(planner.cityId) + ':' + String(planner.originStopId) + ':' + String(planner.destinationStopId)}
                schedule={activeScheduledCatalog}
                dateText={serviceDateText}
                onChangeDateText={setServiceDateText}
                originStopId={planner.originStopId}
                destinationStopId={planner.destinationStopId}
                stopName={stopName}
              />
            ) : (
              <TripResult result={planner.result} />
            )}
          </ScrollView>
        </View>

        <View style={styles.mapHeading}>
          <Text style={styles.mapTitle}>{notice.mapTitle}</Text>
          <Pressable accessibilityRole="button" onPress={() => {
            setMapVisible(!mapVisible);
            setMapState('loading');
          }}>
            <Text style={styles.mapToggle}>{mapVisible ? 'Ocultar mapa' : 'Mostrar mapa'}</Text>
          </Pressable>
        </View>

        {mapVisible ? (
          <View style={styles.mapArea}>
            <TransitMap
              dataset={dataset}
              cityId={planner.cityId}
              originStopId={planner.originStopId}
              destinationStopId={planner.destinationStopId}
              itinerary={itinerary}
              onMapLoaded={() => setMapState('ready')}
              onMapFailed={() => setMapState('failed')}
            />
          </View>
        ) : (
          <View style={styles.mapHidden}>
            <Text style={styles.resultText}>Mapa oculto. La búsqueda y las instrucciones siguen disponibles.</Text>
          </View>
        )}

        <Text style={styles.mapNote}>
          {mapState === 'failed' && mapVisible
            ? 'No se pudo dibujar el mapa. El viaje sigue disponible.'
            : 'Verde: origen · naranja: destino. Sin calles ni tiles externos.'}
          {scheduleMode
            ? ' El esquema no representa calles ni predicciones en tiempo real.'
            : ''}
          {itinerary && itinerary.stopIds.length < (dataset.patterns.find((p) => p.id === itinerary.patternId)?.stops.length ?? 0)
            ? ' El tramo parcial no tiene línea de geometría verificada.' : ''}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, gap: 7 },
  header: { gap: 1 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: '#475569' },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  warningCard: {
    paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8,
    backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B',
  },
  warningTitle: { fontSize: 10, fontWeight: '800', color: '#92400E' },
  warningBody: { marginTop: 2, fontSize: 10, lineHeight: 14, color: '#92400E' },
  form: { gap: 6 },
  modeRow: { flexDirection: 'row', gap: 6 },
  modeButton: {
    flex: 1, minHeight: 32, borderRadius: 8, borderWidth: 1,
    borderColor: '#C7D2FE', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', paddingHorizontal: 5,
  },
  modeActive: { backgroundColor: '#5B21B6', borderColor: '#5B21B6' },
  modeLabel: { color: '#475569', fontSize: 11, fontWeight: '700' },
  modeLabelActive: { color: '#FFFFFF' },
  fieldsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 5 },
  swapButton: {
    height: 44, minWidth: 36, backgroundColor: '#EDE9FE', borderRadius: 9,
    justifyContent: 'center', alignItems: 'center', marginBottom: 0,
  },
  disabled: { opacity: 0.45 },
  swapLabel: { fontSize: 20, fontWeight: '800', color: '#5B21B6' },
  calculateButton: {
    minHeight: 40, backgroundColor: '#5B21B6', borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  calculateDisabled: { backgroundColor: '#A78BFA' },
  calculateLabel: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  tripCard: {
    borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1,
    borderColor: '#CBD5E1', maxHeight: 156, minHeight: 55,
  },
  scheduleCard: { maxHeight: 230 },
  compactTripCard: { maxHeight: 150 },
  resultScroll: { flexGrow: 0 },
  resultScrollContent: { padding: 10 },
  resultDetails: { gap: 3 },
  resultTitle: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  resultText: { fontSize: 11, lineHeight: 16, color: '#334155' },
  resultNote: { fontSize: 10, lineHeight: 14, color: '#64748B' },
  mapHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  mapTitle: { flexShrink: 1, fontSize: 11, fontWeight: '700', color: '#334155' },
  mapToggle: { fontSize: 11, color: '#5B21B6', fontWeight: '700' },
  mapArea: { flex: 1, minHeight: 120 },
  mapHidden: {
    minHeight: 54, justifyContent: 'center', padding: 12,
    borderRadius: 12, backgroundColor: '#E2E8F0',
  },
  mapNote: { fontSize: 10, lineHeight: 14, color: '#475569' },
});
