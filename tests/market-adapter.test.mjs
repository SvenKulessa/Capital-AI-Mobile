import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const adapter=createRequire(import.meta.url)('../web/market-adapter.js');
const now=20000*86400;
const rows=()=>Array.from({length:30},(_,i)=>({time:now-(30-i)*86400,close:100+i,source:'TEST_FIXTURE',evidenceUrl:'https://example.invalid/fixture',kind:'point'}));
test('no production source is admitted without OSS and open-data evidence',()=>{
 assert.throws(()=>adapter.requireAdmission(adapter.policy),/ADMISSION/);
 const policy={verified:true,softwareLicense:'MIT',dataLicense:'CC-BY-NC-4.0',softwareEvidence:'https://example.invalid/software',dataEvidence:'https://example.invalid/data',endpoint:'https://example.invalid/api',evidenceSha256:'a'.repeat(64)};
 assert.throws(()=>adapter.requireAdmission(policy),/ADMISSION/);
 assert.throws(()=>adapter.requireAdmission({...policy,dataLicense:'CC-BY-4.0',softwareLicense:'UNLICENSED'}),/ADMISSION/);
});
test('adapter replays valid price points deterministically without inventing OHLCV',()=>{
 const result=adapter.series(rows(),'1d',now);
 assert.deepEqual(result,adapter.series(rows().reverse(),'1d',now));
 assert.equal(result.length,30);assert.ok(result.every(x=>x.kind==='point'&&x.open===undefined));
});
test('duplicates, gaps, future observations and stale data fail closed',()=>{
 const duplicate=rows();duplicate[1].time=duplicate[0].time;assert.throws(()=>adapter.series(duplicate,'1d',now),/INVALID/);
 const gap=rows();gap.splice(4,1);assert.throws(()=>adapter.series(gap,'1d',now),/GAP/);
 const future=rows();future.at(-1).time=now+86400;assert.throws(()=>adapter.series(future,'1d',now),/INVALID/);
 assert.throws(()=>adapter.series(rows(),'1d',now+3*86400),/STALE/);
});
test('invalid candles and artificial point-to-candle conversion fail closed',()=>{
 const candles=rows().map(x=>({...x,kind:'ohlcv',open:x.close,high:x.close+2,low:x.close-2,volume:1}));
 assert.equal(adapter.series(candles,'1d',now)[0].kind,'ohlcv');
 candles[3].high=0;assert.throws(()=>adapter.series(candles,'1d',now),/OHLCV/);
 const points=rows();points[0].open=100;assert.throws(()=>adapter.series(points,'1d',now),/POINT/);
});
test('native and web runtime have no removed external provider endpoints',()=>{
 for(const p of ['web/providers.js','android/app/src/main/java/de/svenkulessa/capitalai/mobile/MainActivity.java','scripts/live-contracts.mjs']){
  assert.doesNotMatch(fs.readFileSync(p,'utf8'),/api\.binance\.com|api\.coinpaprika\.com|api\.alternative\.me/);
 }
});
