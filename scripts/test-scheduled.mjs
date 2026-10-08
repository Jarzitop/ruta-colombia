import assert from 'node:assert/strict';
import { findScheduledDirectTrips, validateScheduledCatalog } from '../src/gtfs/scheduled.ts';

const weekday = {
  service_id:'weekday',monday:'1',tuesday:'1',wednesday:'1',
  thursday:'1',friday:'1',saturday:'0',sunday:'0',
  start_date:'20261001',end_date:'20261031',
};
const saturday = {...weekday,service_id:'sat',monday:'0',tuesday:'0',
  wednesday:'0',thursday:'0',friday:'0',saturday:'1'};
const holiday = {...weekday,service_id:'holiday',monday:'0',tuesday:'0',
  wednesday:'0',thursday:'0',friday:'0',sunday:'1'};
const long = {
  id:'demo-long',routeId:'demo-route',directionId:'demo-east',stops:[
    {stopId:'demo-A',sequence:1,boardingAllowed:true,alightingAllowed:true},
    {stopId:'demo-B',sequence:2,boardingAllowed:true,alightingAllowed:true},
    {stopId:'demo-C',sequence:3,boardingAllowed:true,alightingAllowed:true},
  ],
};
const short = {
  ...long,id:'demo-short',
  stops:long.stops.slice(0,2).map(s=>({...s})),
};
const time=(hhmmss)=>{const [h,m,s]=hhmmss.split(':').map(Number);return h*3600+m*60+s;};
function trip(id,serviceId,pattern,events) {
  return {
    tripId:id,serviceId,patternId:pattern.id,sourceRefIds:['synthetic-source'],
    stopTimes:events.map((value,i)=>({
      stopId:pattern.stops[i].stopId,
      sequence:pattern.stops[i].sequence,
      arrivalTime:value,departureTime:value,
      arrivalSeconds:time(value),departureSeconds:time(value),
      timepoint:0,
    })),
  };
}
const synthetic = {
  auditSchemaVersion:'1.0.0',
  catalogDatasetVersion:'dev-temporal-only',
  timezone:'America/Bogota',scope:'synthetic-test-only',
  feedInfo:{feed_start_date:'20261001',feed_end_date:'20261031'},
  calendar:[weekday,saturday,holiday],
  calendarDates:[
    {service_id:'weekday',date:'20261012',exception_type:'2'},
    {service_id:'holiday',date:'20261012',exception_type:'1'},
  ],
  patterns:[long,short],
  trips:[
    trip('dev-week-long','weekday',long,['10:00:00','10:05:00','10:10:00']),
    trip('dev-sat-long','sat',long,['10:00:00','10:05:00','10:10:00']),
    trip('dev-holiday-long','holiday',long,['10:00:00','10:05:00','10:10:00']),
    trip('dev-holiday-short','holiday',short,['10:03:00','10:08:00']),
  ],
};
const clone=()=>structuredClone(synthetic);
const find=(serviceDate,originStopId='demo-A',destinationStopId='demo-C',extra={},data=synthetic)=>
  findScheduledDirectTrips(data,{serviceDate,originStopId,destinationStopId,...extra});
