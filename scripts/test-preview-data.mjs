import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validatePreviewInputs } from './check-preview-data.mjs';
import { syntheticSchedule } from '../src/data/synthetic/dev.temporal.ts';

const data = JSON.parse(readFileSync(new URL('../src/data/synthetic/dev.dataset.json', import.meta.url)));
const active = readFileSync(new URL('../src/data/active.ts', import.meta.url), 'utf8');
const clone = (value) => structuredClone(value);
const tests = [
  ['catálogo ficticio aprobado para APK de integración', () => {
    assert.deepEqual(validatePreviewInputs(data, syntheticSchedule, active), []);
  }],
  ['bloquea un catálogo marcado publicable sin cambiar otros campos', () => {
    const changed = clone(data);
    changed.publishable = true;
    assert.ok(validatePreviewInputs(changed, syntheticSchedule, active).length);
  }],
  ['bloquea mezcla de fuentes reales y ficticias', () => {
    const changed = clone(data);
    changed.sourceRefs.push({...changed.sourceRefs[0], kind: 'official', id: 'real'});
    assert.ok(validatePreviewInputs(changed, syntheticSchedule, active).length);
  }],
  ['bloquea activar otro dataset en el bundle', () => {
    const changed = active.replace('activeDataset = syntheticFixture', 'activeDataset = realFixture');
    assert.ok(validatePreviewInputs(data, syntheticSchedule, changed).length);
  }],
  ['bloquea un calendario no ficticio o de otra versión', () => {
    const changed = clone(syntheticSchedule);
    changed.catalogDatasetVersion = 'some-real-city';
    assert.ok(validatePreviewInputs(data, changed, active).length);
  }],
  ['bloquea paradas nuevas no presentes en el dataset ficticio', () => {
    const changed = clone(syntheticSchedule);
    changed.patterns[0].stops[0].stopId = 'invented-private-stop';
    assert.ok(validatePreviewInputs(data, changed, active).length);
  }],
];
let failed = 0;
for (const [name, test] of tests) {
  try { test(); console.log('PASS:', name); }
  catch (e) { failed++; console.error('FAIL:', name, e); }
}
console.log('Resultado:', tests.length-failed + '/' + tests.length, 'pruebas de preview');
if (failed) process.exitCode = 1;
