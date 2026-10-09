import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { normalizePrivateBogota } from './lib/normalize-private-bogota.mjs';
import { validateDataset } from './dataset-validator.mjs';
import { validateScheduledCatalog, findScheduledDirectTrips } from '../src/gtfs/scheduled.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const privateDir = join(root, 'src/data/private');
const paths = ['bogota.dataset.json', 'bogota.temporal.json'];
try {
  const [data, temporal] = paths.map((name) => {
    if (!existsSync(join(privateDir, name))) throw new Error('Falta ' + name);
    return JSON.parse(readFileSync(join(privateDir, name), 'utf8'));
  });
  const active = readFileSync(join(root, 'src/data/active.ts'), 'utf8');
  if (!active.includes("import bogotaPrivateDataset from './private/bogota.dataset.json';") ||
      !active.includes("import bogotaPrivateSchedule from './private/bogota.temporal.json';")) {
    throw new Error('El catálogo activo no es el overlay interno previsto');
  }
  if (data.publishable !== false || temporal.publishable !== false ||
      data.sourceRefs.some((s) => s.kind === 'synthetic') ||
      data.datasetVersion !== temporal.catalogDatasetVersion) {
    throw new Error('Procedencia, versión o publishable inválidos');
  }
  const errors = [...validateDataset(data), ...validateScheduledCatalog(temporal)];
  if (errors.length) throw new Error(errors.slice(0, 10).join(' | '));
  const clean = normalizePrivateBogota(data, temporal);
  if (clean.errors.length) throw new Error(clean.errors.join(' | '));
  if (!existsSync(join(root, '.easignore'))) {
    throw new Error('Falta .easignore privado con inclusión explícita de assets para EAS');
  }
  const manifest = readFileSync(join(root, '.easignore'), 'utf8');
  for (const path of ['!/src/data/private/bogota.dataset.json',
                      '!/src/data/private/bogota.temporal.json']) {
    if (!manifest.includes(path)) throw new Error('EAS no incluiría ' + path);
  }
  const git = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' });
  if (git.status !== 0) throw new Error('No se pudo comprobar el índice Git');
  if (git.stdout.split('\0').some((name) =>
    name.startsWith('src/data/private/') || name === '.easignore')) {
    throw new Error('Archivos privados registrados en el índice Git');
  }
  // Prove the real query returns only a documented long-pattern trip for
  // the last stop. Avoid hardcoding stop IDs or times in this public code.
  const long = temporal.patterns.find((p) => p.stops.length === 14);
  const short = temporal.patterns.find((p) => p.stops.length === 13);
  if (!long || !short || long.stops.length !== short.stops.length + 1) {
    throw new Error('La entrega no contiene ambas variantes esperadas');
  }
  const origin = long.stops[0].stopId;
  const longTerminal = long.stops.at(-1).stopId;
  const shortTerminal = short.stops.at(-1).stopId;
  if (longTerminal === shortTerminal) throw new Error('Los terminales de variante deben diferir');
  const toLong = findScheduledDirectTrips(temporal, {
    serviceDate: '20261012', originStopId: origin, destinationStopId: longTerminal,
  });
  const toShared = findScheduledDirectTrips(temporal, {
    serviceDate: '20261012', originStopId: origin, destinationStopId: shortTerminal,
  });
  if (toLong.status !== 'ok' || toShared.status !== 'ok' ||
      toLong.candidates.some((c) => c.patternId === short.id) ||
      !toShared.candidates.some((c) => c.patternId === short.id)) {
    throw new Error('El motor no respeta el terminal de las dos variantes');
  }
  if (toLong.candidates.some((c) => !c.boardingTimeApproximate)) {
    throw new Error('El feed no respalda salidas de precisión garantizada');
  }
  console.log('OK: Bogotá privado,',temporal.trips.length,'viajes, 2 patrones y terminales respetados.');
  console.log('NO enviar APK a terceros. Requiere EAS con acceso interno autenticado o compilación controlada.');
} catch (error) {
  console.error('PREBUILD PRIVADO BLOQUEADO:', error.message);
  process.exit(1);
}
