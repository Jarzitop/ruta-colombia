import type { TransitDataset } from './contract';
import type { ScheduledCatalog } from '../gtfs/scheduled';
import { dataAttribution } from './licensing';

export function catalogProvenance(
  dataset: Pick<TransitDataset,'datasetVersion'|'sourceRefs'|'publishable'>,
  schedule: Pick<ScheduledCatalog,'feedInfo'|'timezone'> | null,
): string | null {
  const official = dataset.sourceRefs.find((ref) => ref.kind === 'official');
  if (!official) return null;
  const publisher = official.publisher?.trim();
  const title = official.title?.trim();
  if (!publisher || !title) return null;
  const period = schedule?.feedInfo?.feed_start_date && schedule.feedInfo.feed_end_date
    ? ` · periodo declarado ${schedule.feedInfo.feed_start_date}–${schedule.feedInfo.feed_end_date}`
    : '';
  const confirmed = dataAttribution(dataset);
  const rights = confirmed ? ' Datos GTFS: CC BY-SA 4.0 confirmada.' : '';
  return `Fuente: ${publisher} · ${title}${period}.` + rights + ' ' +
    (dataset.publishable
      ? 'Cobertura limitada al catálogo.'
      : confirmed
        ? 'Ensayo interno: actualidad de los horarios y recorridos sin verificar.'
        : 'Revisión interna: licencia y actualidad sujetas a confirmación.');
}
