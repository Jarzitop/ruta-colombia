import type { TransitDataset } from '../data/contract';
import type { ScheduledCatalog, ScheduledQuery } from '../gtfs/scheduled';
import { toGtfsServiceDate } from './service-date.ts';
import { toGtfsDepartureTime } from './service-time.ts';

type PreparationStatus =
  | 'ready' | 'invalid-date' | 'invalid-time'
  | 'incomplete' | 'catalog-unavailable' | 'catalog-mismatch';

export type ScheduledPreparation =
  | { status: 'ready'; date: string; departure: string; query: ScheduledQuery }
  | {
      status: Exclude<PreparationStatus, 'ready'>;
      date: string | null;
      departure: string | null;
    };

export interface ScheduledForm {
  dataset: Pick<TransitDataset, 'datasetVersion'>;
  schedule: ScheduledCatalog | null;
  originStopId: string | null;
  destinationStopId: string | null;
  dateText: string;
  departureText: string;
}

/**
 * Validate UI input and the dataset/schedule pairing before querying the
 * offline GTFS engine. No React state, device timezone or network required.
 * A changed feed must never be accidentally combined with old stop data.
 */
export function prepareScheduledQuery(input: ScheduledForm): ScheduledPreparation {
  const date = toGtfsServiceDate(input.dateText);
  const departure = toGtfsDepartureTime(input.departureText);
  if (date === null) return { status: 'invalid-date', date, departure };
  if (departure === null) return { status: 'invalid-time', date, departure };
  if (!input.schedule) return { status: 'catalog-unavailable', date, departure };
  if (input.dataset.datasetVersion !== input.schedule.catalogDatasetVersion) {
    return { status: 'catalog-mismatch', date, departure };
  }
  if (!input.originStopId || !input.destinationStopId) {
    return { status: 'incomplete', date, departure };
  }
  return {
    status: 'ready',
    date,
    departure,
    query: {
      serviceDate: date,
      originStopId: input.originStopId,
      destinationStopId: input.destinationStopId,
      ...(departure ? { departureAtOrAfter: departure } : {}),
    },
  };
}
