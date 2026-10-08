# Bogotá pilot-001 — licencia, vigencia y decisión de pruebas (08/10/2026)

**Estado:** revisión documental aportada por «01 — Dirección y datos». Este documento registra lo que la revisión sostiene; **no equivale a una autorización escrita de TransMilenio ni a asesoría jurídica**. Fuente recibida: `Ruta_Colombia_revision_datos_Bogota_2026-10-08(1).md`. No se incluyen archivos de operación GTFS en este repositorio público.

## Evidencia y niveles de certeza

- **Documentado por el equipo de datos:** el [catálogo distrital GTFS SITP](https://datosabiertos.bogota.gov.co/dataset/especificacion-gtfs-general-transport-feed-specification-sitp) y su [recurso ZIP](https://datosabiertos.bogota.gov.co/dataset/especificacion-gtfs-general-transport-feed-specification-sitp/resource/0885fac9-a7bb-490f-abe8-ddee3bbe9cf2) declaran CC BY-SA 4.0; su [API CKAN](https://datosabiertos.bogota.gov.co/api/3/action/package_show?id=especificacion-gtfs-general-transport-feed-specification-sitp) devuelve el identificador de licencia.
- **Trazabilidad documental reportada:** el recurso lleva a la colección GTFS de TRANSMILENIO S.A.; el [ítem de 29/09/2026](https://datosabiertos-transmilenio.hub.arcgis.com/content/8f56b486d8044e698ad82e7e7bd4cbff) enlaza a la revisión. Su [ficha ArcGIS](https://www.arcgis.com/sharing/rest/content/items/8f56b486d8044e698ad82e7e7bd4cbff?f=json) muestra `licenseInfo: null` y el ZIP no trae archivo LICENSE. No significa revocación ni prueba de prohibición.
- **Inferencia razonable, todavía no confirmada:** CC BY-SA 4.0 probablemente cubra la revisión publicada por esa cadena documental. Debemos confirmar su alcance en la revisión concreta, sus eventuales exclusiones y su relación con los términos generales de TransMilenio antes de distribuir datos o APK a terceros.
- **Consulta pendiente (no enviada):** al contacto indicado en `feed_info.txt` solicitar alcance de licencia, condiciones de atribución, vigencia de esta entrega, variantes que comparten `shape_id` y naturaleza de los tiempos interpolados. El borrador está en el informe original; **no se ha enviado ninguna comunicación**.

Si se confirma CC BY-SA 4.0: atribuir, enlazar a la fuente y licencia, indicar transformaciones, conservar avisos y cumplir CompartirIgual cuando corresponda a adaptaciones compartidas; no inferir que toda la app debe tener la misma licencia. Evaluar de forma separada código, GTFS original y base transformada.

## Vigencia y precisión

- La revisión declara `feed_start_date=20260101`, `feed_end_date=20261231` y `feed_version=1`. Son límites de programación del feed, **no una garantía de que sigue actualizado**. Fecha de publicación, fecha de revisión y fechas de servicio son conceptos diferentes.
- Los **9.773 eventos** del piloto tienen `timepoint=0`; la salida/llegada es **aproximada o interpolada**. No conocemos el error ni un margen ± minutos. Mostrar «Salida programada aproximada» y «No es información en tiempo real»; no mostrar cuenta regresiva ni ETA exacta.
- Las 709 entradas son **viajes programados en el feed, no vehículos observados**. El día 12/10/2026 aparecen 150 viajes de 14 paradas y 153 de 13; ambos comparten `service_id=4`. No se puede atribuir una variante a una hora de corte única.
- La variante de 14 paradas termina en Universidades; la de 13 termina en Centro Memoria. Ambas referencian `shape_id=11231`. La línea completa no debe dibujarse como si la corta llegara a Universidades. Sin recorte de geometría documentado, mostrar solo paradas incluidas.
- Respetar `America/Bogota`, calendario/excepciones, secuencia y permisos, y los valores GTFS de tiempo mayores de 24 horas sin cambiar arbitrariamente su fecha de servicio.
- Fuera de la cobertura de una muestra o vigencia **no afirmar que no existe la ruta**. Si se recibe una revisión nueva que invalida los horarios, el horizonte anual no permite seguir recomendándolos.

Fuentes técnicas: [GTFS Schedule Reference](https://gtfs.org/documentation/schedule/reference/) y [texto legal CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/legalcode.es).

## Decisión de desarrollo y distribución

| Entorno | Decisión actual |
|---|---|
| GitHub público | **NO** agregar ZIP, CSV, `temporal.json` ni derivados operativos del piloto mientras haya incertidumbre de licencia. Publicar solo código y fixtures explícitamente sintéticos. |
| Interfaz sintética + CI | **Sí**: seguir implementando y verificando fechas, variantes, instrucciones y mapa offline sin necesidad de permiso sobre el GTFS real. |
| APK interna de ensayo en **dispositivos propios del equipo** | **Posible, condicional**, según la recomendación del chat de datos; mantener `publishable:false`, atribución, avisos y control de acceso. No implica exención de licencia. Requiere decidir explícitamente el momento y usar un proceso de compilación que **no suba el ZIP a GitHub público**. |
| APK a terceros, Play Store, datos abiertos propios | **Esperar** confirmación suficiente de licencia/alcance, atribución, vigencia y validación técnica/presencial. |

**Pendientes técnicos**: conectar `src/gtfs/scheduled.ts` al flujo por fecha con fixtures sintéticos; mantener la selección del catálogo local sin internet; probar gestos MapLibre/arranque en modo avión en Android real; verificar que la variante corta no dibuje geometría del patrón largo; preparar configuración de datos reales de desarrollo aislada de GitHub y de workflows públicos solo si hace falta para ensayo interno.

Documentos relacionados: [auditoría técnica](bogota-private-audit-review.md), [handoff](bogota-pilot-handoff.md), [matriz Android](testing-android.md), [issue #14](https://github.com/Jarzitop/ruta-colombia/issues/14).
