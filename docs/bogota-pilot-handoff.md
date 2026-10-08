# Entrega mínima de datos auditados para el primer viaje directo en Bogotá

Este documento define qué debe entregar el chat «01 — Dirección y datos» para pasar de la muestra sintética a un **viaje directo real y trazable**. No exige una ciudad completa ni inventa información faltante.

**Recepción al 7 de octubre de 2026:** se recibió por este chat un ZIP auditado de Bogotá. La primera muestra pasó comprobaciones estructurales independientes, pero **no** se incorporó al repositorio público ni a la aplicación: falta aclarar la licencia de la versión concreta y normalizar calendario/variantes antes de afirmar disponibilidad de viajes. La situación y la validación local segura están en [`bogota-private-audit-review.md`](bogota-private-audit-review.md). Los requisitos siguientes continúan siendo el contrato de referencia.

## Archivos de entrega

1. `data/bogota/pilot-001/dataset.json`: catálogo normalizado al contrato `TransitDataset` (`src/data/contract.ts`).
2. `data/bogota/pilot-001/sources.md`: auditoría de procedencia de cada dataset original, URL de acceso, entidad publicadora, condiciones de licencia, fechas de consulta/actualización conocidas y descripción de las transformaciones.
3. `data/bogota/pilot-001/coverage.md`: rutas y sentidos efectivamente incluidos, paradas cubiertas, datos faltantes y límites del piloto.
4. `data/bogota/pilot-001/expected-trips.json`: casos de regresión documentados, con el formato reproducible descrito abajo. Se exige `cityId`, `originStopId`, `destinationStopId` y `sourceRefIds` por caso, además de ruta, patrón, sentido y paradas esperadas cuando existe itinerario. Los casos negativos deben limitar explícitamente su afirmación a la **muestra proporcionada**.

No crear estos archivos con datos presuntos. Si el chat de datos no puede obtener permiso de reutilización o recorridos documentados, debe entregar un informe de bloqueo y los archivos originales autorizados cuando aplique, no un itinerario inventado.

## Formato exacto de `expected-trips.json`

El verificador exige `schemaVersion: "0.1.0"`, `datasetVersion` igual al catálogo, `scope: "provided-catalog"` y un arreglo no vacío `cases`. Cada caso tiene un `id` único, `cityId`, `originStopId`, `destinationStopId`, `sourceRefIds` existentes en el dataset y un objeto `expected`.

**Viaje positivo:** `expected.status: "ok"`, `routeId`, `patternId`, `directionId` y `stopIds` en orden, incluyendo origen y destino. Todos estos identificadores deben corresponder a una secuencia y permisos de abordaje y descenso documentados. El verificador busca la alternativa esperada entre todas las devueltas, sin asumir que sea la primera.

**Caso negativo:** `expected.status: "no-direct-service"` o `"same-stop"` y `coverageNote` no vacío, explicando el alcance del catálogo. Un resultado negativo **no demuestra** que esa ruta no exista fuera de la muestra.

Se puede consultar un ejemplo únicamente **ficticio** en [`src/data/synthetic/expected-trips.json`](../src/data/synthetic/expected-trips.json). No copiar sus rutas, coordenadas ni IDs para crear datos reales.

Comandos disponibles:

```bash
npm run test:expected-trips
npm run verify:synthetic-trips
npm run test:bogota-handoff
npm run verify:bogota-pilot
```

`verify:bogota-pilot` informa «PENDIENTE» sin fallar si todavía no hay ningún archivo real; bloquea entregas parciales, fuentes sintéticas o inconsistencias. No reemplaza la revisión documental, jurídica o presencial.

## Campos mínimos del dataset

- `schemaVersion: "0.1.0"`, un `datasetVersion` único y `label` descriptivo.
- `publishable`: **false** mientras no se hayan confirmado procedencia y derechos de reutilización; no confundir accesibilidad pública con autorización de redistribución.
- `sourceRefs`: identificador, tipo (`official` / `secondary`), publicador, título, `url` verificable, `consultedAt`; registrar `publishedAt`, `validFrom`, `validTo` y `license` cuando estén documentados.
- `cities`: como mínimo Bogotá, con identificador estable, `countryCode: "CO"` y referencias de fuente.
- `stops`: identificador estable, `cityId`, nombre documentado, `latitude`, `longitude`, `sourceRefIds`; los puntos sin coordenadas verificables no pueden entrar al catálogo navegable.
- `routes`: `id`, `cityId`, `name`, código público si existe y `sourceRefIds`.
- `patterns`: uno por **sentido y variante documentados**, con `id`, `cityId`, `routeId`, `directionId` y `stops` ordenados.
- En `patterns[*].stops`: `stopId`, `sequence`, `boardingAllowed` y `alightingAllowed`. **No asumir ambos permisos en true** si la fuente no permite confirmarlos. La ausencia de esa información es un bloqueo a resolver con la fuente o una regla oficial documentada.
- `patterns[*].geometry` es opcional: solo incorporarla si existe trazado documentado y puede asociarse inequívocamente al patrón. No reconstruir carreteras uniendo paradas.
- `walkingConnections: []` si no hay conexiones peatonales explícitas comprobables. Para un primer viaje directo no son necesarias; no generarlas por cercanía.

## Validación al recibir el lote

1. Revisar la licencia y condiciones de redistribución de todos los recursos de origen; mantener `publishable: false` si es incierto.
2. Ejecutar `node scripts/validate-dataset.mjs data/bogota/pilot-001/dataset.json`.
3. Comprobar los IDs, el orden de paradas y los sentidos contra los archivos originales, sin crear trayectos de vuelta.
4. Ejecutar el motor `findDirectItineraries` para cada viaje esperado; confirmar ruta, patrón y secuencia, y añadirlos como tests de regresión.
5. Solo entonces cambiar `src/data/active.ts` para importar la nueva muestra. Mantener `src/data/synthetic/` separado.
6. Comprobar que los estados «sin cobertura», «sin viaje directo» y «datos inválidos» no se conviertan en recomendaciones engañosas.
7. Preparar APK de prueba **solo cuando** el conjunto interfaz + mapa + primer viaje documentado pase CI; no considerar la compilación una validación presencial.

## Pendientes que no debe resolver el equipo de interfaz inventando datos

- Información real de `stops` y `patterns` por sentido.
- Permisos de abordaje y descenso sustentados.
- Fecha de vigencia/última publicación y licencia concreta de las fuentes.
- Trazado de calles o geometrías operativas si no están disponibles oficialmente.
- Evidencia de cobertura para evitar interpretar la ausencia de un recorrido en el subconjunto como inexistencia del servicio en toda Bogotá.

El diseño es multiciudad, pero el piloto se limita a Bogotá hasta que el viaje directo esté comprobado. Tunja permanece fuera de alcance por ahora.
