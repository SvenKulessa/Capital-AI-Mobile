(function(root){
  'use strict';
  const emulate=new URLSearchParams(location.search).get('emulate')==='1';
  const pending=new Map(); let seq=0;
  root.CapitalAIReceive=function(id,status,body){const p=pending.get(id);if(!p)return;pending.delete(id);if(status>=200&&status<300)p.resolve({status,body});else p.reject(new Error('HTTP '+status+': '+body.slice(0,200)))};
  function mock(url){
    if(url.includes('/api/auth/session'))return Promise.resolve({status:200,body:JSON.stringify({configured:true,authenticated:true,user:{name:'Browser Emulator'}})});
    if(url.includes('coinpaprika.com/v1/tickers?')){const rows=[];for(let i=1;i<=400;i++)rows.push({id:i===1?'btc-bitcoin':i===2?'eth-ethereum':'c'+String(i).padStart(3,'0')+'-crypto',rank:i,symbol:i===1?'BTC':i===2?'ETH':'C'+String(i).padStart(3,'0'),name:i===1?'Bitcoin':i===2?'Ethereum':'Crypto '+i,circulating_supply:19000000,max_supply:21000000,quotes:{USD:{market_cap:1e12/i,volume_24h:2e10/i}}});return Promise.resolve({status:200,body:JSON.stringify(rows)})}
    if(url.includes('/historical')){const rows=[];const now=Date.now();for(let i=0;i<90;i++)rows.push({timestamp:new Date(now-(90-i)*86400000).toISOString(),price:50000+i*110+Math.sin(i/4)*300,volume_24h:1e9+i*1e6,market_cap:1e12});return Promise.resolve({status:200,body:JSON.stringify(rows)})}
    if(url.includes('binance.com')){const rows=[];const now=Date.now();for(let i=0;i<90;i++){const base=50000+i*110+Math.sin(i/4)*300;rows.push([now-(90-i)*86400000,String(base-80),String(base+260),String(base-300),String(base+120),String(1000+i*3)])}return Promise.resolve({status:200,body:JSON.stringify(rows)})}
    if(url.includes('alternative.me'))return Promise.resolve({status:200,body:JSON.stringify({data:[{value:'62',value_classification:'Greed'}]})});
    if(url.includes('/api/crypto/score'))return Promise.resolve({status:200,body:JSON.stringify({status:'READY',final_score:74.2,modelRegistry:{modelId:'crypto-technical-provenance',modelVersion:'0.7.0'}})});
    return Promise.reject(new Error('mock route missing '+url));
  }
  function request(method,url,body=''){
    if(emulate)return mock(url,method,body);
    if(root.CapitalAI&&typeof root.CapitalAI.request==='function')return new Promise((resolve,reject)=>{const id='r'+(++seq);pending.set(id,{resolve,reject});root.CapitalAI.request(id,method,url,body)});
    return fetch(url,{method,headers:body?{'Content-Type':'application/json'}:undefined,body:body||undefined,credentials:'include'}).then(async r=>{const text=await r.text();if(!r.ok)throw new Error('HTTP '+r.status+': '+text.slice(0,200));return{status:r.status,body:text}});
  }
  const json=async(method,url,body)=>JSON.parse((await request(method,url,body?JSON.stringify(body):'')).body);
  const isoDay=ms=>new Date(ms).toISOString().slice(0,10);
  async function session(){return json('GET','https://capital-ai.online/api/auth/session')}
  function login(){if(emulate)return;if(root.CapitalAI&&typeof root.CapitalAI.login==='function')root.CapitalAI.login();else location.href='capitalai-private://login'}
  async function universe(){const rows=await json('GET','https://api.coinpaprika.com/v1/tickers?quotes=USD');const seen=new Set();return rows.filter(x=>Number.isInteger(x.rank)&&x.rank>0).sort((a,b)=>a.rank-b.rank).filter(x=>{const s=String(x.symbol||'').toUpperCase();if(!s||seen.has(s))return false;seen.add(s);return true}).slice(0,400)}
  async function binanceSeries(asset,tf){const interval=tf==='4h'?'4h':tf==='1h'?'1h':'1d';const rows=await json('GET',`https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(asset.symbol)}USDT&interval=${interval}&limit=240`);if(!Array.isArray(rows)||rows.length<20)throw new Error('BINANCE_HISTORY_INSUFFICIENT');return rows.map(r=>({time:Number(r[0])/1000,open:Number(r[1]),high:Number(r[2]),low:Number(r[3]),close:Number(r[4]),volume:Number(r[5]),source:'Binance',kind:'ohlcv'}))}
  async function paprikaSeries(asset,tf){if(!asset?.id)throw new Error('COINPAPRIKA_ID_MISSING');const now=Date.now(),hourly=tf==='1h'||tf==='4h',start=isoDay(now-(hourly?24:120*24)*3600000),end=isoDay(now+86400000),interval=hourly?'1h':'24h';const rows=await json('GET',`https://api.coinpaprika.com/v1/tickers/${encodeURIComponent(asset.id)}/historical?start=${start}&end=${end}&interval=${interval}&quote=usd`);if(!Array.isArray(rows)||!rows.length)throw new Error('COINPAPRIKA_HISTORY_UNAVAILABLE');let points=rows.map(r=>({time:Date.parse(r.timestamp)/1000,close:Number(r.price),volume:Number(r.volume_24h||0),source:'CoinPaprika',kind:'point'})).filter(r=>Number.isFinite(r.time)&&Number.isFinite(r.close)&&r.close>0).sort((a,b)=>a.time-b.time);if(tf==='4h'){const grouped=[];for(let i=0;i<points.length;i+=4){const chunk=points.slice(i,i+4);if(chunk.length)grouped.push(chunk.at(-1));}points=grouped;}return points}
  async function marketSeries(asset,tf){try{return await binanceSeries(asset,tf)}catch(binanceError){const fallback=await paprikaSeries(asset,tf);return fallback.map(x=>({...x,fallbackReason:String(binanceError?.message||'BINANCE_UNAVAILABLE')}))}}
  async function sentiment(){const x=await json('GET','https://api.alternative.me/fng/?limit=1');const row=x.data?.[0],n=Number(row?.value);return{points:Number.isFinite(n)?Math.round(n):null,label:row?.value_classification||null}}
  async function remoteScore(symbol,name){return json('POST','https://capital-ai.online/api/crypto/score',{symbol,asset_name:name})}
  root.CapitalAIProviders={session,login,universe,marketSeries,sentiment,remoteScore,emulate};
})(window);
