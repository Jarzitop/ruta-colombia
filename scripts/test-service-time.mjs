import assert from 'node:assert/strict';
import { toGtfsDepartureTime } from '../src/planner/service-time.ts';
import { syntheticSchedule } from '../src/data/synthetic/dev.temporal.ts';
import { findScheduledDirectTrips } from '../src/gtfs/scheduled.ts';

const query = (text, originStopId='dev-stop-a', destinationStopId='dev-stop-b') => {
  const departure = toGtfsDepartureTime(text);
  if (departure === null) throw new Error('test input invalid');
  return findScheduledDirectTrips(syntheticSchedule, {
    serviceDate:'20261012', originStopId, destinationStopId,
    ...(departure ? { departureAtOrAfter:departure } : {}),
  });
};
const tests = [
  ['sin hora incluye todas las alternativas de la muestra', () => {
    const r=query('');
    assert.equal(r.status, 'ok');
    assert.deepEqual(r.candidates.map(c=>c.tripId), ['dev-holiday-long','dev-holiday-short']);
  }],
  ['10:02 excluye la salida ficticia a las 10:00', () => {
    const r=query('10:02');
    assert.equal(r.status, 'ok');
    assert.deepEqual(r.candidates.map(c=>c.tripId), ['dev-holiday-short']);
  }],
  ['umbral inclusivo: 10:03 incluye esa salida', () => {
    const r=query('10:03');
    assert.equal(r.status, 'ok');
    assert.equal(r.candidates[0].scheduledBoardDeparture,'10:03:00');
  }],
  ['para abordar en B se usa su hora 10:05 y no la cabecera', () => {
    assert.equal(query('10:05','dev-stop-b','dev-stop-c').status, 'ok');
    assert.equal(query('10:06','dev-stop-b','dev-stop-c').status, 'no-scheduled-trip-in-sample');
  }],
  ['salida muy posterior no implica inexistencia del servicio en ciudad', () => {
    const r=query('23:59');
    assert.equal(r.status,'no-scheduled-trip-in-sample');
    assert.equal(r.scope,'provided-catalog');
  }],
  ['permite horario GTFS después de medianoche sin fecha implícita', () => {
    assert.equal(toGtfsDepartureTime('26:05'),'26:05:00');
  }],
  ['normaliza HH:MM sin convertir zona horaria', () => {
    assert.equal(toGtfsDepartureTime('9:05'),'09:05:00');
    assert.equal(toGtfsDepartureTime(' 10:02 '),'10:02:00');
  }],
  ['hora opcional vacía significa sin filtro', () => {
    assert.equal(toGtfsDepartureTime('   '),'');
  }],
  ['rechaza minutos fuera de rango y texto no GTFS', () => {
    for (const raw of ['10:60','10:2','ahora','10.30','10:20:00','-1:00']) {
      assert.equal(toGtfsDepartureTime(raw),null,raw);
    }
  }],
];
let failures=0;
for(const [name,fn] of tests) {
  try { fn(); console.log('PASS:',name); }
  catch(e){failures++;console.error('FAIL:',name,e);}
}
console.log('Resultado:',tests.length-failures+'/'+tests.length,'tests de umbral de salida');
if(failures)process.exitCode=1;
