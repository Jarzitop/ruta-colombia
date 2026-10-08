import assert from 'node:assert/strict';
import { resolveGtfsServiceDay } from '../src/gtfs/calendar.ts';

// Only invented service identifiers and hypothetical schedule rows.
// No live Bogotá route or departure is implied.
const weekday = {
  service_id: 'demo-weekday', monday: '1', tuesday: '1',
  wednesday: '1', thursday: '1', friday: '1',
  saturday: '0', sunday: '0',
  start_date: '20260101', end_date: '20261231',
};
const weekend = {
  ...weekday, service_id: 'demo-weekend',
  monday: '0', tuesday: '0', wednesday: '0',
  thursday: '0', friday: '0', saturday: '1', sunday: '1',
};
const calendar = [weekday, weekend];
const exceptions = [
  { service_id: 'demo-weekday', date: '20261012', exception_type: '2' },
  { service_id: 'demo-weekend', date: '20261012', exception_type: '1' },
];
const activity = (serviceId, date, cal = calendar, dates = exceptions) =>
  resolveGtfsServiceDay(serviceId, date, cal, dates);

const cases = [
  ['lunes ordinario: servicio de días hábiles activo', () =>
    assert.equal(activity('demo-weekday', '20261005'), 'active')],
  ['sábado ordinario: día hábil inactivo', () =>
    assert.equal(activity('demo-weekday', '20261010'), 'inactive')],
  ['sábado ordinario: servicio de fines de semana activo', () =>
    assert.equal(activity('demo-weekend', '20261010'), 'active')],
  ['excepción: quita el servicio del lunes', () =>
    assert.equal(activity('demo-weekday', '20261012'), 'inactive')],
  ['excepción: agrega el servicio excepcional', () =>
    assert.equal(activity('demo-weekend', '20261012'), 'active')],
  ['no supone actividad después del fin declarado', () =>
    assert.equal(activity('demo-weekday', '20270104'), 'inactive')],
  ['fecha imposible no genera servicio válido', () =>
    assert.equal(activity('demo-weekday', '20260230'), 'unknown')],
  ['servicio no documentado tiene estado desconocido', () =>
    assert.equal(activity('desconocido', '20261005'), 'unknown')],
  ['calendar_dates puede definir servicios sin calendar', () =>
    assert.equal(activity('demo-special', '20261012', [], [
      {service_id:'demo-special',date:'20261012',exception_type:'1'},
    ]), 'active')],
  ['sin día regular ni excepción no inventa disponibilidad', () =>
    assert.equal(activity('demo-special', '20261013', [], []), 'unknown')],
  ['excepciones contradictorias no se eligen arbitrariamente', () =>
    assert.equal(activity('demo-weekday', '20261012', calendar, [
      {service_id:'demo-weekday',date:'20261012',exception_type:'1'},
      {service_id:'demo-weekday',date:'20261012',exception_type:'2'},
    ]), 'unknown')],
  ['si falta el indicador de día devuelve desconocido', () =>
    assert.equal(activity('demo-weekday', '20261005', [{...weekday, monday:''}], []), 'unknown')],
  ['no activa servicio si el calendario está duplicado', () =>
    assert.equal(activity('demo-weekday', '20261005', [weekday, weekday], []), 'unknown')],
];
let failures = 0;
for (const [name, test] of cases) {
  try { test(); console.log('PASS:', name); }
  catch (error) { failures++; console.error('FAIL:', name, error); }
}
console.log(`Resultado: ${cases.length - failures}/${cases.length} pruebas de calendario`);
if (failures) process.exitCode = 1;
