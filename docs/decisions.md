# Decisiones técnicas

## 2026-10-07 — Base Android

- Expo SDK 57 fijado con React Native 0.86.3 y React 19.2.3, siguiendo la plantilla oficial `sdk-57`.
- MapLibre React Native fijado en 11.5.0 para la prueba inicial.
- MapLibre v11 requiere New Architecture. Expo SDK 57 usa RN 0.86, donde New Architecture es obligatoria.
- No se usa Expo Go: MapLibre contiene código nativo y necesita development build/APK.
- El mapa de la primera prueba usa el estilo remoto de demostración de MapLibre. Sus tiles solo aportan detalle mundial hasta `maxzoom: 6`; por eso no debe interpretarse como un mapa callejero de Bogotá ni como decisión de proveedor para producción.
- El dataset sintético está separado en `src/data/synthetic/` y marcado `publishable: false`.
- No hay backend en el piloto.
- No se generan sentidos inversos ni conexiones peatonales implícitas.
- Tras la primera prueba física, el mapa deja de estar dentro de un `ScrollView`: en Android el contenedor padre estaba interceptando parte de los gestos verticales.
- EAS usará `cli.appVersionSource: remote`, que es la opción recomendada actualmente por Expo para gestionar `versionCode` de builds sucesivos.

## Evidencia Android 2026-10-07

- `expo-doctor`: 21/21 checks.
- TypeScript: `tsc --noEmit` sin errores.
- EAS Build `preview`: compilación terminada y APK generada.
- Teléfono Android real: la app abre, no se cierra, renderiza la geometría sintética y responde a interacción; queda pendiente retest de gestos tras retirar el `ScrollView`.
- Build EAS: https://expo.dev/accounts/jarzitop/projects/ruta-colombia/builds/b2d50c48-ebbe-4535-8ca0-0318c9880690

## Pendiente

- Proveedor/estrategia de mapa base para beta y política de uso offline.
- Persistencia local del último viaje.
- Contrato definitivo tras recibir el primer lote validado de Bogotá.
- Preservar la vinculación EAS del equipo local al clonar desde GitHub; no se añadió un ID no comprobado.
