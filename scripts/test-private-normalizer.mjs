import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { syntheticSchedule } from '../src/data/synthetic/dev.temporal.ts';
import { normalizePrivateBogota } from './lib/normalize-private-bogota.mjs';
import { validateDataset } from './dataset-validator.mjs';
import { validateScheduledCatalog, findScheduledDirectTrips } from '../src/gtfs/scheduled.ts';

// All sample objects below are fabricated. Only the generic Bogotá city ID
// is used to exercise the audited-package normalizer.
const create = () => {
  const dataset = JSON.parse(readFileSync(
    new URL('../src/data/synthetic/dev.dataset.json', import.meta.url)));
  dataset.cities[0].id = 'bogota';
  dataset.stops.forEach((stop) => { stop.cityId = 'bogota'; });
  dataset.routes.forEach((route) => { route.cityId = 'bogota'; });
  dataset.patterns.forEach((pattern) => { pattern.cityId = 'bogota'; });
  const temporal = structuredClone(syntheticSchedule);
  temporal.publishable = false;
  temporal.patterns.forEach((pattern) => { pattern.sourceRefIds = ['src-dev-synthetic']; });
  return { dataset, temporal };
};

const checks = [
  ['keeps both documented patterns and their distinct terminals', () => {
    const {dataset, temporal} = create();
    const result = normalizePrivateBogota(dataset, temporal);
    assert.deepEqual(result.errors, []);
    assert.equal(result.dataset.publishable, false);
    assert.equal(result.dataset.patterns.length, 2);
    assert.equal(result.dataset.patterns[0].stops.length, 3);
    assert.equal(result.dataset.patterns[1].stops.length, 2);
    assert.equal(result.dataset.patterns[1].stops.at(-1).stopId, 'dev-stop-b');
    assert.deepEqual(validateDataset(result.dataset), []);
    assert.deepEqual(validateScheduledCatalog(result.temporal), []);
  }],
  ['does not copy the longer geometry to the short trip', () => {
    const {dataset, temporal} = create();
    const result = normalizePrivateBogota(dataset, temporal);
    assert.ok(result.dataset.patterns[0].geometry);
    assert.equal(result.dataset.patterns[1].geometry, undefined);
  }],
  ['negative trip to long-only terminal excludes the short pattern', () => {
    const {dataset, temporal} = create();
    const result = normalizePrivateBogota(dataset, temporal);
    const search = findScheduledDirectTrips(result.temporal, {
      serviceDate:'20261012',originStopId:'dev-stop-a',destinationStopId:'dev-stop-c',
    });
    assert.equal(search.status,'ok');
    assert.ok(search.candidates.every((item)=>item.patternId==='dev-pattern-1-outbound'));
  }],
  ['rejects feed/catalog version mismatch', () => {
    const {dataset, temporal}=create();
    temporal.catalogDatasetVersion='other-version';
    assert.ok(normalizePrivateBogota(dataset,temporal).errors.length);
  }],
  ['rejects a missing stop in the shorter pattern', () => {
    const {dataset, temporal}=create();
    temporal.patterns[1].stops[1].stopId='stop-no-documentada';
    assert.ok(normalizePrivateBogota(dataset,temporal).errors.length);
  }],
  ['rejects altering the documented full-length sequence', () => {
    const {dataset, temporal}=create();
    temporal.patterns[0].stops[1].stopId='dev-stop-c';
    assert.ok(normalizePrivateBogota(dataset,temporal).errors.length);
  }],
  ['rejects unknown and duplicate variants', () => {
    const {dataset, temporal}=create();
    temporal.patterns.push(structuredClone(temporal.patterns[1]));
    assert.ok(normalizePrivateBogota(dataset,temporal).errors.length);
  }],
  ['requires both versions to remain nonpublishable', () => {
    const {dataset, temporal}=create();
    dataset.publishable=true;
    assert.ok(normalizePrivateBogota(dataset,temporal).errors.length);
  }],
];
let failures=0;
for(const [name,run] of checks){
  try {run();console.log('PASS:',name);}
  catch(error){failures++;console.error('FAIL:',name,error);}
}
console.log('Result:',checks.length-failures+'/'+checks.length,'synthetic normalization tests');
if(failures) process.exitCode=1;
