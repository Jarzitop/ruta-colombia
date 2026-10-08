# Automatización y seguimiento del MVP

## Costos previstos

- Expo EAS en plan **Free**: $0/mes con un máximo publicado de **15 builds Android/mes** (y 15 iOS, que no utilizaremos), cola de baja prioridad. Si la cuota se agota, el plan Free **no factura excedentes**: hay que esperar al siguiente mes o cambiar voluntariamente de plan. Ver https://expo.dev/pricing y https://docs.expo.dev/billing/faq/.
- GitHub Actions con **runners estándar en repositorio público**: uso gratuito. No seleccionar runners grandes ni servicios adicionales de pago. Ver https://docs.github.com/en/billing/concepts/product-billing/github-actions.
- El **token de Expo es una credencial**, no dinero ni crédito. No se debe incluir en código, issues, capturas ni chats.
- No activar planes de pago, credenciales de proveedores de mapas facturables ni servicios de terceros sin aprobación explícita del propietario.
- Propuesta: aproximadamente un build Android por incremento estable, no por commit. Las pruebas TypeScript/datos sí se ejecutan por push y PR.

## Automatización disponible

1. [CI](../.github/workflows/ci.yml): `push` a `main`, `pull_request` a `main` y `workflow_dispatch` ejecutan `npm ci`, validación dataset, tests del validador, tests de rutas, `tsc` y Expo Doctor.
2. [Android APK bajo demanda](../.github/workflows/android-apk.yml): solamente `workflow_dispatch`. Usa EAS perfil `preview` y la identidad EAS ya enlazada en `app.json`.
3. Verificar el primer CI en https://github.com/Jarzitop/ruta-colombia/actions antes de considerar automatización validada.

## Cómo activar compilaciones Android desde GitHub

Estas acciones las hace el propietario una sola vez:

1. Abrir https://expo.dev/settings/access-tokens con la sesión Expo correspondiente al proyecto `@jarzitop/ruta-colombia`.
2. Crear un **Personal access token** con una etiqueta reconocible, por ejemplo `github-ruta-colombia`.
3. Copiar el token al portapapeles; **no pegarlo en ChatGPT**.
4. Abrir https://github.com/Jarzitop/ruta-colombia/settings/secrets/actions.
5. En `Repository secrets`, elegir `New repository secret` y registrar `EXPO_TOKEN` con ese valor.
6. Entrar a https://github.com/Jarzitop/ruta-colombia/actions → **Android APK · bajo demanda** → `Run workflow` → rama `main` → `Run workflow`.
7. Tras una ejecución satisfactoria, abrir el enlace que EAS indique en el log del workflow y descargar la APK. El build EAS es remoto y funciona sin el portátil.

El token permite operar sobre recursos a los que la cuenta tenga acceso y debe protegerse como una contraseña. Puede revocarse desde Expo. Si se sospecha exposición: revocar, generar uno nuevo y actualizar el secreto de GitHub.

## Seguimiento de trabajo: Issues y Kanban

- Issues: https://github.com/Jarzitop/ruta-colombia/issues.
- Tareas con prefijos `[S1]`–`[S4]` y prioridad `P0` (bloqueante), `P1` (importante), `P2` (condicional).
- Cada issue documenta criterios de aceptación y dependencias. No cerrar tareas sin evidencia de tests o Android real cuando corresponda.
- Estados Kanban propuestos: **Backlog → Ready → In progress → Review/Testing → Done**; usar **Blocked** para dependencias externas.

### Crear el tablero visual (manual, si se desea)

El conector GitHub disponible actualmente permite administrar issues y archivos, pero **no crear GitHub Projects**. No afirmar que existe un tablero Project hasta crearlo.

1. Abrir https://github.com/users/Jarzitop/projects y hacer clic en `New project`.
2. Elegir plantilla `Board` / `Kanban` y titular **Ruta Colombia · MVP Oct 2026**.
3. Ajustar el campo `Status` con columnas **Backlog, Ready, In progress, Review/Testing, Done**. Si no aparece `Blocked`, representar bloqueo en una vista/filtro o nota del issue.
4. Agregar issues existentes del repositorio `Jarzitop/ruta-colombia` (en el proyecto usar `Add item` y buscar `ruta-colombia`).
5. Crear vistas por sprint o filtrar por título `[S1]`, `[S2]`, `[S3]` y `[S4]`. Evitar automatizaciones de pago no necesarias.

Las categorías de Kanban son **estado de trabajo**, diferentes de la aprobación de una prueba. Una tarea puede estar en Review/Testing aunque el código ya esté escrito.

## Flujo de trabajo mínimo

- **Planificación:** issue con criterio de aceptación y dependencia.
- **Implementación:** commit/PR enlazado al issue.
- **CI:** se ejecuta en la nube; no repetir las pruebas por PowerShell salvo para reproducir un fallo o cuando falle CI.
- **Validación física:** un build bajo demanda cuando tenga sentido verificar cambios en Android.
- **Cierre:** comentario con evidencia, versión del dataset, resultado de CI/Android, y cerrar issue.

**Importante:** una compilación APK satisfactoria no significa que la app esté validada funcionalmente. La prueba física del usuario sigue siendo imprescindible.
