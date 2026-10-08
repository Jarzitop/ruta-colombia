# Prueba física Android — incremento de selección y viaje directo

Esta prueba se realiza sobre una **nueva APK** generada desde el último commit, no sobre la APK original.

## Requisitos

- Ejecutar `git pull --ff-only origin main`, `npm ci`, `npm run test:routing`, `npm run typecheck`, `npm run doctor` antes de generar la APK.
- Compilar usando `npm run build:apk` y abrir la APK en Android sin computador conectado.
- No se usa Expo Go.

## Casos manuales obligatorios

1. **Inicio:** aparece «DATOS SINTÉTICOS — NO PUBLICABLES»; calcular está deshabilitado hasta elegir ciudad, origen y destino.
2. **Viaje directo:** seleccionar ciudad «Sandbox sintético», origen «DEV Alfa», destino «DEV Gamma», pulsar calcular. Debe aparecer ruta DEV-1, sentido «DEV Gamma» y secuencia Alfa → Gamma con 2 tramos del catálogo y 0 transbordos.
3. **Sentido inverso no creado:** origen «DEV Gamma», destino «DEV Alfa». Debe salir «No hay viaje directo documentado en este sentido» y nunca sugerir DEV-1 en dirección contraria.
4. **Misma parada:** origen y destino «DEV Beta». Debe explicar que no se necesita un viaje en bus.
5. **Cambio de selección:** después de un resultado, cambiar origen o destino. El resultado antiguo debe desaparecer hasta volver a calcular.
6. **Gestos:** sobre el mapa, arrastrar en vertical y horizontal con un dedo; hacer pellizco con dos dedos para acercar/alejar. La pantalla no debe deslizarse verticalmente en lugar del mapa.
7. **Mapa sin red:** apagar Wi-Fi y datos móviles, forzar cierre y abrir la app. Deben funcionar selección y cálculo del viaje sintético. El mapa remoto puede quedar vacío o mostrar error. No debe cerrarse la app.
8. **Resistencia:** tocar y desplazar repetidamente el mapa. Anotar si aparece pantalla negra y si las selecciones/cálculo continúan funcionando.

## Interpretación

- El fondo naranja/limitado pertenece a los tiles de demostración y **no valida un mapa callejero real**.
- La línea en el mapa sigue representando el **patrón ficticio completo**, no el segmento exacto entre las paradas elegidas.
- La lógica de viaje directo tiene 17 pruebas automatizadas; los casos visuales/gestos/offline quedan pendientes hasta prueba física.
- No hay transbordos, persistencia local ni rutas reales de Bogotá implementadas.

Anotar dispositivo Android, versión Android, build EAS y observaciones cuando termine cada caso.
