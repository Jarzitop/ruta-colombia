# Bogotá pilot-001 · revisión de entrega privada

Estado: **muestra recibida y contrastada técnicamente, NO integrada ni publicable**. Este documento únicamente registra decisiones de ingeniería y resultados agregados; el catálogo real, las coordenadas, las listas de paradas, los viajes y el ZIP original NO están versionados aquí.

## Recepción y comprobación

Se inspeccionó el ZIP de auditoría recibido el 7 de octubre de 2026, con archivos `dataset.json`, `sources.md`, `coverage.md`, `expected-trips.json`, muestras GTFS y evidencias del extractor. Contiene un catálogo de **1 ciudad, 1 ruta, 1 patrón seleccionado, 14 paradas, 0 conexiones peatonales y 5 casos de regresión**. El atributo `publishable` del catálogo es `false`.

La auditoría independiente comparó orden de paradas y secuencias, coordenadas contra la selección GTFS y geometría contra los 313 puntos de `shapes-selected.csv`, así como los viajes esperados contra el patrón. No detectó inconsistencias estructurales en estas comprobaciones. No sustituye ejecutar el validador oficial ni verificar el ZIP original de 120 MB; la auditoría adjunta reporta que ambos comandos propios del repositorio habían pasado, pero eso es evidencia reportada, no ejecución independiente nuestra.

Entre **709 viajes** del servicio seleccionado se observaron **dos variantes de parada**, una de 14 y otra de 13 paradas. Una de las clases de servicio GTFS incluye ambas variantes: comprobar solo `service_id` y fecha NO basta para identificar qué recorrido efectúa cada viaje. También hay excepciones de calendario, especialmente en días festivos.

## Licencia y distribución: bloqueo

La ficha genérica del catálogo de Datos Abiertos Bogotá señala **CC BY-SA 4.0**, pero los metadatos adjuntos del ítem ArcGIS correspondiente al ZIP concreto contienen `licenseInfo: null`. Es necesario resolver la atribución y permiso de redistribución aplicables a esta revisión antes de publicar derivados, cargarla en una APK distribuida o subir archivos extraídos al repositorio público. Consultar la entidad responsable o conseguir documentación explícita de alcance de licencia.

No compartir este ZIP ni la extracción en GitHub público. El archivo `.gitignore` protege `/data/bogota/pilot-001/` y `/audit-work/`, pero Git permite incorporar archivos ignorados a la fuerza; no hacerlo hasta disponer de autorización suficiente.

## Funcionalidad temporal pendiente

La utilidad `src/gtfs/calendar.ts` interpreta `calendar.txt` y `calendar_dates.txt`, incluyendo excepciones tipo `1` (activar) y `2` (eliminar), y devuelve `active`, `inactive` o `unknown`. **No se integra todavía al motor de rutas**, no usa datos reales del ZIP y no demuestra disponibilidad de una salida. La siguiente etapa es normalizar `trip_id → service_id → patternId` por variante, y posteriormente, si vamos a recomendar servicios según hora, asociar `stop_times` y fechas locales. No deducir que exista un viaje solo porque el patrón tenga paradas compatibles.

