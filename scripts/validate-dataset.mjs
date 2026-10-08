import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { validateDataset } from './dataset-validator.mjs';

const file = process.argv[2];
if (!file) {
  console.error('Uso: node scripts/validate-dataset.mjs <dataset.json>');
  process.exit(2);
}

const dataset = JSON.parse(await readFile(file, 'utf8'));
const errors = validateDataset(dataset);
if (errors.length > 0) {
  console.error(`Dataset inválido (${errors.length} error(es)):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`OK: ${file}`);
console.log(`  versión: ${dataset.datasetVersion}`);
console.log(`  ciudades: ${dataset.cities.length}`);
console.log(`  paradas: ${dataset.stops.length}`);
console.log(`  rutas: ${dataset.routes.length}`);
console.log(`  patrones/sentidos: ${dataset.patterns.length}`);
console.log(`  conexiones peatonales explícitas: ${dataset.walkingConnections.length}`);
console.log(`  publicable: ${dataset.publishable}`);
