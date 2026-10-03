import {randomBytes, createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const adapter=createRequire(import.meta.url)('../web/market-adapter.js');
const gates=[];
async function check(name,fn){
  try { await fn(); gates.push({gate:name,status:'PASS'}); }
  catch(error) { gates.push({gate:name,status:'FAIL',reason:error.message}); }
}
// Admission diagnostics survive independent network/auth failures.
await check('OSS_SOURCE_ADMISSION',()=>adapter.requireAdmission(adapter.policy));
const request=async(url)=>fetch(url,{redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(12000)});
await check('AUTH_CONFIGURATION',async()=>{
  const response=await request('https://capital-ai.online/api/auth/session');
  if(response.status!==200)throw new Error('AUTH_SESSION_HTTP_'+response.status);
  const session=await response.json();
  if(session.configured!==true)throw new Error('AUTH_NOT_CONFIGURED');
  if(!/(?:^|,)\s*no-store\s*(?:,|$)/i.test(response.headers.get('cache-control')||''))throw new Error('AUTH_CACHE_POLICY_INVALID');
});
await check('MOBILE_LOGIN_REDIRECT',async()=>{
  const verifier=randomBytes(32).toString('base64url');
  const challenge=createHash('sha256').update(verifier).digest('base64url');
  const response=await request('https://capital-ai.online/api/auth/mobile-login?challenge='+challenge);
  if(response.status!==303)throw new Error('MOBILE_LOGIN_HTTP_'+response.status);
  const target=new URL(response.headers.get('location')||'');
  if(target.protocol!=='https:'||target.username||target.password)throw new Error('MOBILE_LOGIN_REDIRECT_INVALID');
});
// No universe/OHLCV implementation exists yet; a policy flag cannot replace it.
gates.push({gate:'MULTI_ASSET_LIVE_UNIVERSE',status:'FAIL',reason:'OSS_SOURCE_NOT_CONFIGURED',pilotPerClass:adapter.universePolicy.firstTestPerClass,targets:adapter.universePolicy.targets});
gates.push({gate:'INTERACTIVE_ANDROID_LOGIN',status:'NOT_TESTED'});
console.log(JSON.stringify({gates},null,2));
if(gates.some(gate=>gate.status==='FAIL'))process.exitCode=1;
