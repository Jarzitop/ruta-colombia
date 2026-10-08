import assert from 'node:assert/strict';
import { blockedTrackedPaths } from './assert-no-private-data.mjs';

const tests = [
  ['bloquea el dataset real si alguien fuerza git add', () =>
    assert.deepEqual(
      blockedTrackedPaths(['data/bogota/pilot-001/dataset.json']),
      ['data/bogota/pilot-001/dataset.json'],
    )],
  ['bloquea el ZIP original en cualquier carpeta', () =>
    assert.deepEqual(
      blockedTrackedPaths(['tmp/GTFS_20260929.zip']),
      ['tmp/GTFS_20260929.zip'],
    )],
  ['bloquea auditoría y otros ZIP del piloto', () =>
    assert.equal(
      blockedTrackedPaths(['audit-work/export.py', 'Bogota_pilot_001.zip']).length,
      2,
    )],
  ['reconoce rutas Windows', () =>
    assert.deepEqual(
      blockedTrackedPaths(['data\\bogota\\pilot-001\\temporal.json']),
      ['data\\bogota\\pilot-001\\temporal.json'],
    )],
  ['permite código, documentación y fixture ficticio', () =>
    assert.deepEqual(blockedTrackedPaths([
      'src/gtfs/scheduled.ts',
      'src/data/synthetic/dev.dataset.json',
      'docs/bogota-private-audit-review.md',
      'scripts/test-scheduled.mjs',
    ]),[])],
];

for (const [name, test] of tests) {
  test();
  console.log('PASS:', name);
}
console.log('Resultado:', tests.length, '/', tests.length, 'pruebas de seguridad');
