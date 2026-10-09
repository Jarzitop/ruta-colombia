# Segunda APK — Bogotá real, solo ensayo interno

**Estado técnico (8 de octubre de 2026):** preparar una compilación local de trabajo con datos reales auditados, **no publicables**. Este procedimiento NO sube el GTFS original ni las muestras derivadas a GitHub público. La app no está verificada aún en Android con esta versión.

## Datos y límites

Fuente: GTFS TRANSMILENIO S.A. revisión 29/09/2026, únicamente el piloto de una ruta. `datasetVersion: bogota-pilot-001-gtfs-20260929-audit-20261007`. Los datos se mantienen `publishable: false`.

`temporal.json` aporta 709 viajes y 9.773 eventos de parada, con dos patrones que tienen **14 y 13 paradas**. La variante de 13 termina en **Centro Memoria**, la de 14 en **Universidades**. Ambos se deben buscar por `tripId + serviceId + patternId + fecha/hora`; **no** usar búsqueda atemporal en una muestra real. El paquete aporta 16 casos de regresión del calendario, festivos y variantes. Todos sus `timepoint=0` son **aproximados**, no una estimación de llegada actual. La vigencia declarada del feed (2026-01-01 a 2026-12-31) no certifica actualidad de la versión recibida.

En modo real, la app habilita **solo** el cálculo por fecha/hora y deshabilita «Recorrido directo» sin calendario. Seleccionar una salida muestra el conjunto exacto de paradas del viaje. La geometría de 14 paradas no se copia a la variante corta; el mapa muestra marcadores locales en lugar de inventar un tramo de calle.

## Opción A: instalar desde el ZIP original, sin publicar datos

Usar **un clon independiente** de prueba, no el directorio principal de trabajo. En PowerShell de Windows:

```powershell
cd "$HOME\Downloads"
git clone https://github.com/Jarzitop/ruta-colombia.git ruta-colombia-interno
Expand-Archive -LiteralPath "$HOME\Downloads\Bogota_pilot_001_auditoria(1)(1).zip" `
  -DestinationPath "$HOME\Downloads\bogota-privado" -Force
cd "$HOME\Downloads\ruta-colombia-interno"
npm ci
npm run test:private-normalizer
npm run install:bogota:private -- "$HOME\Downloads\bogota-privado\data\bogota\pilot-001"
npm run check:bogota:private
npm run typecheck
```

El instalador exige cuatro documentos y los archivos `dataset.json`, `temporal.json` y `expected-temporal-cases.json`. Valida el catálogo, las dos variantes y los 16 casos **antes** de copiar datos al proyecto. Crea exclusivamente `src/data/private/bogota.dataset.json`, `src/data/private/bogota.temporal.json`, un `src/data/active.ts` modificado **localmente** y `.easignore` local. No copiar el ZIP original ni `audit-work/` al checkout.

## Opción B: overlay privado ya normalizado (más rápida)

Como alternativa al instalador, usar el archivo **privado compartido en esta conversación** `ruta-colombia-bogota-overlay-privado.zip` (no está en GitHub).

```powershell
cd "$HOME\Downloads"
git clone https://github.com/Jarzitop/ruta-colombia.git ruta-colombia-interno
Expand-Archive -LiteralPath "$HOME\Downloads\ruta-colombia-bogota-overlay-privado.zip" `
  -DestinationPath "$HOME\Downloads\ruta-colombia-interno" -Force
cd "$HOME\Downloads\ruta-colombia-interno"
npm ci
npm run check:bogota:private
npm run typecheck
```

El overlay contiene **solo** catálogo normalizado, programación privada, reemplazo local del punto de entrada, `.easignore` y una nota de instalación. Para repetir los 16 vectores de regresión se necesita también el ZIP original extraído; no incluirlo en el build.

## EAS Build: requiere una decisión consciente

**IMPORTANTE:** Expo EAS Build ejecuta la compilación en servidores de Expo, por lo que transmite el código y los **dos JSON derivados** del GTFS, aunque se mantengan fuera de GitHub. La distribución `internal` **no es privada por defecto**: según la [documentación oficial de Expo](https://docs.expo.dev/build/internal-distribution/), cualquiera con el URL puede acceder mientras esté habilitado el acceso sin autenticación.

Antes de hacer una compilación real:
1. Entrar a las opciones del proyecto en Expo y **desactivar «Unauthenticated access to internal builds»**; verificar con una cuenta no autorizada que el enlace no se abre sin autenticación.
2. Obtener el consentimiento del responsable del proyecto para transferir esos dos JSON a EAS. La declaración CC BY-SA del catálogo general no es una confirmación individual de la revisión de septiembre.
3. Comprobar en EAS cuota de compilaciones y costos aplicables al plan antes de ejecutar. No suponer gratuidad.
4. Solo entonces, desde el clon **privado**:

```powershell
$env:RUTA_PRIVATE_EAS_UPLOAD_APPROVED = "YES"
npm run build:apk:bogota
```

`prebuild:apk:bogota` exige la variable anterior, comprueba que no haya datos privados en el índice Git, verifica el catálogo real y TypeScript. El perfil `bogota-internal` genera una APK para distribución interna; **no** ejecuta EAS Submit ni Google Play. La primera ejecución puede solicitar inicio de sesión o credenciales de firma. **No colocar un token Expo en el código o en este chat.**

Una vez terminada la compilación, abrir el resultado desde la cuenta Expo autorizada y descargar la APK **solo al dispositivo propio**. Los binarios suelen poder instalarse abriendo la descarga en Android y autorizando la instalación del archivo desde esa fuente cuando el sistema lo solicite. No reenviar el enlace ni añadirlo a un issue o release público.

## Qué validar en el dispositivo

1. Aviso «DATOS EN REVISIÓN — NO APTOS PARA VIAJAR», fuente y versión GTFS visibles. No debe aparecer «Sandbox sintético».
2. Modo directo atemporal deshabilitado; fecha y hora son obligatorias u opcionales según su control.
3. Elegir paradas documentadas de Bogotá y consultar `2026-10-12`: ambas variantes disponibles cuando origen y destino están en el tramo común. Consultar destino Universidades: **nunca** ofrecer un `tripId` de 13 paradas.
4. Seleccionar una opción: ver origen, intermedias y descenso específicos, con horario **programado aproximado**; marcador de destino corto en Centro Memoria, no en Universidades.
5. Buscar fecha fuera del feed: estado «sin programación cubierta»; buscar sin viaje en muestra: no declarar inexistencia de servicio.
6. Ocultar y mostrar mapa; arrastre/pinza/doble toque; tratar fallos nativos sin bloquear búsqueda.
7. **Arranque en frío en modo avión**: el cálculo local y los marcadores sin tiles remotos deberían seguir disponibles. El mapa esquemático no equivale a cartografía vial offline.
8. Registrar modelo, Android, fecha, `datasetVersion`, capturas, fallo y pasos para reproducirlo.

No marcar un caso aprobado solo porque CI esté verde. Ver [matriz Android](testing-android.md) y [decisión de licencia](bogota-license-and-service-decision.md).

## Higiene de datos después de probar

NO ejecutar `git add -f`, `git commit`, `git push` en el clon privado. Los dos JSON y `.easignore` están excluidos por `.gitignore`; `src/data/active.ts` queda modificado solo localmente. Al terminar, eliminar el clon de ensayo y usar otro clon limpio para desarrollo público. El workflow público Android en GitHub permanece **sintético** y NO puede fabricar una APK de Bogotá real.
