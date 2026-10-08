# Ruta Colombia MVP

Ruta Colombia es una aplicación Android en desarrollo para ayudar a encontrar recorridos de transporte público dentro de las ciudades de Colombia. La idea es que una persona pueda elegir su ciudad, indicar de dónde sale y a dónde quiere llegar y consultar qué servicio tomar, dónde abordar y cómo completar el trayecto. El proyecto comienza con un piloto en Bogotá, que podremos comprobar presencialmente, y está pensado para incorporar otras ciudades a medida que existan datos suficientes y confiables.

La aplicación se desarrolla con **React Native, Expo y TypeScript**. Su objetivo es que la consulta de rutas, el cálculo del itinerario y las instrucciones funcionen con un catálogo local, sin depender de internet ni de un servidor. El mapa se integra con **MapLibre**; por ahora, el mapa base de demostración puede necesitar conexión.

## Qué incluye el MVP

El flujo principal reúne la selección de ciudad, origen y destino, el cálculo de un recorrido y la presentación de instrucciones junto a un mapa. En esta primera etapa ya contamos con una pantalla de selección y un motor de viajes directos, pero ambos trabajan con un **catálogo sintético de desarrollo**, claramente identificado como no publicable. Todavía no se ofrecen recorridos reales para desplazarse por Bogotá.

La siguiente etapa consiste en incorporar datos documentados del piloto, admitir hasta un transbordo explícito y completar las pruebas en Android. No están contemplados para esta beta los horarios en tiempo real, las cuentas, los pagos ni la conexión entre ciudades. Tampoco se estimará cuál es el trayecto más rápido sin información que lo respalde.

## Instalación y pruebas

Se necesita **Node.js 22.13 o superior** y npm. Una vez clonado el repositorio, instala las dependencias y ejecuta las comprobaciones:

```bash
git clone https://github.com/Jarzitop/ruta-colombia.git
cd ruta-colombia
npm ci
npm run validate:data
npm run test:validator
npm run test:routing
npm run typecheck
npm run doctor
```

Las pruebas del motor comprueban que se respeten el sentido y el orden de las paradas, los permisos de abordaje y descenso y los límites de cobertura. El contrato de datos tiene también su propio validador para detectar referencias y secuencias incorrectas antes de utilizarlas.

## Motor de viajes y selección

El archivo `src/routing/direct.ts` exporta `findDirectItineraries(dataset, { cityId, originStopId, destinationStopId })`. La función acepta un viaje directo solo cuando el origen aparece **antes del destino** dentro de un mismo patrón de recorrido documentado, las paradas corresponden a la ciudad elegida y se permite abordar y descender en los puntos solicitados. No invierte rutas para inventar el regreso ni crea conexiones peatonales por proximidad.

La interfaz está en `App.tsx`, con los selectores del catálogo en `src/components/CatalogPicker.tsx`. Al calcular, muestra el sentido del servicio, la parada de abordaje y la de descenso; cuando el viaje no está documentado, explica la limitación. Por ahora, el mapa representa un recorrido ficticio completo como referencia y no la geometría exacta del tramo seleccionado.

## Compilar para Android

El proyecto utiliza **EAS Build** para producir una APK que se pueda instalar y abrir en un teléfono sin mantener el computador conectado. Hace falta una cuenta de Expo con acceso al proyecto; la configuración de EAS ya está asociada a este repositorio.

```bash
npx eas-cli@latest login
npm run build:apk
```

El perfil `preview` de `eas.json` genera un archivo APK. **MapLibre requiere compilación nativa y no funciona en Expo Go.** También existe un workflow de [compilación bajo demanda](.github/workflows/android-apk.yml) en GitHub Actions, que puede activarse con un token de Expo guardado como secreto del repositorio; no hace falta configurarlo para ejecutar las pruebas automáticas.

## Datos y organización

El contrato común para distintas ciudades se describe en [`docs/data-contract.md`](docs/data-contract.md) y sus tipos están definidos en `src/data/contract.ts`. Mientras se seleccionan y validan los datos reales, los recorridos ficticios permanecen separados en `src/data/synthetic/`. No se publicarán rutas, paradas, conexiones, tarifas ni horarios que no estén respaldados por fuentes identificables.

El trabajo se organiza en [issues](https://github.com/Jarzitop/ruta-colombia/issues) y se comprueba automáticamente mediante [GitHub Actions](https://github.com/Jarzitop/ruta-colombia/actions). Para consultar el avance y las pruebas pendientes están el [backlog](docs/backlog.md), las [decisiones técnicas](docs/decisions.md) y la [guía de pruebas Android](docs/testing-android.md); la [guía de automatización](docs/automation.md) reúne los detalles de CI, compilaciones y costos.
