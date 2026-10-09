import type { TransitDataset } from '../data/contract';
import type { ScheduledCandidate } from '../gtfs/scheduled';

export type ItinerarySteps =
  | { status: 'ok'; steps: string[]; notice: string }
  | { status: 'invalid-data'; steps: []; notice: string };

/**
 * Describe stop order from a validated scheduled candidate. Do not infer
 * street directions, walking transfers, live availability or fare.
 */
export function buildScheduledSteps(
  candidate: ScheduledCandidate,
  catalog: Pick<TransitDataset, 'stops'>,
): ItinerarySteps {
  if (!candidate || !Array.isArray(candidate.stopIds) || candidate.stopIds.length < 2 ||
      candidate.stopIds[0] !== candidate.boardingStopId ||
      candidate.stopIds[candidate.stopIds.length - 1] !== candidate.alightingStopId) {
    return { status: 'invalid-data', steps: [], notice: 'El itinerario está incompleto.' };
  }
  const stopById = new Map(catalog.stops.map((stop) => [stop.id, stop]));
  const names: string[] = [];
  let cityId: string | undefined;
  for (const id of candidate.stopIds) {
    const stop = stopById.get(id);
    if (!stop || !stop.name?.trim() ||
        (cityId !== undefined && stop.cityId !== cityId)) {
      return { status: 'invalid-data', steps: [], notice: 'La secuencia de paradas no está verificada.' };
    }
    cityId = stop.cityId;
    names.push(stop.name);
  }
  const origin = names[0];
  const destination = names[names.length - 1];
  if (!origin || !destination) {
    return { status: 'invalid-data', steps: [], notice: 'Faltan paradas del viaje.' };
  }
  const boardTime = candidate.boardingTimeApproximate
    ? 'salida programada aproximada' : 'salida programada';
  const alightTime = candidate.alightingTimeApproximate
    ? 'llegada programada aproximada' : 'llegada programada';
  const intermediate = names.slice(1, -1);
  return {
    status: 'ok',
    steps: [
      `1. Aborda en ${origin}; ${boardTime}: ${candidate.scheduledBoardDeparture}.`,
      intermediate.length
        ? `2. Sigue el sentido documentado pasando por: ${intermediate.join(' → ')}.`
        : '2. Continúa hasta la siguiente parada incluida en este recorrido.',
      `3. Desciende en ${destination}; ${alightTime}: ${candidate.scheduledAlightArrival}.`,
    ],
    notice: 'Horarios del catálogo, no tiempos reales. No incluye instrucciones peatonales ni garantía de que el bus esté operando.',
  };
}
