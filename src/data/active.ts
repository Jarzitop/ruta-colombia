import syntheticFixture from './synthetic/dev.dataset.json';
import type { TransitDataset } from './contract';
import type { ScheduledCatalog } from '../gtfs/scheduled';
import { syntheticSchedule } from './synthetic/dev.temporal';

// Único punto de entrada del catálogo embarcado.
// Reemplazar por una muestra auditada únicamente tras superar las validaciones
// de procedencia, orden de paradas, sentidos y licencia.
export const activeDataset = syntheticFixture as unknown as TransitDataset;

// El calendario ficticio solo corresponde al fixture de desarrollo. Al pasar a
// datos reales, no usar jamás esta programación sobre paradas ajenas.
export const activeScheduledCatalog: ScheduledCatalog | null =
  activeDataset.datasetVersion === syntheticSchedule.catalogDatasetVersion &&
  activeDataset.sourceRefs.some((source) => source.kind === 'synthetic')
    ? syntheticSchedule : null;
