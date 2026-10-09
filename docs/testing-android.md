# Prueba física Android — siguiente APK de integración (pendiente)

Esta lista se ejecutará después de agrupar los cambios de interfaz, selección por fecha y mapa; **no requiere cargar ni distribuir GTFS real**. La primera APK instalada no verifica el estado actual. La próxima compilación será de integración con un catálogo enteramente ficticio, sin publicación en Google Play.

## Preparación

- Revisión de `main` y GitHub Actions con tests/TypeScript/Expo Doctor en verde.
- APK autónoma desde perfil EAS `preview` (`npm run build:apk` o workflow manual), **solo después de autorizar la prueba**. No usar Expo Go.
- Ejecutar `npm run check:preview-data` y `npm run test:preview-data` para confirmar que solo se empaquetarán datos ficticios. `npm run build:apk` ejecutará preflight automáticamente mediante `prebuild:apk`; el workflow manual tiene el mismo bloqueo.
- No copiar el ZIP GTFS ni sus archivos a la carpeta del proyecto o al contexto de compilación.
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
- [ ] Elegir DEV Alfa → DEV Beta y fecha `2026-10-12`: deben aparecer **dos opciones ficticias diferenciadas**, cada una con su parada de abordaje, salida y llegada programadas aproximadas.
- [ ] Elegir DEV Alfa → DEV Gamma el mismo día: solo la **variante larga** ficticia atiende ese destino.
- [ ] Dejar la hora mínima vacía: aparecen las dos opciones hacia DEV Beta. Introducir `10:02`: queda solo la opción corta ficticia a las 10:03; introducir `10:03`: sigue siendo válida (umbral inclusivo).
- [ ] Introducir `10:60`, `ahora` o `10:20:00`: se informa formato inválido y se bloquea la consulta; no aparece un resultado antiguo.
- [ ] Elegir una opción ficticia; en el mapa solo deben resaltarse sus paradas, con origen verde/destino naranja. No se dibuja una línea de calles ni se atribuye la geometría de la variante larga a la corta.
- [ ] Abrir las instrucciones de esa opción: deben mencionar origen, paradas intermedias documentadas, destino, hora programada aproximada y advertencia «no tiempo real»; ninguna indicación peatonal o transbordo inventado.
- [ ] Si MapLibre notifica un error, comprobar que aparece un aviso con **Reintentar mapa**, que se puede recuperar el renderizado y que la búsqueda/instrucciones siguen accesibles sin mapa. No aprobar este caso si el fallo no se logra reproducir o simular de forma controlada.
- [ ] En una pantalla pequeña, seleccionar una opción mientras el mapa está oculto: debe abrirse mediante el control y mostrar las paradas. Volver al modo directo y confirmar que desaparece el resaltado de la opción temporal.
- [ ] Cambiar fecha, hora, ciudad o parada tras elegir una opción: se limpia la selección del viaje anterior. Probar varios cambios consecutivos.
- [ ] Cambiar a `2026-10-19`: la variante de servicio especial desaparece y se conserva solo la programada para día ordinario dentro del fixture.
- [ ] Elegir fecha fuera del intervalo `2026-10-01` a `2026-10-31`: debe informar falta de cobertura temporal, no ausencia de buses.
- [ ] Probar `2026-02-30` (fecha inválida), `2025-02-29` (no bisiesto) y un formato distinto de `AAAA-MM-DD`: debe aparecer un aviso de fecha inválida y deshabilitarse la consulta.
- [ ] Cambiar origen, destino o el modo después de calcular; no deben persistir resultados anteriores. Al cambiar solo una parada, se conserva la fecha elegida.
- [ ] Repetir todas las consultas sin conexión, tras cerrar completamente la app y abrirla en modo avión.
- [ ] Comprobar que el mapa esquemático no invente el trayecto de la variante corta ni líneas callejeras.
- [ ] En pantalla pequeña (altura inferior a ~700 puntos), la app debe iniciar con mapa oculto para priorizar controles; tocar «Mostrar mapa» y verificar su arrastre y zoom. La selección y la consulta por fecha deben seguir accesibles.

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
