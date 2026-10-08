import syntheticFixture from './synthetic/dev.dataset.json';
import type { TransitDataset } from './contract';

// Único punto de entrada del catálogo embarcado.
// Reemplazar por una muestra auditada únicamente tras superar las validaciones
// de procedencia, orden de paradas, sentidos y licencia.
export const activeDataset = syntheticFixture as unknown as TransitDataset;
