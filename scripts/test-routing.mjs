import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findDirectItineraries } from '../src/routing/direct.ts';

const fixture = JSON.parse(readFileSync(new URL('../src/data/synthetic/dev.dataset.json', import.meta.url), 'utf8'));
const clone = () => structuredClone(fixture);
const query = (originStopId, destinationStopId, cityId = 'dev-city') => ({
  cityId, originStopId, destinationStopId,
});
const search = (a, b, data = fixture, cityId = 'dev-city') => findDirectItineraries(data, query(a, b, cityId));
const tests = [
  ['directo A → C respeta orden y sentido', () => {
    const result = search('dev-stop-a', 'dev-stop-c');
    assert.equal(result.status, 'ok');
    assert.deepEqual(result.itineraries[0].stopIds, ['dev-stop-a', 'dev-stop-b', 'dev-stop-c']);
    assert.equal(result.itineraries[0].transfers, 0);
    assert.equal(result.itineraries[0].transferWalkingMeters, 0);
    assert.equal(result.itineraries[0].directionId, 'dev-outbound');
  }],
  ['directo entre paradas intermedias', () => {
    const result = search('dev-stop-b', 'dev-stop-c');
    assert.equal(result.status, 'ok');
    assert.deepEqual(result.itineraries[0].stopIds, ['dev-stop-b', 'dev-stop-c']);
  }],
  ['no invierte el sentido automáticamente', () => {
    assert.equal(search('dev-stop-c', 'dev-stop-a').status, 'no-direct-service');
  }],
  ['acepta regreso solo con patrón explícito', () => {
    const data = clone();
    data.patterns.push({ ...structuredClone(data.patterns[0]), id: 'dev-return', directionId: 'return', stops: [...data.patterns[0].stops].reverse().map((stop, i) => ({ ...stop, sequence: i + 1 })) });
    const result = search('dev-stop-c', 'dev-stop-a', data);
    assert.equal(result.status, 'ok');
    assert.equal(result.itineraries[0].patternId, 'dev-return');
  }],
  ['abordaje prohibido bloquea el viaje', () => {
    const data = clone(); data.patterns[0].stops[0].boardingAllowed = false;
    assert.equal(search('dev-stop-a', 'dev-stop-c', data).status, 'no-direct-service');
  }],
  ['descenso prohibido bloquea el viaje', () => {
    const data = clone(); data.patterns[0].stops[2].alightingAllowed = false;
    assert.equal(search('dev-stop-a', 'dev-stop-c', data).status, 'no-direct-service');
  }],
  ['ciudad fuera del catálogo', () => {
    assert.deepEqual(search('dev-stop-a', 'dev-stop-c', fixture, 'bogota-no-cubierta'), { status: 'not-covered', reason: 'city', itineraries: [] });
  }],
  ['origen fuera del catálogo', () => {
    assert.deepEqual(search('desconocida', 'dev-stop-c'), { status: 'not-covered', reason: 'origin', itineraries: [] });
  }],
  ['destino fuera del catálogo', () => {
    assert.deepEqual(search('dev-stop-a', 'desconocida'), { status: 'not-covered', reason: 'destination', itineraries: [] });
  }],
  ['no mezcla ciudades', () => {
    const data = clone();
    data.cities.push({ id: 'other-city', name: 'Otra ciudad sintética', countryCode: 'CO', sourceRefIds: ['src-dev-synthetic'] });
    data.stops.push({ id: 'other-stop', cityId: 'other-city', name: 'Otro', latitude: 4.0, longitude: -74.0, sourceRefIds: ['src-dev-synthetic'] });
    assert.deepEqual(search('dev-stop-a', 'other-stop', data), { status: 'not-covered', reason: 'cross-city', itineraries: [] });
  }],
  ['origen y destino iguales no generan viaje', () => {
    assert.equal(search('dev-stop-b', 'dev-stop-b').status, 'same-stop');
  }],
  ['transbordo sin servicio directo no se inventa', () => {
    const data = clone();
    data.patterns[0].stops = data.patterns[0].stops.slice(0, 2);
    data.patterns.push({ ...structuredClone(data.patterns[0]), id: 'second-leg', stops: [
      { stopId: 'dev-stop-b', sequence: 1, boardingAllowed: true, alightingAllowed: true },
      { stopId: 'dev-stop-c', sequence: 2, boardingAllowed: true, alightingAllowed: true },
    ] });
    assert.equal(search('dev-stop-a', 'dev-stop-c', data).status, 'no-direct-service');
  }],
  ['patrón inválido: secuencia desordenada bloquea', () => {
    const data = clone(); data.patterns[0].stops[1].sequence = 1;
    assert.equal(search('dev-stop-a', 'dev-stop-c', data).status, 'invalid-data');
  }],
  ['patrón inválido: parada desconocida bloquea', () => {
    const data = clone(); data.patterns[0].stops[1].stopId = 'fantasma';
    assert.equal(search('dev-stop-a', 'dev-stop-c', data).status, 'invalid-data');
  }],
  ['patrón inválido: permiso de abordaje desconocido bloquea', () => {
    const data = clone(); delete data.patterns[0].stops[0].boardingAllowed;
    assert.equal(search('dev-stop-a', 'dev-stop-c', data).status, 'invalid-data');
  }],
  ['orden determinista entre alternativas sin afirmar tiempos', () => {
    const data = clone();
    data.routes.push({ ...structuredClone(data.routes[0]), id: 'aaa-route' });
    data.patterns.push({ ...structuredClone(data.patterns[0]), id: 'aaa-pattern', routeId: 'aaa-route' });
    const result = search('dev-stop-a', 'dev-stop-c', data);
    assert.equal(result.status, 'ok');
    assert.deepEqual(result.itineraries.map((i) => i.routeId), ['aaa-route', 'dev-route-1']);
  }],
  ['secuencias crecientes no contiguas permitidas', () => {
    const data = clone(); data.patterns[0].stops.forEach((s, i) => { s.sequence = (i + 1) * 10; });
    const result = search('dev-stop-a', 'dev-stop-c', data);
    assert.equal(result.status, 'ok');
    assert.deepEqual(result.itineraries[0].stopIds, ['dev-stop-a', 'dev-stop-b', 'dev-stop-c']);
  }],
];
let failures = 0;
for (const [name, run] of tests) {
  try { run(); console.log('PASS: ' + name); }
  catch (error) { failures++; console.error('FAIL: ' + name, error); }
}
if (failures) process.exitCode = 1;
console.log('Resultado: ' + (tests.length - failures) + '/' + tests.length + ' pruebas correctas');