Además, el extractor `audit-work/extract.py` del ZIP define su directorio de salida como `Path(__file__).parent / 'data/bogota/pilot-001'`; si se ejecuta desde `audit-work/`, produce archivos **debajo de audit-work/data/**, no en el directorio raíz previsto. Corregir la ruta de salida o documentar una copia explícita al repetir la extracción. No se ejecutó código procedente del ZIP.

## Validación privada reproducible en Windows

Usar una carpeta **fuera del clon GitHub**, después de `git pull --ff-only origin main`. En PowerShell:

```powershell
cd "$HOME\Downloads\ruta-colombia-github"
Expand-Archive -LiteralPath "$HOME\Downloads\Bogota_pilot_001_auditoria(1).zip" `
  -DestinationPath "$HOME\Downloads\ruta-auditoria-privada" -Force

node scripts/validate-dataset.mjs "$HOME\Downloads\ruta-auditoria-privada\data\bogota\pilot-001\dataset.json"
node --experimental-strip-types scripts/verify-bogota-pilot.mjs "$HOME\Downloads\ruta-auditoria-privada\data\bogota\pilot-001"
npm run test:gtfs-calendar
```

Los comandos comprueban formato y conectividad dentro del **catálogo recibido**, no derechos de distribución, disponibilidad actual ni recorrido presencial. No ejecutar `git add` sobre los archivos del lote.

## Bloqueos y secuencia de continuación

1. Confirmar con «01 — Dirección y datos» licencia aplicable al ZIP concreto, fechas y restricciones de difusión.
2. Corregir el procedimiento del extractor, si es necesario repetir la auditoría.
3. Modelar variantes con `trip_id` y calendario en archivos privados y construir regresiones por fecha, sin tomar decisiones de disponibilidad solo por una secuencia estática.
4. Probar personalmente un viaje directo y referencias de plataforma; no presentar como confirmadas instrucciones físicas que no se han observado.
5. Únicamente entonces considerar el catálogo real como activo o distribuir APK de prueba con esos datos. Mientras tanto, mantener el catálogo sintético, las pruebas unitarias y el esquema offline.

Seguimiento: [issue #14](https://github.com/Jarzitop/ruta-colombia/issues/14) y [issue #4](https://github.com/Jarzitop/ruta-colombia/issues/4).

## Actualización del lote temporal privado — 8 de octubre de 2026

Se recibió el segundo ZIP `Bogota_pilot_001_auditoria(1)(1).zip`, que **sustituye** la versión anterior para la investigación temporal. Conserva `publishable: false`, el patrón largo del catálogo estático y agrega `temporal.json` con dos patrones diferenciados, calendario, excepciones, vínculo `tripId/serviceId/patternId` y todos los eventos de parada.

**Comprobación local independiente del ZIP recibido** (no publicación): todos los checksums listados en `checksums.json` coincidieron. Se verificaron 709 identificadores de viaje únicos, 9.773 eventos, concordancia de `stopId` y secuencia con el patrón asociado y ausencia de regresiones temporales. Hay 556 viajes del patrón largo (221 días hábiles, 185 sábados y 150 domingos/festivos) y 153 de la variante corta en el servicio festivo. Todos los eventos llevan `timepoint: 0`: tiempos aproximados o interpolados, nunca predicciones de llegada en vivo.

El proveedor documenta que el **12 de octubre de 2026** hay 150 viajes del patrón de 14 paradas y 153 del patrón de 13, que termina antes de Universidades. El fin de cada variante se define por el `tripId` y sus `stopTimes`; compartir servicio o forma geométrica no basta. Especificación y vectores aportados en `temporal.md` y `expected-temporal-cases.json` del ZIP privado.

### Incremento técnico del motor, sin activación

Se incorpora `src/gtfs/scheduled.ts`, módulo multiciudad sin rutas hardcodeadas que evalúa la fecha local **del GTFS**, calendario/excepciones, sentido, variante por `tripId`, permisos de abordaje/descenso y hora aproximada de salida **en la parada de abordaje**, no la salida de cabecera. Devuelve como máximo viajes **programados en la muestra**, expresamente no disponibilidad física ni predicción real. Conserva horas GTFS superiores a `24:00:00`. Rechaza datos estructuralmente inválidos y distingue calendario desconocido o fechas fuera del feed.

`scripts/test-scheduled.mjs` contiene pruebas ficticias sobre los casos críticos. `scripts/verify-private-temporal.mjs` permite ejecutar las **16 regresiones** recibidas sobre el ZIP privado, incluyendo comprobación de calendarios, recuentos por variante y búsquedas del motor para los viajes señalados. El resultado CI de las pruebas sintéticas **no equivale** a ejecutar las regresiones privadas; estas últimas se ejecutan fuera de GitHub con los archivos reales.

### Comando para ejecutar contra la extracción privada

Una vez descomprimido el ZIP actualizado **fuera del repositorio público**, desde la carpeta raíz del clon:

```powershell
npm run verify:private-temporal -- "$HOME\Downloads\ruta-auditoria-privada\data\bogota\pilot-001\temporal.json" "$HOME\Downloads\ruta-auditoria-privada\data\bogota\pilot-001\expected-temporal-cases.json"
```

El verificador no necesita tokens, servidor ni API. No ejecutar `git add -f` sobre los datos sin confirmar permisos. Los archivos de operación no se publicaron y `src/data/active.ts` permanece sintético.

### Aún bloqueado

El catálogo de 14 paradas sigue estático y la pantalla **no se ha conectado** al motor por fecha. Para activar orientación de pasajeros faltan resolver la reutilización del ZIP específico, la integración validada de ambas variantes y la fecha/hora de servicio, los límites de horarios interpolados, la atribución y la comprobación presencial en Bogotá. El mensaje de licencia sigue siendo **ámbito pendiente de aclaración**, no prohibición demostrada.
