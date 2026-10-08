import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { verifyExpectedTrips } from './lib/expected-trips.mjs';

const read = (file) => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'));
const dataset = read('../src/data/synthetic/dev.dataset.json');
const cases = read('../src/data/synthetic/expected-trips.json');
const clone = () => structuredClone(cases);

const tests = [
  ['fixture sintético: 4 resultados documentados en catálogo', () => {
    const result = verifyExpectedTrips(dataset, cases);
    assert.deepEqual(result.errors, []);
    assert.equal(result.checked, 4);
  }],
  ['rechaza un datasetVersion distinto', () => {
    const c = clone(); c.datasetVersion = 'otra-version';
    assert.match(verifyExpectedTrips(dataset, c).errors.join(' '), /datasetVersion/);
  }],
  ['rechaza scope que podría sugerir cobertura de toda la ciudad', () => {
    const c = clone(); c.scope = 'all-bogota';
    assert.match(verifyExpectedTrips(dataset, c).errors.join(' '), /provided-catalog/);
  }],
  ['no acepta patrón inexistente como ruta documentada', () => {
    const c = clone(); c.cases[0].expected.patternId = 'no-existe';
    assert.match(verifyExpectedTrips(dataset, c).errors.join(' '), /patrón/);
  }],
  ['no acepta secuencia alterada respecto al patrón', () => {
    const c = clone(); c.cases[0].expected.stopIds = ['dev-stop-a','dev-stop-c'];
    assert.match(verifyExpectedTrips(dataset, c).errors.join(' '), /stopIds/);
  }],
  ['un caso negativo requiere explicar su alcance', () => {
    const c = clone(); delete c.cases[2].coverageNote;
    assert.match(verifyExpectedTrips(dataset, c).errors.join(' '), /coverageNote/);
  }],
  ['un negativo esperado equivocado debe fallar', () => {
    const c = clone(); c.cases[2].expected.status = 'same-stop';
    assert.ok(verifyExpectedTrips(dataset, c).errors.length > 0);
  }],
  ['rechaza paradas que no están en el catálogo', () => {
    const c = clone(); c.cases[0].originStopId = 'stop-inventada';
    assert.match(verifyExpectedTrips(dataset, c).errors.join(' '), /fuera de cobertura/);
  }],
  ['rechaza citas a fuentes que no existen', () => {
    const c = clone(); c.cases[0].sourceRefIds = ['fuente-fantasma'];
    assert.match(verifyExpectedTrips(dataset, c).errors.join(' '), /sourceRefIds/);
  }],
  ['rechaza casos duplicados', () => {
    const c = clone(); c.cases[1].id = c.cases[0].id;
    assert.match(verifyExpectedTrips(dataset, c).errors.join(' '), /duplicado/);
  }],
  ['requiere al menos un ejemplo trazable', () => {
    const c = clone(); c.cases = [];
    assert.match(verifyExpectedTrips(dataset, c).errors.join(' '), /cases/);
  }],
  ['permite ruta alternativa validada, sin exigir ser la primera', () => {
    const data = structuredClone(dataset);
    data.routes.unshift({...data.routes[0], id:'000-route-alt'});
    data.patterns.unshift({...data.patterns[0], id:'000-pattern-alt', routeId:'000-route-alt'});
    assert.deepEqual(verifyExpectedTrips(data, cases).errors, []);
  }],
];

let failures = 0;
for (const [name, run] of tests) {
  try { run(); console.log('PASS:', name); }
  catch (error) { failures++; console.error('FAIL:', name, error); }
}
console.log(`Resultado: ${tests.length - failures}/${tests.length} verificaciones`);
if (failures) process.exitCode = 1;
