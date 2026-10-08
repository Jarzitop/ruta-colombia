import { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import dataset from './src/data/synthetic/dev.dataset.json';
import { SyntheticMap } from './src/map/SyntheticMap';

export default function App() {
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'failed'>('loading');

  const summary = useMemo(() => {
    const pattern = dataset.patterns[0];
    if (!pattern) return 'Fixture sintético sin patrón de recorrido';
    const stopNames = pattern.stops.map((entry) =>
      dataset.stops.find((stop) => stop.id === entry.stopId)?.name ?? entry.stopId,
    );
    return stopNames.join(' → ');
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>RUTA COLOMBIA · MVP ANDROID</Text>
          <Text style={styles.title}>Prueba de integración nativa</Text>
          <Text style={styles.subtitle}>
            Datos sintéticos para validar Android y MapLibre. No representan ningún servicio real.
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>DATOS SINTÉTICOS — NO PUBLICABLES</Text>
          <Text style={styles.warningBody}>{dataset.datasetVersion}</Text>
        </View>

        <View style={styles.mapArea}>
          <SyntheticMap
            onMapLoaded={() => setMapState('ready')}
            onMapFailed={() => setMapState('failed')}
          />
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Mapa base:</Text>
          <Text style={styles.statusValue}>
            {mapState === 'ready' ? 'cargado' : mapState === 'failed' ? 'no disponible' : 'cargando…'}
          </Text>
        </View>

        {mapState === 'failed' ? (
          <View style={styles.offlineCard}>
            <Text style={styles.offlineTitle}>El mapa base no pudo cargarse.</Text>
            <Text style={styles.offlineBody}>
              Los datos del viaje siguen disponibles localmente. El cálculo y las instrucciones no dependerán del mapa base.
            </Text>
          </View>
        ) : null}

        <View style={styles.tripCard}>
          <View style={styles.tripHeadingRow}>
            <Text style={styles.tripTitle}>Recorrido de prueba</Text>
            <Text style={styles.tripRoute}>DEV-1 · FICTICIO</Text>
          </View>
          <Text style={styles.tripStops}>{summary}</Text>
          <Text style={styles.tripNote}>Sentido explícito: dev-outbound.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, gap: 10 },
  header: { gap: 3 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.0, color: '#475569' },
  title: { fontSize: 23, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 13, lineHeight: 18, color: '#475569' },
  warningCard: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningTitle: { fontSize: 12, fontWeight: '800', color: '#92400E' },
  warningBody: { marginTop: 2, fontSize: 11, color: '#92400E' },
  mapArea: { flex: 1, minHeight: 260 },
  statusRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  statusLabel: { fontSize: 12, fontWeight: '700', color: '#334155' },
  statusValue: { fontSize: 12, color: '#475569' },
  offlineCard: { padding: 10, borderRadius: 10, backgroundColor: '#E2E8F0' },
  offlineTitle: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  offlineBody: { marginTop: 4, fontSize: 11, lineHeight: 16, color: '#334155' },
  tripCard: { padding: 12, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1' },
  tripHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' },
  tripTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  tripRoute: { fontSize: 11, fontWeight: '700', color: '#5B21B6' },
  tripStops: { marginTop: 5, fontSize: 12, lineHeight: 17, color: '#334155' },
  tripNote: { marginTop: 5, fontSize: 11, color: '#64748B' },
});
