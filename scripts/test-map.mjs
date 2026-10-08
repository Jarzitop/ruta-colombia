import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { boundsForStops } from '../src/map/viewport.ts';

const dataset = JSON.parse(readFileSync(new URL('../src/data/synthetic/dev.dataset.json', import.meta.url), 'utf8'));
const cases = [
  ['encuadra origen y destino documentados', () => {
    const bounds = boundsForStops(dataset, ['dev-stop-a', 'dev-stop-c']);
    assert.ok(bounds);
    assert.ok(bounds[0] < -74.085 && bounds[2] > -74.078);
    assert.ok(bounds[1] < 4.646 && bounds[3] > 4.652);
  }],
  ['margen mínimo si solo hay una parada', () => {
    const b = boundsForStops(dataset, ['dev-stop-b']);
    assert.ok(b && b[2] > b[0] && b[3] > b[1]);
  }],
  ['no inventa coordenadas para paradas ausentes', () => {
    assert.equal(boundsForStops(dataset, ['stop-que-no-existe']), null);
  }],
  ['ignora IDs adicionales que no están documentados', () => {
    assert.deepEqual(boundsForStops(dataset, ['dev-stop-a', 'fantasma']),
      boundsForStops(dataset, ['dev-stop-a']));
  }],
  ['excluye coordenadas no válidas', () => {
    const invalid = structuredClone(dataset);
    invalid.stops[0].longitude = 400;
    assert.equal(boundsForStops(invalid, ['dev-stop-a']), null);
  }],
];
let failed = 0;
for (const [name, test] of cases) {
  try { test(); console.log('PASS:', name); }
  catch (error) { failed++; console.error('FAIL:', name, error); }
}
console.log('Resultado:', cases.length - failed, '/', cases.length, 'pruebas correctas');
if (failed) process.exitCode = 1;
