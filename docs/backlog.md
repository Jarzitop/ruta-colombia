# Backlog real

Leyenda: `[x]` implementado con evidencia local, `[~]` implementado pero pendiente de Android real, `[ ]` pendiente.

## Sprint 1 · 7–11 octubre

- [x] Base de proyecto Expo + TypeScript creada.
- [x] Versiones Expo/RN/React y MapLibre fijadas.
- [x] Plugin nativo MapLibre declarado en `app.json`.
- [x] Contrato de datos provisional documentado.
- [x] Validador de dataset implementado y ejecutado sobre fixture sintético.
- [x] Dataset sintético aislado y marcado no publicable.
- [x] Pantalla mínima con MapLibre + línea + paradas sintéticas renderizada en Android real.
- [x] Perfil EAS `preview` configurado para producir APK.
- [x] Dependencias instaladas; `expo-doctor` 21/21 y `tsc --noEmit` sin errores en Windows.
- [x] APK Android `preview` generada correctamente con EAS Build.
- [~] APK instalada en teléfono: app estable, MapLibre y geometría sintética visibles. Detectado conflicto de gestos por `ScrollView`; corrección implementada y pendiente de retest físico.
- [ ] Verificar en Android real el comportamiento sin conexión del mapa/fallback.
- [ ] Recibir dataset real validado de Bogotá desde «01 — Dirección y datos».
- [ ] Incorporar `package-lock.json` generado en el equipo que compiló la APK y preservar vinculación con proyecto EAS existente.

## Sprint 2 · 12–17 octubre

- [ ] Importador de datos reales.
- [ ] Motor directo respetando sentido/orden.
- [ ] Motor con máximo un transbordo explícito.
- [ ] Ranking: menos transbordos y luego menor caminata documentada.
- [ ] Estados de no cobertura/no itinerario.
- [ ] Instrucciones y geometría de itinerario.

## Sprint 3 · 18–22 octubre

- [ ] Persistencia local del último viaje.
- [ ] Prueba sin conexión del catálogo/cálculo/instrucciones.
- [ ] Correcciones de Bogotá.
- [ ] Evaluar Tunja solo si Bogotá no mantiene errores esenciales.

## Sprint 4 · 23–27 octubre

- [ ] Congelar funcionalidades.
- [ ] Pruebas en dispositivos Android.
- [ ] Correcciones de bloqueos, comprensión y rendimiento.
- [ ] APK candidata y documentación final.
