# Contrato de datos provisional — v0.1.0

Estado: **provisional**. Diseñado para permitir varias ciudades sin acoplar el motor a Bogotá.

## Principios obligatorios

1. Cada dato operativo debe apuntar a una o más `sourceRefs`.
2. `consultedAt` registra cuándo se consultó la fuente; no equivale a fecha de actualización.
3. Los sentidos se modelan como `patterns` independientes y ordenados. El motor no puede invertir un patrón para fabricar el regreso.
4. Cada entrada de `pattern.stops` indica el orden y si se permite abordar/bajarse.
5. Los transbordos peatonales solo existen si aparecen en `walkingConnections`; queda prohibido crearlos por proximidad geométrica.
6. El dataset publicable no puede contener fuentes `synthetic`.
7. Geometría y distancia peatonal solo se usan si están documentadas. No se inferirá “más rápido” sin datos temporales suficientes.

## Entidades

- `sourceRefs`: procedencia, consulta, vigencia y licencia cuando existan.
- `cities`: catálogo de ciudades.
- `stops`: paradas/puntos de abordaje con coordenadas documentadas.
- `routes`: identidad pública/comercial de un servicio.
- `patterns`: recorrido de una ruta en un sentido concreto, con paradas ordenadas y geometría opcional.
- `walkingConnections`: conexión peatonal explícita entre dos paradas y distancia documentada.

La definición TypeScript vive en `src/data/contract.ts`; el validador ejecutable está en `scripts/validate-dataset.mjs`.

## Pendiente de confirmar por «01 — Dirección y datos»

Antes de incorporar Bogotá como dataset publicable, ese chat debe entregar o confirmar:

- identificadores estables para rutas, variantes/sentidos y paradas;
- cómo representa la fuente cada sentido y si existe secuencia explícita de paradas;
- reglas de abordaje/descenso si la fuente las distingue;
- geometrías oficiales o suficientemente documentadas, y su relación con cada patrón;
- conexiones peatonales permitidas/documentadas y su distancia, si existen;
- operador/nombre/código de ruta cuando estén documentados;
- URL/fuente, entidad publicadora, fecha de consulta, fecha de publicación/actualización si aparece, vigencia y licencia/condiciones de reutilización;
- qué subconjunto de Bogotá está suficientemente completo para considerarse cubierto.

Si alguno de estos datos esenciales falta, el importador/validador debe bloquear ese itinerario en vez de inferirlo.
