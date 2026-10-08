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
- [~] ZIP documental real recibido en el chat y auditado en privado (1 ruta, 14 paradas en un patrón, 5 casos). Licencia específica no aclarada, variantes/calendario pendientes; **NO incorporado** al GitHub público ni a `active.ts`. Revisión en `docs/bogota-private-audit-review.md`.
- [x] `package-lock.json` y `app.json` con identificador de proyecto EAS incorporados en `main`; commit `6ecaf7c`.

## Sprint 2 · 12–17 octubre

- [~] Recibida primera muestra auditada fuera del repositorio público; validador disponible, pero **bloqueada** integración operativa por licencia de versión concreta, variantes y calendario.
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
- [~] Auditoría estructural inicial del ZIP de Bogotá sin inconsistencias detectadas, pero licencia de redistribución y modelo temporal pendientes. No hay incorporación en app ni pruebas sobre Android real.

## Bloqueo específico del primer GTFS Bogotá

- [x] Revisión independiente del ZIP privado y sus evidencias (709 viajes, dos variantes de 13/14 paradas, cinco regresiones topológicas). No se publicó dato operativo.
- [x] Carpeta real excluida de Git público mediante `.gitignore`.
- [x] `src/gtfs/calendar.ts` interpreta calendario y excepciones; `src/gtfs/scheduled.ts` vincula variante, día y salida aproximada en parada de abordaje. Pruebas sintéticas y TypeScript aprobados en CI.
- [~] Evidencia documental: catálogo distrital y recurso declaran CC BY-SA 4.0; aplicación específica a `GTFS_20260929.zip` es inferencia razonable, pendiente aclaración a TransMilenio. Informe y decisión: `docs/bogota-license-and-service-decision.md`.
- [~] El segundo ZIP privado ya entrega relación tripId/serviceId/patternId/stopTimes para 709 viajes, con 16 vectores contrastados independientemente. Falta correr el verificador actual sobre el ZIP fuera de Git y conectar el modelo temporal al contrato/UI tras revisión de licencia.
- [ ] Hacer pruebas físicas de acceso y abordar/descender antes de publicar instrucciones reales.
- [ ] Integrar el primer viaje real en la APK tras resolver bloqueos; ver issue #14.

## Segundo ZIP temporal de Bogotá (8 octubre)

- [x] Checksum de los archivos del paquete: sin diferencias; 709 IDs únicos y 9.773 eventos alineados con el patrón; 16/16 casos documentales comprobados independientemente.
- [x] Motor temporal multiciudad aislado `src/gtfs/scheduled.ts`, con búsqueda por fecha local GTFS y hora aproximada en la parada de abordaje (sin tiempo real ni horario preciso); 22 pruebas sintéticas.
- [x] CI del módulo temporal y TypeScript verde: https://github.com/Jarzitop/ruta-colombia/actions/runs/37800407700.
- [x] Ejecutado el verificador del repositorio sobre el segundo ZIP privado: **709 viajes, 9.773 eventos, 16/16 casos aprobados**; identificadores SHA comprobados y datos mantenidos fuera de GitHub.
- [ ] Resolver licencia aplicable a la revisión concreta, integrar ambas variantes con validación de fecha y realizar pruebas presenciales/Android; issue #14.

## Endurecimiento adicional del motor temporal

- [x] Pruebas de consulta con los datos privados: festivo 12 octubre, 150 programados al terminal largo; 303 a parada compartida, incluidos 153 del patrón corto. No se atribuyen viajes a destinos que la variante corta no atiende.
- [x] Corregida la aceptación errónea de horas GTFS mal formadas con `arrivalSeconds`/`departureSeconds: null`; se añadieron 3 pruebas sintéticas de regresión.
- [~] Interfaz ahora alterna recorrido estático y consulta por fecha con calendario **ficticio** de dos variantes; datos GTFS reales siguen aislados, `publishable:false` y sin APK nueva ni aprobación Android.

## Consulta por fecha — incremento de interfaz 8 octubre

- [x] Fixture temporal exclusivamente sintético en `src/data/synthetic/dev.temporal.ts`, ligado al dataset ficticio por `catalogDatasetVersion` y procedencia.
- [x] Panel `src/components/ScheduledTripPanel.tsx` permite consultar fecha escrita en calendario local GTFS, con salidas y llegadas programadas aproximadas, estados de cobertura y sin afirmar tiempo real.
- [x] Dos modos de búsqueda en `App.tsx`, con invalidación de resultados obsoletos al cambiar modo, fecha, origen o destino; no se incorpora ninguna ruta de Bogotá.
- [x] Nuevas pruebas automáticas sobre 12/10 y 19/10 **ficticios**, variantes corta/larga, fecha inválida, fuera del feed y no invertir ruta.
- [ ] Validar `main` completo en CI tras cambios y comprobar físicamente gestos, pantalla pequeña y arranque en modo avión en una futura APK.
- [ ] Ensayo interno de Bogotá solo con permiso/condiciones de uso evaluadas, datos no públicos y etiqueta de revisión; no entregar APK a terceros sin cierre documental.
