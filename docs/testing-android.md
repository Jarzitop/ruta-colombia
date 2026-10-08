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

## Consulta por fecha (fixture ficticio, pendiente de Android)

- [ ] Alternar entre **Recorrido directo** y **Por fecha de servicio** sin mostrar resultados del modo anterior.
- [ ] Elegir DEV Alfa → DEV Beta y fecha `2026-10-12`: la muestra debe ofrecer las **dos variantes ficticias**, ordenadas por hora programada de abordaje; todas las horas se presentan como **aproximadas**, nunca tiempo real.
- [ ] Elegir DEV Alfa → DEV Gamma el mismo día: solo la **variante larga** ficticia atiende ese destino.
- [ ] Cambiar a `2026-10-19`: la variante de servicio especial desaparece y se conserva solo la programada para día ordinario dentro del fixture.
- [ ] Elegir fecha fuera del intervalo `2026-10-01` a `2026-10-31`: debe informar falta de cobertura temporal, no ausencia de buses.
- [ ] Probar `2026-02-30` (fecha inválida) y un formato distinto de `AAAA-MM-DD`: no debe aparecer un viaje.
- [ ] Cambiar origen, destino o el modo después de calcular; no deben persistir resultados anteriores.
- [ ] Repetir todas las consultas sin conexión, tras cerrar completamente la app y abrirla en modo avión.
- [ ] Comprobar que el mapa esquemático no invente el trayecto de la variante corta ni líneas callejeras.

**No usar estos casos como comprobación de recorridos reales de Bogotá**: las fechas y horas de la interfaz pertenecen a un fixture sintético y están señalizadas como tales.

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
