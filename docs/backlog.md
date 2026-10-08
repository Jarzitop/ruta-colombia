# Backlog real

Leyenda: `[x]` implementado con evidencia local, `[~]` implementado pero pendiente de Android real, `[ ]` pendiente.

## Sprint 1 · 7–11 octubre

- [x] Base de proyecto Expo + TypeScript creada.
- [x] Versiones Expo/RN/React y MapLibre fijadas.
- [x] Plugin nativo MapLibre declarado en `app.json`.
- [x] Contrato de datos provisional documentado.
- [x] Validador de dataset implementado y ejecutado sobre fixture sintético.
- [x] Dataset sintético aislado y marcado no publicable.
- [x] Pantalla mínima con MapLibre + línea + paradas sintéticas renderizada en Android real.
- [x] Perfil EAS `preview` configurado para producir APK.
- [x] Dependencias instaladas; `expo-doctor` 21/21 y `tsc --noEmit` sin errores en Windows.
- [x] APK Android `preview` generada correctamente con EAS Build.
- [~] APK instalada en teléfono: app estable, MapLibre y geometría sintética visibles. Detectado conflicto de gestos por `ScrollView`; corrección implementada y pendiente de retest físico.
- [ ] Verificar en Android real arranque en frío en modo avión, render local MapLibre (`androidView=texture`), zoom y gestos sin pantalla negra.
- [ ] Recibir dataset real validado de Bogotá desde «01 — Dirección y datos»; entrega requerida en `docs/bogota-pilot-handoff.md`. No se ha recibido ningún archivo real.
- [x] `package-lock.json` y `app.json` con identificador de proyecto EAS incorporados en `main`; commit `6ecaf7c`.

## Sprint 2 · 12–17 octubre

- [ ] Importador de datos reales (depende de «01 — Dirección y datos»).
- [x] Motor directo `src/routing/direct.ts`: 17/17 pruebas y `npm run typecheck` exitosos en Windows según registro del usuario.
- [ ] Motor con máximo un transbordo explícito (no se infiere caminar ni el regreso).
- [ ] Ranking: menos transbordos y luego menor caminata documentada.
- [~] Interfaz de selección, intercambio de origen/destino y resultados directos sin estados obsoletos: implementación en `App.tsx` y `src/planner/state.ts`; 13 tests unitarios de selección disponibles, pendiente CI completo del último commit y prueba Android.
- [~] Instrucciones básicas directas. Mapa `src/map/TransitMap.tsx` desacoplado de ciudad y catálogo, con encuadre por paradas, origen/destino y fondo local sin tiles. Un tramo parcial sin geometría propia NO dibuja la ruta completa; pendiente validación Android.

## Sprint 3 · 18–22 octubre

- [ ] Persistencia local del último viaje.
- [ ] Prueba sin conexión del catálogo/cálculo/instrucciones.
- [ ] Correcciones de Bogotá.
- [ ] Evaluar Tunja solo si Bogotá no mantiene errores esenciales.

## Sprint 4 · 23–27 octubre

- [ ] Congelar funcionalidades.
- [ ] Pruebas en dispositivos Android.
- [ ] Correcciones de bloqueos, comprensión y rendimiento.
- [ ] APK candidata y documentación final.

## Verificación próxima

- [x] CI actualizado: instalación reproducible, validador, 17 pruebas de viajes directos, 13 de selección, 5 de encuadre, 12 pruebas de expectativas documentadas, 3 de entrega Bogotá, TypeScript y Expo Doctor. Ejecución verde: https://github.com/Jarzitop/ruta-colombia/actions/runs/37724658151.
- [ ] En Android: casos de `docs/testing-android.md`; no se marcarán hasta recibir resultados.

## Decisión del mapa base

- [x] Estilo esquemático local para evitar peticiones de red en las pruebas del motor; sin calles reales.
- [x] Revisadas las políticas oficiales de OSM, MapLibre, MapTiler y Stadia; documento `docs/map-basemap-review.md`.
- [ ] Probar con credenciales autorizadas y atribución la cartografía callejera de Bogotá antes de integrarla. No cargar OSMF público sin verificar User-Agent y cacheo.

## Integración muestra Bogotá

- [x] Catálogo activo centralizado en `src/data/active.ts` y mapa genérico `src/map/TransitMap.tsx`.
- [x] Contrato de entrega en `docs/bogota-pilot-handoff.md`, validador de viajes documentados y compuerta de lote real. Sin archivos de Bogotá, la compuerta informa `PENDIENTE` sin activar rutas; un lote parcial o sintético bloquea CI.
- [ ] Auditoría de datos y licencia; importación; pruebas sobre itinerario real; revisión Android posterior.
