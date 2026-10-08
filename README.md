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
npm run test:routing
npm run typecheck
npm run doctor
```

El lockfile `package-lock.json` debe generarse y versionarse desde el entorno local con acceso a npm; este repositorio se inicializó desde el archivo fuente sin lockfile. **No usar `npm ci` hasta incorporarlo.**

## Motor de viajes directos (solo lógica; no conectado a pantallas)

`src/routing/direct.ts` exporta `findDirectItineraries(dataset, { cityId, originStopId, destinationStopId })`. Acepta recorridos solo si existen como un mismo `pattern` documentado con **origen antes de destino**, abordaje y descenso permitidos y paradas en la misma ciudad. No construye el regreso, ni presume caminatas, horarios o tiempos. El estado `no-direct-service` **no significa** que sea imposible viajar con transbordos: esa fase todavía no está implementada.

Pruebas reproducibles con Node >=22.13:

```bash
npm run test:routing
```

El conjunto cubre sentido, orden, patrones inversos únicamente explícitos, permisos, referencias inválidas y cobertura. El código del motor fue comprobado en aislamiento con TypeScript y Node 22.16; las verificaciones integradas `npm run typecheck` y Android para este incremento siguen pendientes en el equipo del usuario.

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
