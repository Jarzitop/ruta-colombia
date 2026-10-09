import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateDataset } from './dataset-validator.mjs';
import { validateScheduledCatalog } from '../src/gtfs/scheduled.ts';
import { normalizePrivateBogota } from './lib/normalize-private-bogota.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const provided = process.argv[2];
if (!provided) {
  console.error('Uso: npm run install:bogota:private -- <directorio EXTRAÍDO data/bogota/pilot-001>');
  process.exit(2);
}
const dir = resolve(provided);
if (dir.startsWith(root + '/') || dir.startsWith(root + '\\')) {
  console.error('Por seguridad, extrae el ZIP original FUERA del repositorio público.');
  process.exit(1);
}
const required = [
  'dataset.json', 'temporal.json', 'expected-temporal-cases.json',
  'sources.md', 'coverage.md', 'license-review.md',
];
for (const name of required) {
  if (!existsSync(join(dir, name))) {
    console.error('Entrega privada incompleta: falta ' + name);
    process.exit(1);
  }
}

try {
  const dataset = JSON.parse(readFileSync(join(dir, 'dataset.json'), 'utf8'));
  const temporal = JSON.parse(readFileSync(join(dir, 'temporal.json'), 'utf8'));
  const normalized = normalizePrivateBogota(dataset, temporal);
  const errors = [
    ...normalized.errors,
    ...(normalized.dataset ? validateDataset(normalized.dataset) : []),
    ...(normalized.temporal ? validateScheduledCatalog(normalized.temporal) : []),
  ];
  if (errors.length) throw new Error('Errores de integración: ' + errors.slice(0, 12).join(' | '));
  // The 16 source-grounded expectations are run before writing any app assets.
  const regressions = spawnSync(process.execPath, [
    '--experimental-strip-types',
    join(root, 'scripts/verify-private-temporal.mjs'),
    join(dir, 'temporal.json'), join(dir, 'expected-temporal-cases.json'),
  ], { encoding: 'utf8' });
  if (regressions.status !== 0) {
    throw new Error('Regresiones temporales fallidas: ' + regressions.stderr);
  }
  process.stdout.write(regressions.stdout);

  const activePath = join(root, 'src/data/active.ts');
  const current = readFileSync(activePath, 'utf8');
  if (!current.includes('syntheticFixture') && !current.includes('bogotaPrivateDataset')) {
    throw new Error('src/data/active.ts no coincide con una entrada conocida; evita sobrescribir cambios ajenos.');
  }
  const privateDir = join(root, 'src/data/private');
  mkdirSync(privateDir, { recursive: true });

  // The only real-data assets put in the checkout are the normalized two
  // JSON bundles. No evidence, ZIP or original GTFS are copied.
  writeFileSync(join(privateDir, 'bogota.dataset.json'), JSON.stringify(normalized.dataset) + '\n');
  writeFileSync(join(privateDir, 'bogota.temporal.json'), JSON.stringify(normalized.temporal) + '\n');
  const privateActive = [
    "import bogotaPrivateDataset from './private/bogota.dataset.json';",
    "import bogotaPrivateSchedule from './private/bogota.temporal.json';",
    "import type { TransitDataset } from './contract';",
    "import type { ScheduledCatalog } from '../gtfs/scheduled';",
    '',
    '// SOLO ENSAYO INTERNO, publishable: false, sin autorización de distribución pública.',
    'export const activeDataset = bogotaPrivateDataset as unknown as TransitDataset;',
    'export const activeScheduledCatalog: ScheduledCatalog | null =',
    '  activeDataset.datasetVersion === bogotaPrivateSchedule.catalogDatasetVersion &&',
    '  !activeDataset.publishable',
    '    ? bogotaPrivateSchedule as unknown as ScheduledCatalog : null;',
    '',
  ].join('\n');
  writeFileSync(activePath, privateActive);

  // EAS Build skips gitignored files unless .easignore explicitly allows them.
  // Only the two normalized private JSON files are uploaded; the source ZIP
  // and its evidence folder remain outside the source tree.
  const gitignore = readFileSync(join(root, '.gitignore'), 'utf8');
  const easignore = gitignore + [
    '',
    '# Subida PRIVADA a EAS para una compilación autorizada del equipo.',
    '!/src/data/private/',
    '!/src/data/private/bogota.dataset.json',
    '!/src/data/private/bogota.temporal.json',
    '',
  ].join('\n');
  writeFileSync(join(root, '.easignore'), easignore);

  console.log('OK: catálogo Bogotá y 2 variantes instalados LOCALMENTE.');
  console.log('Version:', normalized.dataset.datasetVersion);
  console.log('Viajes:', normalized.temporal.trips.length);
  console.log('NO hagas git add/commit/push; estos archivos son solo de un checkout privado.');
  console.log('Antes de EAS: restringe acceso anónimo a builds internos de Expo.');
} catch (error) {
  console.error('NO INSTALADO:', error.message);
  process.exit(1);
}
