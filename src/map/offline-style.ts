/** Offline-only schematic, without raster/vector tiles or online glyphs. */
export const LOCAL_STYLE = {
  version: 8 as const,
  name: 'Ruta Colombia - esquema local sin conexión',
  sources: {},
  layers: [{
    id: 'offline-background',
    type: 'background' as const,
    paint: { 'background-color': '#EFF6FF' },
  }],
};
