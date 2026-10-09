import assert from 'node:assert/strict';
import { visibleStopsForTrip } from '../src/map/stop-visibility.ts';

const catalog = [
  { id:'ficticio-A' }, { id:'ficticio-B' },
  { id:'ficticio-C' }, { id:'ficticio-terminus-largo' },
];
const tests=[
  ['no itinerary: display only catalog stops',()=>{
    assert.deepEqual(visibleStopsForTrip(catalog,null),catalog);
  }],
  ['short trip: hide long-only terminal marker',()=>{
    const shown=visibleStopsForTrip(catalog,['ficticio-A','ficticio-B','ficticio-C']);
    assert.deepEqual(shown.map(x=>x.id),['ficticio-A','ficticio-B','ficticio-C']);
    assert.ok(!shown.some(x=>x.id==='ficticio-terminus-largo'));
  }],
  ['unknown IDs never produce invented points',()=>{
    assert.deepEqual(visibleStopsForTrip(catalog,['ficticio-desconocido']),[]);
  }],
  ['an empty selected segment has no visible stops',()=>{
    assert.deepEqual(visibleStopsForTrip(catalog,[]),[]);
  }],
];
for(const [name,check] of tests){check(); console.log('PASS:',name);}
console.log('Result:',tests.length+'/'+tests.length,'map-stop scope tests');
