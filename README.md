# Ruta Colombia — MVP Android

Aplicación Expo + React Native + TypeScript para un MVP offline-first de rutas de transporte público. Bogotá será el primer dataset real. Este repositorio **no contiene todavía datos reales publicables**.

## Estado verificado (7 octubre 2026)
- Expo Doctor: 21/21; TypeScript: sin errores; validador: 5/5 casos.
- EAS Build Android `preview`: APK generada e instalada en Android real.
- MapLibre: geometría sintética visible; la primera prueba detectó un problema de gestos por un `ScrollView` padre. La corrección está en el código, pendiente de nuevo test físico.
- Mapa base de demostración: no es un mapa de calles de Bogotá.
- Dataset Bogotá: pendiente de «01 — Dirección y datos».

## Requisitos e instalación
Node.js >= 22.13, npm y cuenta de Expo/EAS para compilar en la nube.

```bash
npm install
npm run validate:data
npm run test:validator
npm run typecheck
npm run doctor
```

El lockfile `package-lock.json` debe generarse y versionarse desde el entorno local con acceso a npm; este repositorio se inicializó desde el archivo fuente sin lockfile. **No usar `npm ci` hasta incorporarlo.**

## APK independiente

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure -p android
npm run build:apk
```

El perfil `preview` de `eas.json` pide `android.buildType: "apk"`. MapLibre React Native contiene código nativo: **no funciona en Expo Go**. Si existe un proyecto EAS ya vinculado en tu ordenador, conserva su `extra.eas.projectId` de `app.json` al sincronizar este repositorio; no crees otro proyecto EAS accidentalmente.

## Datos y límites
- Contrato provisional: `docs/data-contract.md`; tipos: `src/data/contract.ts`.
- Datos de prueba exclusivos de desarrollo: `src/data/synthetic/dev.dataset.json`.
- Validador: `scripts/validate-dataset.mjs`.
- No invertir sentidos ni inventar transbordos, distancias, paradas u horarios.
- El mapa remoto de demostración `https://demotiles.maplibre.org/style.json` no representa un mapa callejero utilizable de Bogotá.
- No hay backend y la navegación offline aún no está implementada.

Consulta también `docs/decisions.md` y `docs/backlog.md`.
