import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateDataset } from './dataset-validator.mjs';
import { verifyExpectedTrips } from './lib/expected-trips.mjs';

const root = process.argv[2] ?? 'data/bogota/pilot-001';
const required = ['dataset.json', 'sources.md', 'coverage.md', 'expected-trips.json'];
const found = required.filter((file) => existsSync(join(root, file)));

if (found.length === 0) {
  console.log('PENDIENTE: no se recibió el lote auditado de Bogotá; no se activan rutas reales.');
  process.exit(0);
}
if (found.length !== required.length) {
  const missing = required.filter((file) => !found.includes(file));
  console.error('Lote Bogotá incompleto; archivos faltantes:', missing.join(', '));
  process.exit(1);
}

try {
  const read = (name) => readFileSync(join(root, name), 'utf8');
  for (const name of ['sources.md', 'coverage.md']) {
    if (read(name).trim().length < 80) {
      throw new Error(`${name}: documentar fuentes, cobertura y límites (archivo vacío o incompleto)`);
    }
  }
  const dataset = JSON.parse(read('dataset.json'));
  const cases = JSON.parse(read('expected-trips.json'));

  const errors = validateDataset(dataset);
  if (dataset.sourceRefs?.some((source) => source.kind === 'synthetic')) {
    errors.push('La carpeta Bogotá auditada no puede contener fuentes synthetic.');
  }
  if (dataset.cities?.some((city) => city.name?.toLowerCase().includes('sandbox'))) {
    errors.push('El lote de Bogotá no puede contener la ciudad sintética de pruebas.');
  }
  for (const source of dataset.sourceRefs ?? []) {
    if (typeof source.url !== 'string' || !/^https?:\/\//.test(source.url)) {
      errors.push(`source ${source.id}: debe tener una URL de procedencia para revisión`);
    }
    if (dataset.publishable && (!source.license || !String(source.license).trim())) {
      errors.push(`source ${source.id}: falta licencia documentada para datos publicables`);
    }
  }

  if (errors.length === 0) {
    errors.push(...verifyExpectedTrips(dataset, cases).errors);
  }
  if (errors.length) {
    console.error(`FAIL: ${errors.length} problema(s) en lote Bogotá:`);
    errors.forEach((error) => console.error('- ' + error));
    process.exit(1);
  }
  console.log(`OK: dataset ${dataset.datasetVersion} y ${cases.cases.length} ejemplos internos validados.`);
  console.log('ATENCIÓN: esta verificación no certifica permisos legales ni exactitud sobre el terreno.');
} catch (error) {
  console.error('FAIL: lote Bogotá no legible o incompleto:', error.message);
  process.exit(1);
}
