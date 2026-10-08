import assert from 'node:assert/strict';
import { describeCatalog } from '../src/data/notice.ts';

const cases = [
  ['fuentes sintéticas nunca aparecen como transporte real', () => {
    const result = describeCatalog({
      publishable: false, datasetVersion: 'dev-test',
      sourceRefs: [{ kind: 'synthetic' }],
    });
    assert.equal(result.status, 'synthetic');
    assert.match(result.title, /FICTICIOS/);
  }],
  ['una muestra documental sin licencia confirmada queda en revisión', () => {
    const result = describeCatalog({
      publishable: false, datasetVersion: 'metadata-test-only',
      sourceRefs: [{ kind: 'official' }],
    });
    assert.equal(result.status, 'review');
    assert.match(result.title, /NO APTOS PARA VIAJAR/);
    assert.doesNotMatch(result.mapTitle, /ficticias/);
  }],
  ['un catálogo publicable anuncia solo cobertura limitada', () => {
    const result = describeCatalog({
      publishable: true, datasetVersion: 'metadata-test-only',
      sourceRefs: [{ kind: 'official' }],
    });
    assert.equal(result.status, 'limited');
    assert.match(result.description, /no se consideran inexistentes/);
  }],
  ['mezclar fuentes ficticias prevalece sobre publishable', () => {
    const result = describeCatalog({
      publishable: true, datasetVersion: 'metadata-test-only',
      sourceRefs: [{ kind: 'official' }, { kind: 'synthetic' }],
    });
    assert.equal(result.status, 'synthetic');
  }],
];
let failed = 0;
for (const [name, test] of cases) {
  try { test(); console.log('PASS:', name); }
  catch (error) { failed++; console.error('FAIL:', name, error); }
}
console.log(`Resultado: ${cases.length - failed}/${cases.length} pruebas`);
if (failed) process.exitCode = 1;
