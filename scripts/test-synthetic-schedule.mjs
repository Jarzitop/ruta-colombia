import assert from 'node:assert/strict';
import { syntheticSchedule } from '../src/data/synthetic/dev.temporal.ts';
import { findScheduledDirectTrips, validateScheduledCatalog } from '../src/gtfs/scheduled.ts';
import { toGtfsServiceDate } from '../src/planner/service-date.ts';

const query = (date, origin='dev-stop-a', destination='dev-stop-c') =>
  findScheduledDirectTrips(syntheticSchedule, {
    serviceDate: date, originStopId: origin, destinationStopId: destination,
  });
const tests = [
  ['fixture temporal ficticio es internamente válido', () => {
    assert.deepEqual(validateScheduledCatalog(syntheticSchedule), []);
    assert.match(syntheticSchedule.scope, /synthetic/);
  }],
  ['calendario del fixture corresponde a dataset sintético', () => {
    assert.equal(syntheticSchedule.catalogDatasetVersion, 'dev-synthetic-001');
  }],
  ['fecha con dos variantes ficticias en parada compartida', () => {
    const r = query('20261012', 'dev-stop-a', 'dev-stop-b');
    assert.equal(r.status, 'ok');
    assert.deepEqual(r.candidates.map(c => c.patternId),
      ['dev-pattern-1-outbound', 'dev-pattern-short-outbound']);
  }],
  ['la variante corta nunca llega a la parada final ficticia', () => {
    const r = query('20261012');
    assert.equal(r.status, 'ok');
    assert.deepEqual(r.candidates.map(c => c.tripId), ['dev-holiday-long']);
  }],
  ['un día regular no usa el servicio excepcional ficticio', () => {
    const r = query('20261019');
    assert.equal(r.status, 'ok');
    assert.deepEqual(r.candidates.map(c => c.tripId), ['dev-weekday-long']);
  }],
  ['día del mes fuera del feed no genera viaje', () => {
    assert.equal(query('20261101').status, 'date-outside-feed');
  }],
  ['no invierte el sentido de la ruta de prueba', () => {
    assert.equal(query('20261012','dev-stop-c','dev-stop-a').status,'no-scheduled-trip-in-sample');
  }],
  ['hora no es tiempo real y se marca aproximada', () => {
    const r = query('20261012');
    assert.equal(r.status, 'ok');
    assert.equal(r.timing, 'scheduled-not-realtime');
    assert.equal(r.candidates[0].boardingTimeApproximate, true);
    assert.equal(r.candidates[0].alightingTimeApproximate, true);
  }],
  ['convierte fecha local escrita sin aplicar timezone del teléfono', () => {
    assert.equal(toGtfsServiceDate('2026-10-12'), '20261012');
  }],
  ['no acepta fechas escritas sin separadores', () => {
    assert.equal(toGtfsServiceDate('20261012'), null);
    assert.equal(toGtfsServiceDate('12/10/2026'), null);
  }],
  ['fecha imposible se rechaza en el motor', () => {
    assert.equal(query(toGtfsServiceDate('2026-02-30')).status,'invalid-query');
  }],
  ['rechaza fechas inexistentes antes de activar el botón', () => {
    assert.equal(toGtfsServiceDate('2026-02-30'), null);
    assert.equal(toGtfsServiceDate('2026-13-01'), null);
    assert.equal(toGtfsServiceDate('2026-00-10'), null);
    assert.equal(toGtfsServiceDate('2026-04-31'), null);
  }],
  ['distingue años bisiestos sin timezone del dispositivo', () => {
    assert.equal(toGtfsServiceDate('2024-02-29'), '20240229');
    assert.equal(toGtfsServiceDate('2025-02-29'), null);
  }],
  ['conserva fecha al cambiar origen sin cambiar el día de servicio', () => {
    const day = toGtfsServiceDate('2026-10-12');
    const a = query(day, 'dev-stop-a', 'dev-stop-c');
    const b = query(day, 'dev-stop-a', 'dev-stop-b');
    assert.equal(a.status, 'ok');
    assert.equal(b.status, 'ok');
    assert.equal(a.candidates.length, 1);
    assert.equal(b.candidates.length, 2);
  }],
];

let failed = 0;
for (const [name, test] of tests) {
  try { test(); console.log('PASS:', name); }
  catch (error) { failed++; console.error('FAIL:', name, error); }
}
console.log('Resultado:', tests.length - failed, '/', tests.length, 'pruebas de calendario UI');
if (failed) process.exitCode = 1;
