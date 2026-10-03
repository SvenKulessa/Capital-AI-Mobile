const j=async(url,opt={})=>{const r=await fetch(url,{...opt,redirect:'manual',signal:AbortSignal.timeout(12000)});return[r,await r.text()]};
const [session,sessionBody]=await j('https://capital-ai.online/api/auth/session');
if(session.status!==200)throw new Error('auth session '+session.status);
const sj=JSON.parse(sessionBody);if(sj.configured!==true)throw new Error('auth not configured');
const challenge='A'.repeat(43);
const [login]=await j('https://capital-ai.online/api/auth/mobile-login?challenge='+challenge);
if(login.status!==303||!String(login.headers.get('location')||'').startsWith('https://'))throw new Error('mobile login contract');
console.log(JSON.stringify({authConfiguration:'PASS',mobileLoginRedirect:'PASS',interactiveLogin:'NOT_TESTED'}));
// Real source admission is mandatory; emulation must never satisfy release quality.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const adapter=require('../web/market-adapter.js');
adapter.requireAdmission(adapter.policy);
throw new Error('OSS_SOURCE_NOT_CONFIGURED: Top-400 and live OHLCV not yet verified');
