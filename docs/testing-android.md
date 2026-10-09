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

## Segunda APK interna: datos reales de Bogotá (pendiente de ejecutar)

**No se puede aprobar por CI ni distribuir a terceros.** Seguir el procedimiento privado de [`internal-bogota-apk.md`](internal-bogota-apk.md). Registrar nombre/modelo Android, versión OS, commit, versión GTFS, ID EAS y capturas de cada fallo.

15. Inicio: aparece «DATOS EN REVISIÓN — NO APTOS PARA VIAJAR», la atribución a TRANSMILENIO S.A. y el periodo programado del GTFS. Nunca el indicador ficticio de Sandbox.
16. «Recorrido directo» sin fecha debe estar deshabilitado. Elegir Bogotá y consulta por fecha y hora.
17. **12/10/2026:** origen **Portal Eldorado T-6B**, destino **Centro Memoria**. Sin filtro de hora se esperan servicios documentados de ambas variantes. El resultado debe distinguir la variante de 13 paradas de la de 14 y calificar todos los horarios interpolados como aproximados.
18. Cambiar solo el destino a **Universidades**. Solo los viajes **de 14 paradas** llegan al destino. No ofrecer un viaje de 13 paradas aunque comparta `service_id` o `shape_id`.
19. Seleccionar un viaje que termine en Centro Memoria. El mapa solo resalta y representa su secuencia (13 paradas); **no** dibuja la continuación de la variante larga ni muestra Universidades como parada de ese viaje.
20. Cambiar fecha a un día ordinario, y luego a un día fuera del feed (`2027-01-01`). Comprobar que cambian los viajes cubiertos y se distingue «fuera del periodo» de «no hay viaje en esta muestra».
21. Introducir hora mínima de salida y verificar que se compara con la **hora de abordaje**, no con la cabecera del patrón. No interpretar una hora programada como llegada en vivo.
22. Ver instrucciones de una alternativa: origen, parada(s) intermedias verificadas, destino y horas aproximadamente programadas, sin caminar/tranbordos inventados.
23. Cerrar completamente la aplicación, activar modo avión y volver a abrir. Repetir selección, fecha, itinerario e instrucciones **sin conexión**. El estilo esquemático actual carece de fuentes de red; aun así, MapLibre debe comprobarse realmente en el dispositivo.
24. Zoom con pinza, desplazamiento y doble toque, mapa visible/oculto y recuperación tras fallo. Registrar pantallas negras o errores nativos.
25. Validar presencialmente el recorrido elegido cuando sea seguro y factible. La versión y periodo declarados del feed no garantizan que el servicio esté operando.

La APK de integración real **todavía no ha sido compilada ni instalada**. No publicar el enlace EAS ni el binario en GitHub.

No confirmar disponibilidad de mapa de calles offline: solo el esquema local funciona sin red; un futuro proveedor de calles requerirá licencia y pruebas independientes.
