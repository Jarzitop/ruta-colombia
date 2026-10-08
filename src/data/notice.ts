import type { TransitDataset } from './contract';

type CatalogHeader = Pick<TransitDataset, 'publishable' | 'datasetVersion' | 'sourceRefs'>;

export interface CatalogNotice {
  status: 'synthetic' | 'review' | 'limited';
  title: string;
  description: string;
  mapTitle: string;
}

/** Presentation only. A publishable flag cannot replace legal and field review. */
export function describeCatalog(dataset: CatalogHeader): CatalogNotice {
  const version = dataset.datasetVersion;
  if (dataset.sourceRefs.some((source) => source.kind === 'synthetic')) {
    return {
      status: 'synthetic',
      title: 'PRUEBA CON DATOS FICTICIOS — NO PUBLICABLE',
      description: `No corresponde a servicios reales. Catálogo ${version}.`,
      mapTitle: 'Esquema local de paradas ficticias',
    };
  }
  if (!dataset.publishable) {
    return {
      status: 'review',
      title: 'DATOS EN REVISIÓN — NO APTOS PARA VIAJAR',
      description: `Catálogo ${version}. Recorridos pendientes de validación y permisos de uso.`,
      mapTitle: 'Esquema local de paradas del catálogo en revisión',
    };
  }
  return {
    status: 'limited',
    title: 'COBERTURA LIMITADA AL CATÁLOGO DISPONIBLE',
    description: `Catálogo ${version}. Las rutas no incluidas no se consideran inexistentes.`,
    mapTitle: 'Mapa local de paradas incluidas',
  };
}
