import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syntheticSchedule } from '../src/data/synthetic/dev.temporal.ts';
import { validateScheduledCatalog } from '../src/gtfs/scheduled.ts';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

/**
 * Intentional guard for the synthetic Android integration build only.
 * This is not a license audit or protection against deliberate source edits.
 */
export function validatePreviewInputs(dataset, schedule, activeSource) {
  const problems = [];
  if (dataset?.publishable !== false ||
      !Array.isArray(dataset.sourceRefs) || dataset.sourceRefs.length === 0 ||
      dataset.sourceRefs.some((source) => source.kind !== 'synthetic')) {
    problems.push('El dataset de preview debe ser íntegramente ficticio y publishable=false.');
  }

  if (schedule?.catalogDatasetVersion !== dataset?.datasetVersion ||
      typeof schedule?.scope !== 'string' || !schedule.scope.startsWith('synthetic-')) {
    problems.push('El calendario preview debe corresponder al mismo dataset ficticio.');
  }
  if (!activeSource.includes("import syntheticFixture from './synthetic/dev.dataset.json';") ||
      !/export const activeDataset\s*=\s*syntheticFixture/.test(activeSource)) {
    problems.push('El catálogo activo no apunta al fixture ficticio aprobado para esta APK.');
  }

  const routes = new Set((dataset?.routes ?? []).map((route) => route.id));
  const stops = new Set((dataset?.stops ?? []).map((stop) => stop.id));
  const sources = new Set((dataset?.sourceRefs ?? []).map((source) => source.id));
  for (const pattern of schedule?.patterns ?? []) {
    if (!routes.has(pattern.routeId) ||
        pattern.stops.some((stop) => !stops.has(stop.stopId))) {
      problems.push('El calendario ficticio contiene rutas/paradas ajenas al dataset.');
      break;
    }
  }
  for (const trip of schedule?.trips ?? []) {
    if (trip.sourceRefIds?.some((id) => !sources.has(id))) {
      problems.push('El viaje del calendario referencia fuentes ajenas al dataset.');
      break;
    }
  }

  if (schedule && validateScheduledCatalog(schedule).length !== 0) {
    problems.push('El calendario ficticio no supera la validación temporal.');
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const data = JSON.parse(readFileSync(
    join(projectRoot, 'src/data/synthetic/dev.dataset.json'), 'utf8',
  ));
  const active = readFileSync(join(projectRoot, 'src/data/active.ts'), 'utf8');
  const problems = validatePreviewInputs(data, syntheticSchedule, active);
  for (const path of ['data/bogota/pilot-001', 'audit-work']) {
    if (existsSync(join(projectRoot, path))) {
      problems.push('Hay una carpeta de auditoría privada dentro del proyecto: ' + path);
    }
  }
  if (problems.length) {
    console.error('PREVIEW BLOQUEADO:');
    problems.forEach((problem) => console.error('- ' + problem));
    process.exit(1);
  }
  console.log('OK: APK interna preparada solo con dataset y horarios sintéticos.');
  console.log('Este control no sustituye la revisión de licencias ni las pruebas Android.');
}