const expected=(result,status)=>assert.equal(result.status,status,JSON.stringify(result).slice(0,150));
const tests=[
  ['fixture sintético temporal válido',()=>assert.deepEqual(validateScheduledCatalog(synthetic),[])],
  ['día laborable solo patrón largo programado',()=>{
    const r=find('20261019');expected(r,'ok');
    assert.deepEqual(r.candidates.map(x=>x.tripId),['dev-week-long']);
  }],
  ['festivo activa solo patrón largo para parada terminal larga',()=>{
    const r=find('20261012');expected(r,'ok');
    assert.deepEqual(r.candidates.map(x=>x.tripId),['dev-holiday-long']);
  }],
  ['festivo incluye ambas variantes para parada compartida',()=>{
    const r=find('20261012','demo-A','demo-B');expected(r,'ok');
    assert.deepEqual(r.candidates.map(x=>x.tripId),['dev-holiday-long','dev-holiday-short']);
  }],
  ['no inventa terminal largo para patrón corto',()=>{
    const r=find('20261012','demo-B','demo-C');expected(r,'ok');
    assert.equal(r.candidates.length,1);
    assert.equal(r.candidates[0].patternId,'demo-long');
  }],
  ['fecha con excepción desactiva el patrón de días hábiles',()=>{
    assert.equal(find('20261012').candidates.some(x=>x.tripId==='dev-week-long'),false);
  }],
  ['sábado corresponde solo al servicio de sábado',()=>{
    const r=find('20261010');expected(r,'ok');
    assert.deepEqual(r.candidates.map(x=>x.tripId),['dev-sat-long']);
  }],
  ['no presupone viajes en sentido contrario',()=>expected(find('20261012','demo-C','demo-A'),'no-scheduled-trip-in-sample')],
  ['la búsqueda por hora usa la hora de abordaje, no el inicio de ruta',()=>{
    const r=find('20261012','demo-B','demo-C',{departureAtOrAfter:'10:06:00'});
    expected(r,'no-scheduled-trip-in-sample');
    const r2=find('20261012','demo-B','demo-C',{departureAtOrAfter:'10:05:00'});
    expected(r2,'ok');
  }],
  ['filtra horarios por GTFS seconds y ordena',()=>{
    const r=find('20261012','demo-A','demo-B',{departureAtOrAfter:'10:02:00'});
    expected(r,'ok');assert.deepEqual(r.candidates.map(x=>x.tripId),['dev-holiday-short']);
  }],
  ['tiempos timepoint=0 son aproximados y nunca tiempo real',()=>{
    const r=find('20261012');expected(r,'ok');
    assert.equal(r.timing,'scheduled-not-realtime');
    assert.equal(r.candidates[0].boardingTimeApproximate,true);
    assert.equal(r.candidates[0].alightingTimeApproximate,true);
    assert.equal(r.timezone,'America/Bogota');
  }],
  ['misma parada no crea viaje',()=>expected(find('20261012','demo-B','demo-B'),'same-stop')],
  ['parada desconocida no se confunde con ausencia de servicio',()=>expected(find('20261012','demo-A','demo-unknown'),'not-covered')],
  ['no afirma que el servicio termina después de la fecha límite',()=>expected(find('20270101'),'date-outside-feed')],
  ['fecha inexistente se rechaza',()=>expected(find('20260230'),'invalid-query')],
  ['hora mal formada se rechaza',()=>expected(find('20261012','demo-A','demo-B',{departureAtOrAfter:'25:62:00'}),'invalid-query')],
  ['servicio sin calendario es desconocido, no falso negativo',()=>{
    const data=clone();data.trips.push(trip('dev-unknown','missing',long,['11:00:00','11:05:00','11:10:00']));
    expected(find('20261012','demo-A','demo-C',{},data),'calendar-unknown');
  }],
  ['patrón con secuencia de eventos alterada se bloquea',()=>{
    const data=clone();data.trips[0].stopTimes[1].stopId='demo-C';
    expected(find('20261019','demo-A','demo-C',{},data),'invalid-data');
  }],
  ['viajes duplicados se bloquean',()=>{
    const data=clone();data.trips.push(structuredClone(data.trips[0]));
    expected(find('20261019','demo-A','demo-C',{},data),'invalid-data');
  }],
  ['una transición temporal regresiva se rechaza',()=>{
    const data=clone();data.trips[0].stopTimes[2].arrivalSeconds=0;
    expected(find('20261019','demo-A','demo-C',{},data),'invalid-data');
  }],
  ['conserva horas GTFS después de medianoche sin módulo 24',()=>{
    const data=clone();
    data.trips.push(trip('dev-nextday','holiday',long,['27:00:00','27:05:00','27:10:00']));
    const r=find('20261012','demo-A','demo-C',{departureAtOrAfter:'24:00:00'},data);
    expected(r,'ok');assert.deepEqual(r.candidates.map(x=>x.tripId),['dev-nextday']);
    assert.equal(r.candidates[0].scheduledBoardDeparture,'27:00:00');
  }],
  ['si no hay viaje después del umbral solo informa sobre la muestra',()=>{
    const r=find('20261012','demo-A','demo-C',{departureAtOrAfter:'13:00:00'});
    expected(r,'no-scheduled-trip-in-sample');assert.equal(r.scope,'provided-catalog');
  }],
];

let failures=0;
for(const [name,run] of tests){
 try{run();console.log('PASS:',name);}
 catch(error){failures++;console.error('FAIL:',name,error);}
}
console.log('Resultado:',tests.length-failures+'/'+tests.length,'pruebas del motor temporal');
if(failures)process.exitCode=1;
