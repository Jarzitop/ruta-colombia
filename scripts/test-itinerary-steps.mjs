import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { syntheticSchedule } from '../src/data/synthetic/dev.temporal.ts';
import { findScheduledDirectTrips } from '../src/gtfs/scheduled.ts';
import { buildScheduledSteps } from '../src/planner/itinerary-steps.ts';

const data = JSON.parse(readFileSync(new URL('../src/data/synthetic/dev.dataset.json', import.meta.url), 'utf8'));
const getTrip = (origin='dev-stop-a', destination='dev-stop-c') => {
  const r = findScheduledDirectTrips(syntheticSchedule, {
    serviceDate: '20261012', originStopId: origin, destinationStopId: destination,
  });
  assert.equal(r.status, 'ok');
  return r.candidates[0];
};
const tests = [
  ['instrucciones de tres paradas: abordaje, paso intermedio y descenso', () => {
    const result = buildScheduledSteps(getTrip(), data);
    assert.equal(result.status, 'ok');
    assert.match(result.steps[0], /Aborda en DEV Alfa/);
    assert.match(result.steps[1], /DEV Beta/);
    assert.match(result.steps[2], /Desciende en DEV Gamma/);
  }],
  ['el segmento de dos paradas no inventa paradas intermedias', () => {
    const result = buildScheduledSteps(getTrip('dev-stop-a', 'dev-stop-b'), data);
    assert.equal(result.status, 'ok');
    assert.doesNotMatch(result.steps.join(' '), /DEV Gamma/);
    assert.match(result.steps[1], /siguiente parada/);
  }],
  ['califica explícitamente ambos horarios interpolados', () => {
    const result = buildScheduledSteps(getTrip(), data);
    assert.equal(result.status, 'ok');
    assert.match(result.steps[0], /salida programada aproximada/);
    assert.match(result.steps[2], /llegada programada aproximada/);
    assert.match(result.notice, /no tiempos reales/);
  }],
  ['hora marcada como timepoint=1 no se describe como aproximada', () => {
    const trip = structuredClone(getTrip());
    trip.boardingTimeApproximate = false;
    const result = buildScheduledSteps(trip, data);
    assert.equal(result.status, 'ok');
    assert.match(result.steps[0], /salida programada:/);
    assert.doesNotMatch(result.steps[0], /salida programada aproximada/);
    assert.match(result.notice, /no tiempos reales/);
  }],
  ['rechaza paradas fuera del catálogo sin inventar nombres', () => {
    const trip = structuredClone(getTrip());
    trip.stopIds[1] = 'stop-fantasma';
    const result = buildScheduledSteps(trip, data);
    assert.equal(result.status, 'invalid-data');
    assert.deepEqual(result.steps, []);
  }],
  ['rechaza ruta si el primer stop no es el abordaje', () => {
    const trip = structuredClone(getTrip());
    trip.stopIds = ['dev-stop-b', 'dev-stop-c'];
    assert.equal(buildScheduledSteps(trip, data).status, 'invalid-data');
  }],
  ['rechaza ruta si el último stop no es el descenso', () => {
    const trip = structuredClone(getTrip());
    trip.stopIds = ['dev-stop-a', 'dev-stop-b'];
    assert.equal(buildScheduledSteps(trip, data).status, 'invalid-data');
  }],
  ['rechaza segmento vacío o sin descenso explícito', () => {
    const trip = structuredClone(getTrip());
    trip.stopIds = ['dev-stop-a'];
    assert.equal(buildScheduledSteps(trip, data).status, 'invalid-data');
  }],
  ['no mezcla instrucciones entre ciudades', () => {
    const changed = structuredClone(data);
    changed.stops[1].cityId = 'otra-ciudad';
    assert.equal(buildScheduledSteps(getTrip(), changed).status, 'invalid-data');
  }],
  ['conserva las horas de servicio tal como están documentadas', () => {
    const trip = structuredClone(getTrip());
    trip.scheduledBoardDeparture = '26:05:00';
    const result = buildScheduledSteps(trip, data);
    assert.equal(result.status, 'ok');
    assert.match(result.steps[0], /26:05:00/);
  }],
];
let failed = 0;
for (const [name, run] of tests) {
  try {run(); console.log('PASS:',name);}
  catch(e){failed++;console.error('FAIL:',name,e);}
}
console.log('Resultado:',tests.length-failed+'/'+tests.length,'pruebas de instrucciones programadas');
if(failed)process.exitCode=1;
