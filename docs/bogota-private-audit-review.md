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
