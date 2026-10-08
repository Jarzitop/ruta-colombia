import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialPlannerState, reducePlanner } from '../src/planner/state.ts';

const data = JSON.parse(readFileSync(new URL('../src/data/synthetic/dev.dataset.json', import.meta.url), 'utf8'));
const update = (state, action, catalog = data) => reducePlanner(state, action, catalog);
const selected = () => {
  const city = update(initialPlannerState, { type: 'city', id: 'dev-city' });
  const origin = update(city, { type: 'origin', id: 'dev-stop-a' });
  return update(origin, { type: 'destination', id: 'dev-stop-c' });
};
const result = { status: 'no-direct-service', itineraries: [] };

const tests = [
  ['estado inicial sin selección ni viaje', () => {
    assert.deepEqual(initialPlannerState, { cityId: null, originStopId: null, destinationStopId: null, result: null });
  }],
  ['ciudad válida y paradas de su catálogo', () => {
    assert.equal(selected().cityId, 'dev-city');
    assert.equal(selected().originStopId, 'dev-stop-a');
    assert.equal(selected().destinationStopId, 'dev-stop-c');
  }],
  ['no permite origen antes de elegir ciudad', () => {
    assert.equal(update(initialPlannerState, { type: 'origin', id: 'dev-stop-a' }), initialPlannerState);
  }],
  ['rechaza ciudad inexistente', () => {
    assert.equal(update(initialPlannerState, { type: 'city', id: 'bogota-no-cubierta' }), initialPlannerState);
  }],
  ['rechaza parada fuera del catálogo', () => {
    assert.equal(update(selected(), { type: 'origin', id: 'desconocida' }).originStopId, 'dev-stop-a');
  }],
  ['cambiar origen invalida resultado calculado', () => {
    const prior = update(selected(), { type: 'result', value: result });
    assert.equal(prior.result, result);
    const next = update(prior, { type: 'origin', id: 'dev-stop-b' });
    assert.equal(next.result, null);
    assert.equal(next.destinationStopId, 'dev-stop-c');
  }],
  ['cambiar destino invalida resultado calculado', () => {
    const prior = update(selected(), { type: 'result', value: result });
    const next = update(prior, { type: 'destination', id: 'dev-stop-b' });
    assert.equal(next.result, null);
    assert.equal(next.originStopId, 'dev-stop-a');
  }],
  ['intercambio atómico invalida resultado', () => {
    const prior = update(selected(), { type: 'result', value: result });
    const next = update(prior, { type: 'swap' });
    assert.equal(next.originStopId, 'dev-stop-c');
    assert.equal(next.destinationStopId, 'dev-stop-a');
    assert.equal(next.result, null);
  }],
  ['no intercambia si falta una parada', () => {
    const incomplete = update(initialPlannerState, { type: 'city', id: 'dev-city' });
    assert.equal(update(incomplete, { type: 'swap' }), incomplete);
  }],
  ['cambio de ciudad borra origen destino y resultado', () => {
    const catalog = structuredClone(data);
    catalog.cities.push({ id: 'second-city', name: 'Ciudad 2 ficticia', countryCode: 'CO', sourceRefIds: ['src-dev-synthetic'] });
    const next = update(update(selected(), { type: 'result', value: result }), { type: 'city', id: 'second-city' }, catalog);
    assert.deepEqual(next, { cityId: 'second-city', originStopId: null, destinationStopId: null, result: null });
  }],
  ['no acepta parada de una ciudad diferente', () => {
    const catalog = structuredClone(data);
    catalog.cities.push({ id: 'second-city', name: 'Ciudad 2 ficticia', countryCode: 'CO', sourceRefIds: ['src-dev-synthetic'] });
    catalog.stops.push({ id: 'second-stop', cityId: 'second-city', name: 'Ficticia', latitude: 4, longitude: -74, sourceRefIds: ['src-dev-synthetic'] });
    assert.equal(update(selected(), { type: 'origin', id: 'second-stop' }, catalog).originStopId, 'dev-stop-a');
  }],
  ['la repetición de una selección conserva su resultado', () => {
    const prior = update(selected(), { type: 'result', value: result });
    assert.equal(update(prior, { type: 'city', id: 'dev-city' }), prior);
    assert.equal(update(prior, { type: 'origin', id: 'dev-stop-a' }), prior);
  }],
  ['no acepta resultados cuando el formulario está incompleto', () => {
    assert.equal(update(initialPlannerState, { type: 'result', value: result }), initialPlannerState);
  }],
  ['cambio de modo borra solo el resultado, conserva origen y destino', () => {
    const prior = update(selected(), { type: 'result', value: result });
    const next = update(prior, { type: 'clear-result' });
    assert.equal(next.result, null);
    assert.equal(next.originStopId, 'dev-stop-a');
    assert.equal(next.destinationStopId, 'dev-stop-c');
  }],
];

let failed = 0;
for (const [name, test] of tests) {
  try { test(); console.log('PASS:', name); } catch (error) { failed++; console.error('FAIL:', name, error); }
}
console.log('Resultado:', (tests.length - failed) + '/' + tests.length, 'pruebas correctas');
if (failed) process.exitCode = 1;
