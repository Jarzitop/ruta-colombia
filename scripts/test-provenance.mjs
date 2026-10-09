import assert from 'node:assert/strict';
import { catalogProvenance } from '../src/data/provenance.ts';

const sample = {
  datasetVersion:'test-only', publishable:false,
  sourceRefs:[{
    id:'official-test', kind:'official', publisher:'Agencia de prueba',
    title:'GTFS ficticio versión X', consultedAt:'2026-10-08',
  }],
};
const schedule = {
  timezone:'America/Bogota',
  feedInfo:{feed_start_date:'20260101',feed_end_date:'20261231'},
};
const tests=[
  ['exposes source revision and schedule bounds without inferring freshness',()=>{
    const text=catalogProvenance(sample,schedule);
    assert.match(text,/Agencia de prueba/);
    assert.match(text,/versión X/);
    assert.match(text,/20260101–20261231/);
    assert.match(text,/licencia y actualidad sujetas a confirmación/);
  }],
  ['synthetic-only catalog has no official provider attribution',()=>{
    const data={...sample,sourceRefs:[{...sample.sourceRefs[0],kind:'synthetic'}]};
    assert.equal(catalogProvenance(data,schedule),null);
  }],
  ['review marker stays until publishable is explicitly true',()=>{
    const data={...sample,publishable:true};
    assert.match(catalogProvenance(data,schedule),/Cobertura limitada/);
  }],
];
let failures=0;
for(const [name,fn] of tests){
 try{fn();console.log('PASS:',name);}
 catch(e){failures++;console.error('FAIL:',name,e);}
}
console.log('Result:',tests.length-failures+'/'+tests.length);
if(failures)process.exitCode=1;
