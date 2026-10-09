import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ScheduledCandidate, ScheduledCatalog, ScheduledResult } from '../gtfs/scheduled';
import { findScheduledDirectTrips } from '../gtfs/scheduled';
import { toGtfsServiceDate } from '../planner/service-date';
import { toGtfsDepartureTime } from '../planner/service-time';
import { buildScheduledSteps } from '../planner/itinerary-steps';
import type { TransitDataset } from '../data/contract';

interface Props {
  schedule: ScheduledCatalog | null;
  catalog: Pick<TransitDataset, 'stops'>;
  originStopId: string | null;
  destinationStopId: string | null;
  dateText: string;
  onChangeDateText: (value: string) => void;
  departureText: string;
  onChangeDepartureText: (value: string) => void;
  selectedTripId: string | null;
  onSelectCandidate: (candidate: ScheduledCandidate | null) => void;
  stopName: (id: string) => string;
}

const statusMessages: Record<Exclude<ScheduledResult['status'], 'ok'>, string> = {
  'invalid-query': 'La fecha no es válida. Usa AAAA-MM-DD.',
  'invalid-data': 'La programación contiene errores. No se puede sugerir un viaje confiable.',
  'same-stop': 'El origen y el destino son la misma parada.',
  'not-covered': 'Alguna parada está fuera de la muestra disponible.',
  'date-outside-feed': 'No tenemos programación para esa fecha. Esto no demuestra que no haya servicio.',
  'calendar-unknown': 'El calendario no permite confirmar los viajes para esa fecha.',
  'no-scheduled-trip-in-sample': 'No hay viajes programados en esta muestra para ese recorrido y fecha. Puede haber otros servicios no incluidos.',
};

/** Display programmed service times only; never call these predictions. */
function scheduleTime(raw: string, approximate: boolean): string {
  return (approximate ? 'programada aproximada' : 'programada') + ': ' + raw;
}

