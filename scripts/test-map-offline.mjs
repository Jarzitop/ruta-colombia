import assert from 'node:assert/strict';
import { LOCAL_STYLE } from '../src/map/offline-style.ts';

const checks = [
  ['local map has no external raster/vector/glyph sources', () => {
    assert.deepEqual(LOCAL_STYLE.sources, {});
    assert.equal(LOCAL_STYLE.layers.length, 1);
    assert.equal(LOCAL_STYLE.layers[0].type, 'background');
  }],
  ['style does not reference a remote URL or sprite', () => {
    const config = JSON.stringify(LOCAL_STYLE);
    assert.doesNotMatch(config, /https?:\/\//i);
    assert.doesNotMatch(config, /"sprite"\s*:/);
    assert.doesNotMatch(config, /"glyphs"\s*:/);
    assert.doesNotMatch(config, /"tiles"\s*:/);
  }],
];
for(const [title,fn] of checks){fn(); console.log('PASS:',title);}
console.log('Result:',checks.length+'/'+checks.length,'offline style checks');
