/**
 * Fail-closed human attestations for a private EAS build.
 * Expo account billing and project sharing settings cannot be proved from
 * source code. Do not confuse env flags with independent verification.
 */
export function missingPrivateEasApprovals(env) {
  return [
    ['RUTA_EXPO_FREE_PLAN_CONFIRMED', 'Plan actual Expo: Free (US$0), sin suscripción de pago.'],
    ['RUTA_EXPO_QUOTA_CONFIRMED', 'Queda al menos una compilación Android Free disponible.'],
    ['RUTA_EXPO_PRIVATE_BUILDS_CONFIRMED', 'Acceso sin autenticación a builds internos: DESACTIVADO.'],
    ['RUTA_PRIVATE_EAS_UPLOAD_APPROVED', 'Autoriza transferir únicamente dos JSON derivados a EAS.'],
  ].filter(([key]) => env[key] !== 'YES').map(([key, description]) =>
    ({ key, description }));
}

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const missing = missingPrivateEasApprovals(process.env);
  if (missing.length) {
    console.error('EAS BLOQUEADO: faltan comprobaciones obligatorias para costo 0 y privacidad.');
    missing.forEach(({key,description}) =>
      console.error('- ' + key + ': ' + description));
    console.error('Revisa manualmente Billing → Current Plan / Usage y el acceso interno');
    console.error('en expo.dev antes de establecer estas variables locales.');
    console.error('Guía: docs/internal-bogota-apk.md. No compres ni actualices el plan.');
    process.exit(1);
  }
  console.log('Declaraciones locales presentes. No sustituyen verificar Expo Billing/Settings.');
}
