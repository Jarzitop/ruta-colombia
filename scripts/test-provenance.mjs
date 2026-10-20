import assert from 'node:assert/strict';
import { catalogProvenance } from '../src/data/provenance.ts';
import { dataAttribution, isConfirmedTransMilenioGtfs } from '../src/data/licensing.ts';

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
  ['signed institutional reply confirms GTFS licensing only for its official publisher',()=>{
    const data={...sample,datasetVersion:'bogota-gtfs-20260929',
      sourceRefs:[{...sample.sourceRefs[0],publisher:'TRANSMILENIO S.A.',
        title:'Datos GTFS revisión 29 septiembre',url:'https://example.org/official'}]};
    const credits=dataAttribution(data);
    assert.equal(credits?.license,'CC BY-SA 4.0');
    assert.match(credits?.licenseUrl ?? '',/creativecommons.org\/licenses\/by-sa\/4.0/);
    assert.equal(credits?.sourceUrl,'https://example.org/official');
    assert.match(catalogProvenance(data,schedule),/CC BY-SA 4.0 confirmada/);
    assert.match(catalogProvenance(data,schedule),/actualidad de los horarios/);
    assert.doesNotMatch(catalogProvenance(data,schedule),/licencia y actualidad sujetas/);
  }],
  ['other operators never inherit TransMilenio licensing',()=>{
    const row={...sample.sourceRefs[0],publisher:'Operador de prueba',title:'Datos GTFS'};
    assert.equal(isConfirmedTransMilenioGtfs(row,'gtfs-2026'),false);
    assert.equal(dataAttribution({...sample,sourceRefs:[row]}),null);
  }],
  ['TransMilenio non-GTFS documents are not automatically licensed GTFS',()=>{
    const row={...sample.sourceRefs[0],publisher:'TRANSMILENIO S.A.',title:'Informe anual'};
    assert.equal(isConfirmedTransMilenioGtfs(row,'informe-2026'),false);
  }],
  ['confirmed license still does not mark dataset publishable',()=>{
    const row={...sample.sourceRefs[0],publisher:'TransMilenio S.A.',title:'GTFS'};
    const data={...sample,datasetVersion:'gtfs-bogota',sourceRefs:[row]};
    assert.equal(data.publishable,false);
    assert.match(catalogProvenance(data,schedule),/Ensayo interno/);
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
