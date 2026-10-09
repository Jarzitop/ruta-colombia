// Consent gate for transferring the private GTFS-derived bundle to Expo EAS.
// A cloud build is NOT purely local; EAS receives the embedded source files.
// Project settings must require authenticated access to internal build links.
if (process.env.RUTA_PRIVATE_EAS_UPLOAD_APPROVED !== 'YES') {
  console.error('CLOUD BUILD NO AUTORIZADO. Antes de subir datos reales a EAS:');
  console.error('1. Desactiva "Unauthenticated access to internal builds" en el proyecto Expo.');
  console.error('2. Confirma que consientes subir a Expo los 2 JSON derivados del GTFS.');
  console.error('3. En PowerShell: $env:RUTA_PRIVATE_EAS_UPLOAD_APPROVED = "YES"');
  console.error('4. Ejecuta de nuevo npm run build:apk:bogota.');
  process.exit(1);
}
console.log('Autorización local explícita presente para envío PRIVADO a Expo EAS.');
