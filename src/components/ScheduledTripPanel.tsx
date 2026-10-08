import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ScheduledCatalog, ScheduledResult } from '../gtfs/scheduled';
import { findScheduledDirectTrips } from '../gtfs/scheduled';
import { toGtfsServiceDate } from '../planner/service-date';

interface Props {
  schedule: ScheduledCatalog | null;
  originStopId: string | null;
  destinationStopId: string | null;
  stopName: (id: string) => string;
}

/** Development-only UI. No GTFS files are requested over the network. */
export function ScheduledTripPanel({ schedule, originStopId, destinationStopId, stopName }: Props) {
  const [dateText, setDateText] = useState('2026-10-12');
  const [result, setResult] = useState<ScheduledResult | null>(null);
  const date = toGtfsServiceDate(dateText);
  const ready = schedule !== null && originStopId !== null &&
    destinationStopId !== null && date !== null;

  const search = () => {
    if (!ready || !date || !schedule || !originStopId || !destinationStopId) return;
    setResult(findScheduledDirectTrips(schedule, {
      serviceDate: date,
      originStopId,
      destinationStopId,
    }));
  };

  const statusMessages: Record<Exclude<ScheduledResult['status'], 'ok'>, string> = {
    'invalid-query': 'Fecha inválida. Usa una fecha real con el formato AAAA-MM-DD.',
    'invalid-data': 'La programación del catálogo es inconsistente. No podemos recomendar un viaje.',
    'same-stop': 'El origen y destino son la misma parada.',
    'not-covered': 'Alguna parada está fuera de esta muestra de recorridos.',
    'date-outside-feed': 'No tenemos datos programados vigentes para esa fecha.',
    'calendar-unknown': 'No se pudo confirmar el calendario de estos viajes.',
    'no-scheduled-trip-in-sample': 'No hay viajes programados en esta muestra para ese recorrido y fecha. No implica que no exista servicio en la ciudad.',
  };
  const candidate = result?.status === 'ok' ? result.candidates[0] : undefined;
  const pattern = candidate
    ? schedule?.patterns.find((item) => item.id === candidate.patternId) : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.label}>Fecha de servicio</Text>
          <TextInput
            style={styles.input}
            value={dateText}
            onChangeText={(text) => {
              setDateText(text);
              setResult(null);
            }}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            placeholder="AAAA-MM-DD"
            accessibilityLabel="Fecha de servicio, año mes día"
          />
        </View>
        <Pressable
          style={[styles.button, !ready && styles.buttonDisabled]}
          disabled={!ready}
          accessibilityRole="button"
          accessibilityLabel="Consultar viajes programados de prueba"
          onPress={search}
        >
          <Text style={styles.buttonText}>Consultar fecha</Text>
        </Pressable>
      </View>
      <Text style={styles.note}>
        Prueba ficticia: 12/10 (dos variantes) o 19/10 (variante larga).
        {' '}Horarios aproximados; no son tiempo real.
      </Text>
      {schedule === null && (
        <Text style={styles.message}>No existe un calendario compatible con el catálogo activo.</Text>
      )}
      {result?.status === 'ok' && candidate && (
        <View style={styles.result}>
          <Text style={styles.title}>
            {result.candidates.length} viaje(s) programado(s) en la muestra
          </Text>
          <Text style={styles.message}>
            Primera salida programada aproximada desde {stopName(candidate.boardingStopId)}:
            {' '}{candidate.scheduledBoardDeparture}.
          </Text>
          <Text style={styles.message}>
            Descenso en {stopName(candidate.alightingStopId)}.
            {' '}Llegada programada aproximada: {candidate.scheduledAlightArrival}.
          </Text>
          <Text style={styles.message}>
            Patrón {candidate.directionId}; variante de {pattern?.stops.length ?? '—'} paradas.
            {' '}Sin información en tiempo real.
          </Text>
        </View>
      )}
      {result && result.status !== 'ok' && (
        <Text style={styles.message}>{statusMessages[result.status]}</Text>
      )}
      {result === null && schedule !== null && (
        <Text style={styles.message}>Elige origen y destino, revisa la fecha y consulta la muestra.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 5 },
  dateRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  dateField: { flex: 1, minWidth: 0, gap: 3 },
  label: { fontSize: 11, color: '#475569', fontWeight: '700' },
  input: {
    height: 40, borderColor: '#CBD5E1', borderWidth: 1,
    borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#FFFFFF',
    fontSize: 13, color: '#0F172A',
  },
  button: {
    minHeight: 40, paddingHorizontal: 12, borderRadius: 8,
    backgroundColor: '#5B21B6', alignItems: 'center', justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: '#A78BFA' },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  note: { fontSize: 10, lineHeight: 14, color: '#92400E' },
  result: { gap: 2 },
  title: { color: '#0F172A', fontSize: 12, fontWeight: '800' },
  message: { color: '#334155', fontSize: 11, lineHeight: 15 },
});
