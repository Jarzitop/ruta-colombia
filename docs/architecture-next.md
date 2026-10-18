# Arquitectura del MVP y método de integración (17/10/2026)

## Objetivo inmediato

Obtener **un viaje directo de Bogotá probado en Android** (fecha, hora, variante, paradas e instrucciones) sin afirmar tiempo real, sin inventar transbordos y sin publicar el GTFS ni la APK. No ampliar a Tunja hasta cerrar la prueba del piloto.

## Separación de módulos

| Capa | Responsabilidad | Estado |
| --- | --- | --- |
| `src/data` | Contrato multiciudad, procedencia, avisos y selección del catálogo activo | Implementado; overlay real solo en clon privado |
| `src/gtfs` | Validar calendario/viajes y consultar programación aproximada de GTFS | Implementado; 709 viajes verificados en paquete privado |
| `src/planner` | Normalizar fecha/hora, preparar consultas compatibles con versión de datos y presentar instrucciones | Separación inicial implementada, aún sin un estado único de pantalla |
| `src/components` y `App.tsx` | Entrada del usuario, selección de alternativa y estados visibles | Funcionalidad implementada; conviene dividir la pantalla grande después de pruebas físicas |
| `src/map` | Renderizar solo paradas/geometría documentadas con esquema offline | Código offline; zoom/gestos y modo avión pendientes de retest Android |
| `scripts` y CI | Validar contratos, variantes y protección de datos; bloquear builds no autorizados | Tests públicos sintéticos; build real únicamente desde checkout privado |

El límite `src/planner/scheduled-query.ts` garantiza que la versión del catálogo de paradas y la del calendario coinciden **antes** de ejecutar una consulta, y evita mezclar días, horas o fuentes de revisiones distintas. La UI sigue mostrando por separado «sin datos», «fuera del feed» y «sin viajes en esta muestra». La preparación no decide si un horario sigue vigente en el mundo real.

## Próximos incrementos, en orden

1. **Prueba de integración privada reproducible**: con clon local, overlay del GTFS y pruebas de ambas variantes, fecha fuera del feed y hora de abordaje. No subir assets privados a GitHub. Obtener la respuesta de TransMilenio y confirmar términos aplicables.
2. **Segunda APK sin sobrecosto y acceso restringido**: verificar plan Expo Free, cuota Android y autenticación de enlaces antes de autorizar transferencia de JSON a EAS; opción de build local si no se dan estas condiciones.
3. **Regresión física Android**: pantalla pequeña, selección, MapLibre, fallos de carga y arranque en modo avión. Separar errores del motor de los de renderizado.
4. **Refactorización por evidencia**: separar la UI de `App.tsx` en componentes si el test físico muestra fricciones; precalcular/indexar catálogo temporal solo si las consultas reales presentan latencia medible. No introducir backend, Redux ni otra ciudad por anticipación.

## Política de commits y CI

- Trabajar por **incremento vertical**: código + tests + documentación, con alcance y criterios de aceptación definidos antes de cambiar archivos.
- **Un commit por incremento**, normalmente mediante una sola operación de árbol Git; squash si hay commits de trabajo en una rama.
- **Una ejecución de CI sobre el incremento completo**: no empujar un archivo a la vez. Esperar CI, corregir y volver a validar solo si falla.
- No forzar commits con `src/data/private`, ZIP del GTFS, `.easignore` ni APK. La rama pública conserva fixtures ficticios.
- No reescribir los commits antiguos solo para disminuir el contador.
- Documentar evidencia por incremento (SHA, tests, estado Android y bloqueos) y actualizar issues **sin crear commits** para cada nota.
- Excepciones: parche urgente o separación necesaria para evitar un cambio riesgoso.

## Criterio de aceptación de este incremento

- La consulta generada desde la UI incorpora fecha GTFS y hora opcional sin usar timezone del teléfono.
- Nunca se ejecuta el motor si faltan paradas, si la entrada es inválida o si `datasetVersion` difiere del calendario.
- El comportamiento de variantes, horas aproximadas y estados fuera del feed se conserva.
- `npm run test:scheduled-query`, las demás pruebas, TypeScript y Expo Doctor pasan en GitHub Actions.
- **Ninguna APK EAS** ni archivo privado se genera/publica al hacer este refactor.
