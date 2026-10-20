import type { SourceRef, TransitDataset } from './contract';

export const TRANSMILENIO_GTFS_LICENSE_URL =
  'https://creativecommons.org/licenses/by-sa/4.0/';
export const TRANSMILENIO_DATA_PORTAL_URL =
  'https://datosabiertos.bogota.gov.co/dataset/especificacion-gtfs-general-transport-feed-specification-sitp';

export type DataAttribution = {
  publisher: string;
  sourceTitle: string;
  sourceUrl: string;
  license: 'CC BY-SA 4.0';
  licenseUrl: string;
  changes: string;
  independence: string;
};

/**
 * Written confirmation from TRANSMILENIO S.A. in October 2026:
 * CC BY-SA 4.0 applies to current and future GTFS ZIP datasets.
 * Narrowly recognize GTFS from the stated official publisher; never
 * infer that another city's or operator's data has the same license.
 * This does not attest feed freshness or device verification.
 */
export function isConfirmedTransMilenioGtfs(
  source: SourceRef,
  datasetVersion: string,
): boolean {
  return source.kind === 'official' &&
    /transmilenio/i.test(source.publisher) &&
    /gtfs/i.test(source.title + ' ' + datasetVersion);
}

export function dataAttribution(
  dataset: Pick<TransitDataset, 'datasetVersion' | 'sourceRefs'>,
): DataAttribution | null {
  const source = dataset.sourceRefs.find((item) =>
    isConfirmedTransMilenioGtfs(item, dataset.datasetVersion));
  if (!source) return null;
  return {
    publisher: source.publisher,
    sourceTitle: source.title,
    sourceUrl: source.url?.startsWith('https://')
      ? source.url : TRANSMILENIO_DATA_PORTAL_URL,
    license: 'CC BY-SA 4.0',
    licenseUrl: TRANSMILENIO_GTFS_LICENSE_URL,
    changes: 'Ruta Colombia: selección de muestra, normalización de datos y adaptación para consulta local.',
    independence: 'Aplicación independiente, sin aval oficial de TRANSMILENIO S.A.',
  };
}