/** Local synthetic schedule only until rights/coverage are reviewed. */
export function ScheduledTripPanel({
  schedule, catalog, originStopId, destinationStopId, dateText, onChangeDateText,
  departureText, onChangeDepartureText, selectedTripId, onSelectCandidate, stopName,
}: Props) {
  const [result, setResult] = useState<ScheduledResult | null>(null);
  const date = toGtfsServiceDate(dateText);
  const departure = toGtfsDepartureTime(departureText);
  const ready = schedule !== null && originStopId !== null &&
    destinationStopId !== null && date !== null && departure !== null;

  const search = () => {
    if (!ready || !date || !schedule || !originStopId || !destinationStopId) return;
    onSelectCandidate(null);
    setResult(findScheduledDirectTrips(schedule, {
      serviceDate: date,
      originStopId,
      destinationStopId,
      ...(departure ? { departureAtOrAfter: departure } : {}),
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.label}>Fecha de servicio</Text>
          <TextInput
            style={styles.input}
            value={dateText}
            onChangeText={(value) => {
              onChangeDateText(value);
              onSelectCandidate(null);
              setResult(null);
            }}
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
            maxLength={10}
            placeholder="AAAA-MM-DD"
            accessibilityLabel="Fecha del servicio, año mes día"
          />
        </View>
        <Pressable
          style={[styles.button, !ready && styles.buttonDisabled]}
          disabled={!ready}
          accessibilityRole="button"
          accessibilityLabel="Consultar programación ficticia para la fecha"
          onPress={search}
        >
          <Text style={styles.buttonText}>Consultar</Text>
        </Pressable>
      </View>
      <View style={styles.dateField}>
        <Text style={styles.label}>Salida desde (opcional)</Text>
        <TextInput
          style={styles.input}
          value={departureText}
          onChangeText={(value) => {
            onChangeDepartureText(value);
            onSelectCandidate(null);
            setResult(null);
          }}
          placeholder="HH:MM, por ejemplo 10:02"
          accessibilityLabel="Hora mínima programada de salida, hora y minutos"
          keyboardType="numbers-and-punctuation"
          maxLength={6}
          returnKeyType="done"
        />
      </View>
      <Text style={styles.note}>
        Ejemplo ficticio: 12/10 (dos variantes) o 19/10 (solo la larga).
        {' '}Los horarios no indican llegada en tiempo real.
      </Text>

      {dateText.length > 0 && date === null && (
        <Text style={styles.error}>Fecha inválida. Introduce una fecha real: AAAA-MM-DD.</Text>
      )}
      {departure !== null ? null : (
        <Text style={styles.error}>Hora inválida. Usa HH:MM, por ejemplo 10:02.</Text>
      )}
      {schedule === null && (
        <Text style={styles.message}>No existe un calendario compatible con el catálogo seleccionado.</Text>
      )}

      {result?.status === 'ok' && (
        <View style={styles.result} accessibilityLiveRegion="polite">
          <Text style={styles.title}>
            {result.candidates.length} viaje(s) programado(s) en esta muestra
          </Text>
          {result.candidates.slice(0, 6).map((candidate, index) => {
            const pattern = schedule?.patterns.find((item) => item.id === candidate.patternId);
            return (
              <Pressable
                key={candidate.tripId}
                style={[styles.candidate, selectedTripId === candidate.tripId && styles.selectedCandidate]}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedTripId === candidate.tripId }}
                accessibilityLabel={'Ver en mapa la opción ' + (index + 1) + ', ' + candidate.scheduledBoardDeparture}
                onPress={() => onSelectCandidate(candidate)}
              >
                <Text style={styles.candidateTitle}>
                  Opción {index + 1} · Variante de {pattern?.stops.length ?? '?'} paradas
                </Text>
                <Text style={styles.message}>
                  Abordaje en {stopName(candidate.boardingStopId)}. Salida{' '}
                  {scheduleTime(candidate.scheduledBoardDeparture, candidate.boardingTimeApproximate)}.
                </Text>
                <Text style={styles.message}>
                  Descenso en {stopName(candidate.alightingStopId)}. Llegada{' '}
                  {scheduleTime(candidate.scheduledAlightArrival, candidate.alightingTimeApproximate)}.
                </Text>
                {selectedTripId === candidate.tripId ? (() => {
                  const directions = buildScheduledSteps(candidate, catalog);
                  return directions.status === 'ok' ? (
                    <View style={styles.instructions}>
                      <Text style={styles.candidateTitle}>Instrucciones del viaje seleccionado</Text>
                      {directions.steps.map((step, stepIndex) => (
                        <Text key={stepIndex} style={styles.message}>{step}</Text>
                      ))}
                      <Text style={styles.disclaimer}>{directions.notice}</Text>
                      <Text style={styles.selectHint}>Paradas resaltadas en el mapa.</Text>
                    </View>
                  ) : (
                    <Text style={styles.error}>No se pueden mostrar instrucciones: {directions.notice}</Text>
                  );
                })() : (
                  <Text style={styles.selectHint}>Toca para ver las paradas y las instrucciones.</Text>
                )}
              </Pressable>
            );
          })}
          {result.candidates.length > 6 && (
            <Text style={styles.message}>
              Se muestran las primeras 6 opciones ordenadas por salida programada.
            </Text>
          )}
          <Text style={styles.disclaimer}>
            Zona horaria: {result.timezone}. Programación de la muestra, no disponibilidad ni tiempo real.
          </Text>
        </View>
      )}
      {result && result.status !== 'ok' && (
        <Text style={styles.message} accessibilityLiveRegion="polite">
          {statusMessages[result.status]}
        </Text>
      )}
      {result === null && schedule !== null && date !== null && (
        <Text style={styles.message}>
          Selecciona origen y destino; luego consulta una fecha cubierta por el catálogo.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  dateField: { flex: 1, minWidth: 0, gap: 3 },
  label: { fontSize: 12, color: '#475569', fontWeight: '700' },
  input: {
    minHeight: 44, borderColor: '#CBD5E1', borderWidth: 1,
    borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#FFFFFF',
    fontSize: 14, color: '#0F172A',
  },
  button: {
    minHeight: 44, paddingHorizontal: 12, borderRadius: 8,
    backgroundColor: '#5B21B6', alignItems: 'center', justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: '#A78BFA' },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  note: { fontSize: 11, lineHeight: 16, color: '#92400E' },
  error: { fontSize: 12, color: '#B91C1C', fontWeight: '700' },
  result: { gap: 6 },
  candidate: {
    borderRadius: 8, borderWidth: 1, borderColor: '#DDD6FE',
    padding: 8, gap: 3, backgroundColor: '#FAF5FF',
  },
  selectedCandidate: { borderColor: '#5B21B6', borderWidth: 2 },
  instructions: { borderTopWidth: 1, borderColor: '#DDD6FE', paddingTop: 7, gap: 4 },
  selectHint: { color: '#5B21B6', fontSize: 11, fontWeight: '700' },
  candidateTitle: { color: '#4C1D95', fontWeight: '800', fontSize: 12 },
  title: { color: '#0F172A', fontSize: 13, fontWeight: '800' },
  message: { color: '#334155', fontSize: 12, lineHeight: 17 },
  disclaimer: { color: '#475569', fontSize: 11, lineHeight: 16 },
});
