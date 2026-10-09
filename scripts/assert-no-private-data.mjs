import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Guard for the public repository while the GTFS reuse license is unresolved.
 * Checks tracked paths only; does not read private source files.
 */
export function blockedTrackedPaths(paths) {
  return paths.filter((path) => {
    const normalized = path.replaceAll('\\', '/');
    return normalized.startsWith('data/bogota/pilot-001/') ||
      normalized.startsWith('src/data/private/') ||
      normalized === '.easignore' ||
      normalized.startsWith('audit-work/') ||
      /(^|\/)(GTFS_\d{8}|Bogota_pilot_[^/]*)\.zip$/i.test(normalized);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = spawnSync('git', ['ls-files', '-z'], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) {
    console.error('No se pudo revisar el índice de Git:', result.stderr);
    process.exit(2);
  }
  const paths = result.stdout.split('\0').filter(Boolean);
  const blocked = blockedTrackedPaths(paths);
  if (blocked.length) {
    console.error('BLOQUEADO: archivos privados de Bogotá están versionados en Git:');
    blocked.forEach((path) => console.error('- ' + path));
    console.error('Revisar el commit antes de cualquier publicación o compilación.');
    process.exit(1);
  }
  console.log('OK: no hay archivos privados del piloto entre los archivos versionados.');
}
