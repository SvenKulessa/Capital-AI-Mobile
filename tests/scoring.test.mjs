import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync(new URL('../web/scoring.js',import.meta.url),'utf8');
const sandbox={module:{exports:{}},exports:{},globalThis:{},Date,Math,Number,Set,Object,Array,String};
vm.createContext(sandbox);vm.runInContext(code,sandbox);const S=sandbox.module.exports;
function bars(n=60){const now=Math.floor(Date.now()/1000);return Array.from({length:n},(_,i)=>{const c=100+i*.7+Math.sin(i/4);return{time:now-(n-i)*86400,open:c-.3,high:c+1,low:c-1,close:c,volume:1000+i*2}})}
const snap={rank:1,circulating_supply:19_000_000,max_supply:21_000_000,quotes:{USD:{market_cap:1_000_000_000_000,volume_24h:30_000_000_000}}};
test('Finance model identity and weights stay pinned',()=>{assert.equal(S.MODEL_ID,'crypto-technical-provenance');assert.equal(S.MODEL_VERSION,'0.7.0');const sum=Object.values(S.WEIGHTS).reduce((a,b)=>a+b,0);assert.ok(Math.abs(sum-1)<1e-8)});
test('verified bars produce a canonical READY score',()=>{const r=S.evaluate('BTC',bars(),snap);assert.equal(r.status,'READY');assert.equal(r.integrity.resultContractVersion,'scoring-integrity/1.1.0');assert.ok(r.final_score>=0&&r.final_score<=100);assert.ok(r.integrity.coverage>=.5)});
test('insufficient history fails closed',()=>{const r=S.evaluate('BTC',bars(10),snap);assert.equal(r.status,'INSUFFICIENT_HISTORY');assert.equal(r.final_score,null)});
test('sentiment is absent from productive weights',()=>{assert.equal('sentiment' in S.WEIGHTS,false)});
test('patterns are deterministic evidence, not score inputs',()=>{const p=S.detectPatterns(bars());assert.ok(Array.isArray(p));assert.ok(p.every(x=>x.priority>=1&&x.priority<=5));assert.equal('patterns' in S.WEIGHTS,false)});
