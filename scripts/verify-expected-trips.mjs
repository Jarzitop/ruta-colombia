import { readFile } from 'node:fs/promises';
import { validateDataset } from './dataset-validator.mjs';
import { verifyExpectedTrips } from './lib/expected-trips.mjs';

const [datasetPath, examplesPath] = process.argv.slice(2);
if (!datasetPath || !examplesPath) {
  console.error('Uso: node --experimental-strip-types scripts/verify-expected-trips.mjs <dataset.json> <expected-trips.json>');
  process.exit(2);
}

try {
  const [dataset, examples] = await Promise.all([datasetPath, examplesPath].map(async (path) =>
    JSON.parse(await readFile(path, 'utf8')),
  ));
  const dataErrors = validateDataset(dataset);
  if (dataErrors.length) {
    console.error('Catálogo inválido:');
    dataErrors.forEach((message) => console.error('- ' + message));
    process.exit(1);
  }

  const { errors, checked } = verifyExpectedTrips(dataset, examples);
  errors.forEach((message) => console.error('- ' + message));
  if (errors.length) {
    console.error(`FAIL: ${errors.length} error(es), ${checked} casos presentados`);
    process.exit(1);
  }
  console.log(`OK: ${checked} viajes contrastados con ${dataset.datasetVersion} (solo cobertura del catálogo)`);
} catch (error) {
  console.error('No se pudieron verificar los archivos:', error.message);
  process.exit(1);
}
