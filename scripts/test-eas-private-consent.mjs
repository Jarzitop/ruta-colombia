import assert from 'node:assert/strict';
import { missingPrivateEasApprovals } from './check-eas-private-consent.mjs';

const all = {
  RUTA_EXPO_FREE_PLAN_CONFIRMED:'YES',
  RUTA_EXPO_QUOTA_CONFIRMED:'YES',
  RUTA_EXPO_PRIVATE_BUILDS_CONFIRMED:'YES',
  RUTA_PRIVATE_EAS_UPLOAD_APPROVED:'YES',
};
const tests=[
  ['no approval: cloud build blocked',()=>{
    assert.equal(missingPrivateEasApprovals({}).length,4);
  }],
  ['only transfer permission: billing and privacy still block',()=>{
    const missing=missingPrivateEasApprovals({RUTA_PRIVATE_EAS_UPLOAD_APPROVED:'YES'});
    assert.equal(missing.length,3);
  }],
  ['a paid-plan status cannot pass cost-zero requirement',()=>{
    assert.equal(missingPrivateEasApprovals({...all,RUTA_EXPO_FREE_PLAN_CONFIRMED:'NO'}).length,1);
  }],
  ['privacy not disabled: block even on Free plan',()=>{
    assert.equal(missingPrivateEasApprovals({...all,RUTA_EXPO_PRIVATE_BUILDS_CONFIRMED:''}).length,1);
  }],
  ['no remaining free builds: blocked',()=>{
    assert.equal(missingPrivateEasApprovals({...all,RUTA_EXPO_QUOTA_CONFIRMED:'NO'}).length,1);
  }],
  ['only all four manually checked conditions pass',()=>{
    assert.deepEqual(missingPrivateEasApprovals(all),[]);
  }],
];
for(const [name,test] of tests){ test();console.log('PASS:',name); }
console.log('Resultado:',tests.length+'/'+tests.length,'puertas de costo y privacidad');
