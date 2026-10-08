# Prueba física Android — siguiente APK de integración (pendiente)

Esta lista se ejecutará **solo después de agrupar cambios útiles** en interfaz, mapa y primer conjunto de datos verificado, o antes si CI detecta un riesgo nativo que no podamos resolver sin dispositivo. La APK inicial no verifica el estado actual del código.

## Preparación

- Revisión de `main` y GitHub Actions con tests/TypeScript/Expo Doctor en verde.
- APK autónoma desde perfil EAS `preview` (`npm run build:apk` o workflow manual). No usar Expo Go.
- Registrar fecha, marca/modelo, versión Android, ID del build EAS, commit y `datasetVersion`.
- Antes de aprobar un viaje real, debe existir lote Bogotá revisado conforme a `docs/bogota-pilot-handoff.md`.

## Selección y motor con catálogo sintético

1. Inicio: aparece aviso **datos sintéticos** y el botón Buscar está deshabilitado hasta completar ciudad, origen y destino.
2. Ciudad Sandbox → DEV Alfa → DEV Gamma → Buscar: DEV-1 directo, sentido DEV Gamma, abordaje Alfa y descenso Gamma.
3. Usar **intercambiar**: DEV Gamma → DEV Alfa; el resultado anterior debe desaparecer y al buscar debe informar que no hay directo documentado.
4. DEV Beta → DEV Beta: explica misma parada; no crea una ruta artificial.
5. Después de un resultado, cambiar origen o destino debe borrar inmediatamente la recomendación anterior.
6. Cambiar de ciudad (cuando se incorpore una segunda ciudad auditada) debe limpiar paradas y resultado.
7. Selección y botón deben ser legibles en pantalla pequeña y teclado/lectores de accesibilidad; la lista del selector debe cerrarse con Atrás.

## Mapa y estado sin conexión

8. Arrastrar mapa vertical y horizontalmente: los gestos pertenecen al mapa, no desplazan toda la pantalla.
9. Pinza y doble toque para zoom; repetir la interacción sin pantalla negra ni cierre inesperado.
10. El mapa esquemático muestra puntos **solo del catálogo**, verde para origen y naranja para destino; al cambiar puntos, el encuadre se adapta.
11. En viaje de un tramo parcial, no se debe mostrar la geometría del recorrido completo como si fuera la línea exacta del viaje. Para patrón completo, línea solo si hay geometría documentada.
12. Ocultar mapa: la selección y las instrucciones continúan funcionando.
13. **Arranque en frío en modo avión:** cerrar la app completamente, activar modo avión, volver a abrir y seleccionar/calcular. No debe intentar cargar tiles remotos; el mapa esquemático, las paradas y las instrucciones deben seguir presentes.
14. Cualquier fallo de render nativo se reporta con captura, pasos y dispositivo; no marcar «corregido» solo por usar `androidView="texture"`.

## Cuando llegue la muestra real de Bogotá

15. Comprobar cada viaje del archivo `expected-trips.json` contra los IDs y recorridos documentados.
16. Registrar al menos un caso fuera de cobertura y uno sin directo. No extrapolar el conjunto de la muestra a todo Bogotá.
17. Verificar en persona una selección apropiada del subconjunto cuando sea posible.

No confirmar disponibilidad de mapa de calles offline: solo el esquema local funciona sin red; un futuro proveedor de calles requerirá licencia y pruebas independientes.
