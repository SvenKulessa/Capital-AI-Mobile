// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Sven Kulessa
(function(root){
  'use strict';
  const OSI=new Set(['MIT','Apache-2.0','BSD-2-Clause','BSD-3-Clause','ISC','GPL-3.0-only','GPL-3.0-or-later','AGPL-3.0-only','AGPL-3.0-or-later']);
  const OPEN_DATA=new Set(['CC0-1.0','CC-BY-4.0','CC-BY-SA-4.0','ODbL-1.0']);
  function requireAdmission(policy){
    if(!policy||policy.verified!==true||!OSI.has(policy.softwareLicense)||!OPEN_DATA.has(policy.dataLicense)||!/^https:\/\//.test(policy.softwareEvidence||'')||!/^https:\/\//.test(policy.dataEvidence||'')||!/^https:\/\//.test(policy.endpoint||'')||!/^[a-f0-9]{64}$/.test(policy.evidenceSha256||''))throw new Error('OSS_PROVIDER_ADMISSION_REQUIRED');
    return policy;
  }
  function series(rows,tf,observedAt){
    const step={ '1h':3600,'4h':14400,'1d':86400 }[tf];
    if(!step||!Number.isFinite(observedAt)||!Array.isArray(rows)||rows.length<20||rows.length>10000)throw new Error('INVALID_SERIES');
    const result=[],times=new Set();let previous=null;
    for(const row of [...rows].sort((a,b)=>a.time-b.time)){
      const time=row.time,close=row.close;
      if(!Number.isInteger(time)||time<0||time>observedAt||time%step||times.has(time)||typeof close!=='number'||!Number.isFinite(close)||close<=0||typeof row.source!=='string'||!row.source||!/^https:\/\//.test(row.evidenceUrl||''))throw new Error('INVALID_MARKET_EVIDENCE');
      if(previous!==null&&time-previous!==step)throw new Error('SERIES_GAP');
      times.add(time);previous=time;
      const point={time,close,source:row.source,evidenceUrl:row.evidenceUrl,kind:'point'};
      if(row.kind==='ohlcv'){
        const values=[row.open,row.high,row.low,row.volume];
        if(!values.every(v=>typeof v==='number'&&Number.isFinite(v))||row.open<=0||row.low<=0||row.high<Math.max(row.open,close)||row.low>Math.min(row.open,close)||row.high<row.low||row.volume<0)throw new Error('INVALID_OHLCV');
        Object.assign(point,{kind:'ohlcv',open:row.open,high:row.high,low:row.low,volume:row.volume});
      }else if(row.kind!=='point'||['open','high','low'].some(k=>row[k]!==undefined))throw new Error('POINT_IS_NOT_OHLCV');
      result.push(Object.freeze(point));
    }
    if(observedAt-result.at(-1).time>step*2)throw new Error('STALE_MARKET_DATA');
    return Object.freeze(result);
  }
  const api=Object.freeze({requireAdmission,series,policy:Object.freeze({verified:false,status:'BLOCKED_SOURCE_ADMISSION',endpoint:null})});
  root.CapitalAIMarketAdapter=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
