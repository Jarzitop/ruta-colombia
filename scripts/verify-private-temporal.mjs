import { readFileSync } from 'node:fs';
import { resolveGtfsServiceDay } from '../src/gtfs/calendar.ts';
import { findScheduledDirectTrips, validateScheduledCatalog } from '../src/gtfs/scheduled.ts';

const [tracePath, expectedPath] = process.argv.slice(2);
if (!tracePath || !expectedPath) {
  console.error('Uso: node --experimental-strip-types scripts/verify-private-temporal.mjs <temporal.json> <expected-temporal-cases.json>');
  process.exit(2);
}
const fail = (message) => { throw new Error(message); };
try {
  const trace = JSON.parse(readFileSync(tracePath, 'utf8'));
  const expected = JSON.parse(readFileSync(expectedPath, 'utf8'));
  if (trace.publishable !== false) fail('esta comprobación es únicamente para datos privados en revisión');
  const errors = validateScheduledCatalog(trace);
  if (errors.length) fail('catálogo temporal estructuralmente inválido: ' + errors.slice(0, 4).join(' | '));
  if (expected?.auditSchemaVersion !== '1.0.0' ||
      expected?.scope !== 'provided-route-trips' ||
      !Array.isArray(expected.dayCases) || !Array.isArray(expected.tripCases)) {
    fail('formato de regresiones temporales inválido');
  }
  const stopEvents = trace.trips.reduce((sum,trip) => sum + trip.stopTimes.length,0);
  const patternById = new Map(trace.patterns.map(p=>[p.id,p]));
  const tripById = new Map(trace.trips.map(t=>[t.tripId,t]));
  const ids = [...new Set(trace.trips.map(t=>t.serviceId))].sort();

  for (const [i, test] of expected.dayCases.entries()) {
    const activeIds = ids.filter(id =>
      resolveGtfsServiceDay(id,test.date,trace.calendar,trace.calendarDates)==='active');
    if (JSON.stringify(activeIds) !== JSON.stringify([...test.activeServiceIds].sort())) {
      fail('dayCases['+i+']: calendario distinto');
    }
    const active = trace.trips.filter(t=>activeIds.includes(t.serviceId));
    const count14 = active.filter(t=>patternById.get(t.patternId)?.stops.length === 14).length;
    const count13 = active.filter(t=>patternById.get(t.patternId)?.stops.length === 13).length;
    if (count14 !== test.long14Trips || count13 !== test.short13Trips) {
      fail('dayCases['+i+']: conteo de variantes incorrecto');
    }
    if (active.length) {
      const firstPattern = patternById.get(active[0].patternId);
      if (!firstPattern) fail('patrón inexistente');
      const origin = firstPattern.stops[0]?.stopId;
      const terminal = firstPattern.stops.at(-1)?.stopId;
      if (origin && terminal) {
        const response=findScheduledDirectTrips(trace,{
          serviceDate:test.date,originStopId:origin,destinationStopId:terminal,
        });
        if(response.status!=='ok') fail('dayCases['+i+']: el motor no encontró el viaje programado');
      }
    }
  }
  for (const [i, test] of expected.tripCases.entries()) {
    const trip=tripById.get(test.tripId);
    if (!trip) fail('tripCases['+i+']: tripId inexistente');
    const activity=resolveGtfsServiceDay(
      trip.serviceId,test.date,trace.calendar,trace.calendarDates);
    const calls=trip.stopTimes.some(event=>event.gtfsStopId===test.destinationGtfsStopId);
    if(activity!==test.expectedActivity || calls!==test.expectedCallsAtDestination) {
      fail('tripCases['+i+']: servicio o destino incoherente');
    }
    const pattern=patternById.get(trip.patternId);
    if (!pattern) fail('tripCases['+i+']: patrón inexistente');
    const destinationEvent=trace.trips
      .flatMap(t=>t.stopTimes)
      .find(event=>event.gtfsStopId===test.destinationGtfsStopId);
    const origin=pattern.stops[0]?.stopId;
    if (!origin || !destinationEvent) fail('tripCases['+i+']: parada fuera de la muestra');
    const found=findScheduledDirectTrips(trace,{
      serviceDate:test.date,
      originStopId:origin,
      destinationStopId:destinationEvent.stopId,
    });
    const contains=found.status==='ok' && found.candidates.some(c=>c.tripId===trip.tripId);
    if (contains!==(activity==='active' && calls)) {
      fail('tripCases['+i+']: el motor recomendó un trip sin cobertura/servicio o lo omitió');
    }
  }
  console.log('OK: '+trace.trips.length+' viajes privados y '+stopEvents+' eventos; '+
    (expected.dayCases.length+expected.tripCases.length)+' regresiones temporales.');
  console.log('No certifica disponibilidad real, horario preciso ni licencia.');
} catch (error) {
  console.error('FAIL (muestra privada):',error.message);
  process.exit(1);
}
