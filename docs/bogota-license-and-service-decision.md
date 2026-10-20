# Bogotá piloto: licencia GTFS, vigencia y estado de publicación

**Actualizado el 20/10/2026:** TRANSMILENIO S.A. respondió por escrito a la petición del equipo, en un oficio de octubre de 2026 firmado por el director de Tecnologías de la Información y Comunicaciones. El documento completo, con datos personales del solicitante, se guarda fuera de GitHub público. Este registro es una síntesis de sus seis respuestas; no publica el PDF ni lo confunde con un certificado de actualidad operativa.

## Confirmación institucional — asunto de licencia resuelto

1. **Alcance.** TRANSMILENIO S.A. expresa que **CC BY-SA 4.0 se extiende a todos los conjuntos ZIP GTFS actuales y futuros** ofrecidos en su portal. La revisión del 29/09/2026 pertenece a la clase de entregas cuya licencia fue consultada. El campo técnico `licenseInfo:null` de ArcGIS no debe interpretarse ahora como una exclusión de esa declaración escrita.
2. **Derechos de reutilización.** La carta indica expresamente que la licencia permite extraer, compilar, transformar, adaptar, compartir y redistribuir los datos, **también comercialmente**. La pregunta que respondió mencionaba específicamente archivo independiente, APK Android, uso sin conexión y eventual publicación en Google Play. Se aplican las condiciones generales de CC BY-SA 4.0.
3. **Obligaciones.** Atribuir al titular de los datos, proporcionar enlace a la licencia, señalar las modificaciones y licenciar las **adaptaciones de los datos** compartidas bajo CC BY-SA 4.0 o licencia compatible. **No asumir** que por ello todo el código independiente de Ruta Colombia debe publicarse bajo la misma licencia. Antes de la distribución pública definir cómo se entregará la base derivada con aviso de licencia apropiado.
4. **Texto de atribución.** En la consulta se propuso un reconocimiento que diferenciaba el GTFS, la selección/normalización y la ausencia de aval oficial. TRANSMILENIO ratificó la obligación de atribuir y anunció que revisaría la mejor forma de señalar sus licencias. **No afirmó literalmente la aprobación final de cada palabra** del modelo de créditos propuesto.
5. **Portal y terceros.** La entidad reiteró la aplicación de CC BY-SA a los conjuntos de su portal de datos abiertos. Esta respuesta **no licencia** por defecto datos de terceros ni de otras ciudades.

Fuentes abiertas de referencia: [catálogo distrital GTFS](https://datosabiertos.bogota.gov.co/dataset/especificacion-gtfs-general-transport-feed-specification-sitp), [revisión publicada 29/09/2026](https://datosabiertos-transmilenio.hub.arcgis.com/content/8f56b486d8044e698ad82e7e7bd4cbff), [resumen de CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) y [texto legal](https://creativecommons.org/licenses/by-sa/4.0/legalcode.es).

## Asuntos técnicos que NO quedaron acreditados por la respuesta

- **Actualidad.** Al preguntar si el intervalo GTFS 01/01–31/12/2026 describe una vigencia operativa real o un horizonte nominal, la respuesta **solo remitió al portal oficial de datos abiertos**. No confirmó que el ZIP 29/09/2026 siga siendo la revisión más reciente ni que los viajes sigan operando hoy.
- **Exactitud horaria.** La pregunta indicó que los 9.773 eventos del piloto tienen `timepoint=0`. La entidad **no documentó precisión, interpolación ni margen de error**. Por interpretación del estándar GTFS se conservan **horas programadas aproximadas**, nunca ETA ni tiempo real.
- **Variantes.** La respuesta atribuye diferencias de trazado al día de operación y a la ciclovía dominical. **No explica cómo distinguir exactamente los 150 viajes largos y 153 cortos que aparecen bajo el mismo `service_id=4` para 12/10/2026**. No inventar cortes horarios ni una regla de día que reemplace `trip_id → patternId`.
- **Geometría.** Ambas variantes documentadas comparten `shape_id=11231`; sigue prohibido dibujar la continuación de la variante corta a Universidades. La variante de 13 paradas termina en Centro Memoria; la de 14 en Universidades.
- **Cobertura.** Son 709 viajes de un subconjunto, no evidencia de que todos los buses o rutas estén representados. «Sin viaje compatible» no equivale a «no existe el servicio».

## Decisión de ingeniería y publicación

| Contexto | Política posterior al oficio |
| --- | --- |
| Código en GitHub público | Sí; publicar fuentes de código, módulos, pruebas ficticias y **esta síntesis sin datos personales**. La licencia GTFS ya no es el motivo para ocultar código. |
| Datos de desarrollo privados | Continuar con `publishable:false` hasta verificar vigencia y rutas. Mantener el overlay del piloto fuera del repo por decisión operativa y para evitar una distribución prematura, no porque la licencia prohíba compartirlo. |
| APK interna | Permitida por CC BY-SA 4.0 con créditos/condiciones correspondientes; mantener controles de acceso del build EAS y verificar costo cero. Distribución interna no exime de atribución ni CompartirIgual cuando correspondan. |
| APK a terceros / Google Play | **La licencia de los datos ya no es el bloqueo principal.** Antes de lanzar: revisión reciente de versión GTFS, atribución accesible, licencia de la base derivada, actualización de datos, revisión de avisos y ensayos físicos Android. |
| Otras ciudades | Verificar fuente, vigencia y licencia **independientemente**; no transferir esta confirmación a Tunja. |

La app muestra «Datos originales: TransMilenio» y enlace a fuente y licencia con aviso de transformación e independencia, manteniendo «DATOS EN REVISIÓN — NO APTOS PARA VIAJAR» cuando `publishable:false`.

Relacionados: [instrucciones de APK privada](internal-bogota-apk.md), [auditoría previa](bogota-private-audit-review.md), [pruebas Android](testing-android.md), [issue #14](https://github.com/Jarzitop/ruta-colombia/issues/14).
