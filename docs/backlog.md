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


## Preparación de próxima APK interna — 8 octubre

- [x] Panel temporal mejorado para presentar cada variante ficticia por separado, con horarios programados individuales y disclaimer de datos aproximados; cuando hay más de seis alternativas muestra solo las seis primeras y explica el límite.
- [x] Conserva la fecha elegida al cambiar origen/destino; invalida el resultado anterior. Rechaza fechas imposibles antes de habilitar la consulta y muestra aviso de error.
- [x] Ajuste adaptable para pantallas Android bajas: inicia con mapa oculto si altura < 700 puntos, manteniendo acceso al botón para mostrarlo; tarjeta de consulta con desplazamiento propio.
- [x] Comprobación de preview `scripts/check-preview-data.mjs` y pruebas para bloquear catálogo no ficticio, mezcla de fuentes, calendario incompatible o carpetas de auditoría dentro del proyecto.
- [x] GitHub Actions (CI y workflow APK) incorpora comprobaciones de preview; el comando local `npm run build:apk` dispone ahora de `prebuild:apk` con validación previa automática.
- [ ] APK de este incremento: NO solicitada. Está pendiente de que el CI completo quede verde y de definir sesión de pruebas en teléfono real.
- [ ] En Android: gestos MapLibre, visibilidad de controles en pantalla reducida, consulta de 2 variantes, cambios de fecha, arranque en frío en modo avión y estabilidad; matriz en `docs/testing-android.md`.
- [ ] GTFS de Bogotá: todavía excluido del repositorio y de la APK; aclarar licencia, vigencia y ensayos internos antes de incorporar datos operativos.


## Incremento previo a la segunda APK — 8 octubre, noche

- [x] Filtro opcional de hora mínima de salida en `src/components/ScheduledTripPanel.tsx`, convertido a hora de servicio GTFS sin red ni reloj del dispositivo. Consulta por **hora en parada de abordaje**.
- [x] Alternativas de viaje programadas seleccionables; `App.tsx` almacena el viaje temporal elegido y limpia la selección en cada cambio de ciudad, parada, fecha, hora o modo.
- [x] `TransitMap` recibe `highlightedStopIds`: destaca paradas verificadas del segmento elegido y no traza una línea ficticia ni extiende el recorrido corto.
- [x] Nueva suite `npm run test:service-time` para formato `HH:MM`, umbral inclusivo, comparación desde parada de abordaje, y ausencia de servicio únicamente en la muestra.
- [ ] Confirmar CI verde para este incremento; la evidencia Android sigue pendiente. Sin compilación APK, GTFS real ni transbordos inventados.

## Cierre de flujo directo programado — incremento adicional 8 octubre

- [x] `src/planner/itinerary-steps.ts` construye instrucciones desde la secuencia del viaje seleccionado: abordaje, paradas intermedias, descenso, tiempos de salida/llegada cualificados como programados y aproximados si `timepoint=0`. Rechaza datos incompletos y paradas ajenas al catálogo; no infiere calles ni transbordos.
- [x] `ScheduledTripPanel` muestra las instrucciones al seleccionar una alternativa; solo usa el calendario ficticio autorizado del fixture.
- [x] `App.tsx` presenta una alternativa de recuperación cuando MapLibre informa un fallo, mantiene la consulta local disponible y ofrece botón de reintentar el renderizado.
- [x] Diez pruebas adicionales de instrucciones en `scripts/test-itinerary-steps.mjs` incorporadas al CI y al workflow APK manual.
- [ ] Verificar ejecución CI completa de estos cambios; **no** afirmar pruebas físicas Android ni estabilidad nativa por inspección de código.
- [ ] No compilar todavía: continuar con integración controlada y sesión Android conjunta del Sprint 1; no activar GTFS de Bogotá sin autorización aplicable.

## Segunda APK Bogotá real · integración local (8 octubre)

- [x] ZIP privado del 8 de octubre localizado: 709 viajes, 9.773 eventos, dos patrones (14/13), 16 regresiones y 29 checksums sin discrepancias. Datos operativos fuera de GitHub.
- [x] `scripts/lib/normalize-private-bogota.mjs`: incorpora ambos patrones en `TransitDataset`, conserva fuentes y permisos, reutiliza geometría **solo** cuando la secuencia completa está documentada; no asigna geometría larga al patrón corto.
- [x] `scripts/install-private-bogota.mjs`: instalador local desde extracción ajena al repo, valida catálogo, calendario y 16 regresiones **antes** de escribir datos privados. Alternativa: overlay privado suministrado en la conversación.
- [x] En modo real, la app abre directamente búsqueda por fecha/hora y bloquea el cálculo atemporal; presenta advertencia de revisión, fuente, revisión GTFS y vigencia declarada; horarios se muestran como programación aproximada.
- [x] El mapa esquemático se centra únicamente en el viaje programado seleccionado, y al seleccionar variante corta **oculta** paradas de la larga que no pertenecen al viaje. Sin tiles de red, sin línea de continuación ni calles inventadas.
- [x] `src/data/private/` y `.easignore` ignorados por Git y bloqueados contra inclusión forzada; el workflow APK público sigue aceptando solamente un catálogo sintético.
- [x] Perfil EAS `bogota-internal` y comando `npm run build:apk:bogota` con controles previos, consentimiento expreso `RUTA_PRIVATE_EAS_UPLOAD_APPROVED=YES` y exigencia documental de desactivar acceso anónimo a builds internos.
- [x] Pruebas unitarias sintéticas para normalización, atribución, mapa sin red y límite de paradas de variante.
- [ ] **NO** se ha compilado ni instalado una segunda APK. No hay sesión Expo autenticada ni SDK Android local accesible desde este entorno; verificar permiso de subida de los dos JSON a EAS y protección del enlace antes de crear un build.
- [ ] Repetir `npm run check:bogota:private`, `npm run typecheck` y la matriz de pruebas **en el clon privado del usuario**. CI público comprueba el código genérico pero no contiene ni puede inspeccionar el GTFS real.
- [ ] Completar pruebas físicas de la segunda APK: 12/10 destino común vs Universidades, horas aproximadas, modo avión, gestos MapLibre y fallos del mapa. Ver `docs/internal-bogota-apk.md`.
