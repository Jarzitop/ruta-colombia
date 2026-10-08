import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const script = fileURLToPath(new URL('./verify-bogota-pilot.mjs', import.meta.url));
const execute = (root) => spawnSync(process.execPath, ['--experimental-strip-types', script, root], {
  encoding: 'utf8',
});
const tests = [
  ['sin lote Bogotá no declara cobertura real', () => {
    const root = mkdtempSync(join(tmpdir(), 'ruta-no-pilot-'));
    try {
      const r = execute(root);
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stdout, /PENDIENTE/);
      assert.doesNotMatch(r.stdout, /OK: dataset/);
    } finally { rmSync(root, { recursive: true, force: true }); }
  }],
  ['si solo llega un archivo del lote falla', () => {
    const root = mkdtempSync(join(tmpdir(), 'ruta-partial-'));
    try {
      writeFileSync(join(root, 'dataset.json'), '{}');
      const r = execute(root);
      assert.equal(r.status, 1);
      assert.match(r.stderr, /incompleto/);
    } finally { rmSync(root, { recursive: true, force: true }); }
  }],
  ['un fixture sintético no puede hacerse pasar por muestra auditada', () => {
    const root = mkdtempSync(join(tmpdir(), 'ruta-synthetic-rejected-'));
    try {
      const fixture = JSON.parse(readFileSync(new URL('../src/data/synthetic/dev.dataset.json', import.meta.url)));
      const cases = JSON.parse(readFileSync(new URL('../src/data/synthetic/expected-trips.json', import.meta.url)));
      writeFileSync(join(root, 'dataset.json'), JSON.stringify(fixture));
      writeFileSync(join(root, 'expected-trips.json'), JSON.stringify(cases));
      writeFileSync(join(root, 'sources.md'), 'FUENTE DE PRUEBA FICTICIA. '.repeat(6));
      writeFileSync(join(root, 'coverage.md'), 'COBERTURA DE PRUEBA FICTICIA. '.repeat(6));
      const r = execute(root);
      assert.equal(r.status, 1);
      assert.match(r.stderr, /fuentes synthetic/);
    } finally { rmSync(root, { recursive: true, force: true }); }
  }],
];

let fail = 0;
for (const [name, run] of tests) {
  try { run(); console.log('PASS:', name); }
  catch (error) { fail++; console.error('FAIL:', name, error); }
}
console.log(`Resultado: ${tests.length - fail}/${tests.length} verificaciones de entrega Bogotá`);
if (fail) process.exitCode = 1;
