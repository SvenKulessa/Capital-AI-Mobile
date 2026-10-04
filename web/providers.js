(function(root){
  'use strict';
  const emulate=new URLSearchParams(location.search).get('emulate')==='1';
  const pending=new Map();let seq=0;
  root.CapitalAIReceive=function(id,status,body){const p=pending.get(id);if(!p)return;pending.delete(id);clearTimeout(p.timer);if(status>=200&&status<300)p.resolve({status,body});else p.reject(new Error('HTTP '+status))};
  function request(method,url){
    if(root.CapitalAI&&typeof root.CapitalAI.request==='function')return new Promise((resolve,reject)=>{const id='r'+(++seq),timer=setTimeout(()=>{pending.delete(id);reject(new Error('REQUEST_TIMEOUT'))},18000);pending.set(id,{resolve,reject,timer});root.CapitalAI.request(id,method,url,'')});
    return fetch(url,{method,cache:'no-store',credentials:'include',redirect:'error',signal:AbortSignal.timeout(18000)}).then(async r=>{if(!r.ok)throw new Error('HTTP '+r.status);return{status:r.status,body:await r.text()}});
  }
  async function session(){if(emulate)return{configured:true,authenticated:true,user:{name:'OSS Adapter Test Fixture'}};return JSON.parse((await request('GET','https://capital-ai.online/api/auth/session')).body)}
  function login(){if(emulate)return;if(root.CapitalAI&&typeof root.CapitalAI.login==='function')root.CapitalAI.login();else location.href='capitalai-private://login'}
  function fixtureUniverse(){return Array.from({length:root.CapitalAIMarketAdapter.universePolicy.firstTestPerClass},(_,i)=>({id:'fixture-'+i,rank:i+1,symbol:i===0?'BTC':'TEST'+i,name:i===0?'Bitcoin Test Fixture':'Test Asset '+i,source:'LOCAL_TEST_FIXTURE',circulating_supply:19000000,max_supply:21000000,quotes:{USD:{market_cap:1e12/(i+1),volume_24h:2e10/(i+1)}}}))}
  async function universe(){if(emulate)return fixtureUniverse();root.CapitalAIMarketAdapter.requireAdmission(root.CapitalAIMarketAdapter.policy);throw new Error('OSS_SOURCE_NOT_CONFIGURED')}
  async function marketSeries(asset,tf){
    if(!emulate){root.CapitalAIMarketAdapter.requireAdmission(root.CapitalAIMarketAdapter.policy);throw new Error('OSS_SOURCE_NOT_CONFIGURED')}
    const step={'1h':3600,'4h':14400,'1d':86400}[tf],now=Math.floor(Date.now()/1000),end=Math.floor(now/step)*step-step;
    const rows=Array.from({length:90},(_,i)=>{const base=50000+i*110+Math.sin(i/4)*300;return{time:end-(89-i)*step,open:base-80,high:base+260,low:base-300,close:base+120,volume:1000+i*3,source:'LOCAL_TEST_FIXTURE',evidenceUrl:'https://app.capital-ai.local/test-fixture',kind:'ohlcv'}});
    return root.CapitalAIMarketAdapter.series(rows,tf,now);
  }
  async function sentiment(){return{points:null,label:'Keine zugelassene OSS-Datenquelle'}}
  root.CapitalAIProviders={session,login,universe,marketSeries,sentiment,emulate};
})(window);
