import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepareScheduledQuery } from '../src/planner/scheduled-query.ts';
import { findScheduledDirectTrips } from '../src/gtfs/scheduled.ts';
import { syntheticSchedule } from '../src/data/synthetic/dev.temporal.ts';

const dataset = JSON.parse(readFileSync(
  new URL('../src/data/synthetic/dev.dataset.json', import.meta.url), 'utf8'));

function form(overrides = {}) {
  return {
    dataset, schedule: syntheticSchedule,
    originStopId: 'dev-stop-a', destinationStopId: 'dev-stop-b',
    dateText: '2026-10-12', departureText: '',
    ...overrides,
  };
}
const cases = [
  ['ready: generates a GTFS service day without phone timezone', () => {
    const result = prepareScheduledQuery(form());
    assert.equal(result.status, 'ready');
    assert.deepEqual(result.query, {
      serviceDate:'20261012', originStopId:'dev-stop-a', destinationStopId:'dev-stop-b',
    });
  }],
  ['optional time threshold uses boarding time and HH:MM:SS normalization', () => {
    const prepared = prepareScheduledQuery(form({departureText:'10:02'}));
    assert.equal(prepared.status,'ready');
    assert.equal(prepared.query.departureAtOrAfter,'10:02:00');
    const result = findScheduledDirectTrips(syntheticSchedule, prepared.query);
    assert.equal(result.status,'ok');
    assert.deepEqual(result.candidates.map(t=>t.tripId),['dev-holiday-short']);
  }],
  ['invalid Gregorian date is stopped before engine execution', () => {
    assert.equal(prepareScheduledQuery(form({dateText:'2026-02-30'})).status,'invalid-date');
  }],
  ['invalid time is stopped before engine execution', () => {
    assert.equal(prepareScheduledQuery(form({departureText:'10:75'})).status,'invalid-time');
  }],
  ['missing origin is not a recommendation', () => {
    assert.equal(prepareScheduledQuery(form({originStopId:null})).status,'incomplete');
  }],
  ['missing destination is not a recommendation', () => {
    assert.equal(prepareScheduledQuery(form({destinationStopId:null})).status,'incomplete');
  }],
  ['a missing schedule is distinct from no scheduled trip', () => {
    assert.equal(prepareScheduledQuery(form({schedule:null})).status,'catalog-unavailable');
  }],
  ['a different datasetVersion fails closed', () => {
    const otherDataset = {...dataset, datasetVersion:'different-source-edition'};
    assert.equal(prepareScheduledQuery(form({dataset:otherDataset})).status,'catalog-mismatch');
  }],
  ['full date/service query preserves short and long variant eligibility', () => {
    const prepared = prepareScheduledQuery(form({destinationStopId:'dev-stop-c'}));
    assert.equal(prepared.status,'ready');
    const result = findScheduledDirectTrips(syntheticSchedule, prepared.query);
    assert.equal(result.status,'ok');
    assert.deepEqual(result.candidates.map(t=>t.tripId),['dev-holiday-long']);
  }],
  ['after the feed, report lack of coverage instead of service absence', () => {
    const prepared = prepareScheduledQuery(form({dateText:'2027-01-01'}));
    assert.equal(prepared.status,'ready');
    assert.equal(findScheduledDirectTrips(syntheticSchedule, prepared.query).status,'date-outside-feed');
  }],
  ['GTFS clock after 24:00 stays a service-time threshold', () => {
    const prepared=prepareScheduledQuery(form({departureText:'25:15'}));
    assert.equal(prepared.status,'ready');
    assert.equal(prepared.query.departureAtOrAfter,'25:15:00');
  }],
];
let failed = 0;
for (const [name, run] of cases) {
  try { run(); console.log('PASS:',name); }
  catch (error) { failed++; console.error('FAIL:',name,error); }
}
console.log('Resultado:', cases.length - failed, '/', cases.length, 'pruebas del límite UI/motor');
if (failed) process.exitCode = 1;
