import {DAY} from './indicators.mjs';

export const intervals = [
  ['1m',60],['5m',300],['15m',900],['30m',1800],['1h',3600],
  ['4h',14400],['12h',43200],['1D',DAY],['3D',3*DAY],['1W',7*DAY],['1M',30*DAY]
].map(([label,step]) => ({label,step,
  aggregate:label === '1W' ? 'week' : label === '1M' ? 'month' : null}));

const FIRST_BITSTAMP_DAY = Date.UTC(2011,7,18) / 1000;
const emptyNetwork = () => ({difficulty:[], 'hash-rate':[]});

export function merge(previous, added) {
  const byTime = new Map(previous.map(bar => [bar.t, bar]));
  for (const bar of added) byTime.set(bar.t, bar);
  return Array.from(byTime.values()).sort((a,b) => a.t-b.t);
}

export function periodAt(time, interval, anchor = 0) {
  if (!interval.aggregate) {
    const t = anchor + Math.floor((time-anchor)/interval.step)*interval.step;
    return {t,end:t+interval.step};
  }
  const date = new Date(time*1000);
  if (interval.aggregate === 'week') {
    const t = Math.floor(time/DAY)*DAY - (date.getUTCDay()+6)%7*DAY;
    return {t,end:t+7*DAY};
  }
  const t = Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),1)/1000;
  const end = Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,1)/1000;
  return {t,end};
}

export function aggregate(bars, kind) {
  const result = [];
  for (const bar of bars) {
    const {t:start,end} = periodAt(bar.t,{aggregate:kind});
    const last = result.at(-1);
    if (!last || last.t !== start) {
      result.push({...bar, t:start, end});
    } else {
      last.h = Math.max(last.h, bar.h);
      last.l = Math.min(last.l, bar.l);
      last.c = bar.c;
      last.v += bar.v;
    }
  }
  return result;
}

let dbPromise;
function database() {
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open('bitcoin-overlay-1', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('feeds');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function cacheGet(key) {
  try {
    const db = await database();
    return await new Promise((resolve, reject) => {
      const req = db.transaction('feeds').objectStore('feeds').get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

async function cachePut(key, value) {
  try {
    const db = await database();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('feeds','readwrite');
      tx.objectStore('feeds').put(value,key);
      tx.oncomplete = resolve;
      tx.onabort = reject;
    });
  } catch {
    // The live chart also works when local storage is unavailable.
  }
}

async function request(path, signal) {
  const response = await fetch('/market/' + path, {cache:'no-store', signal});
  if (!response.ok) throw new Error('Feed unavailable');
  return response.json();
}

export async function candles(step, limit, end, signal) {
  const query = new URLSearchParams({step,limit});
  if (end !== undefined) query.set('end', Math.floor(end));
  const payload = await request('candles?' + query,signal);
  const bars = payload.data.ohlc.map(d => ({
    t:+d.timestamp, o:+d.open, h:+d.high, l:+d.low, c:+d.close, v:+d.volume
  })).filter(b => b.t > 0 && b.l > 0 && b.h >= Math.max(b.o,b.c,b.l) &&
    b.l <= Math.min(b.o,b.c) && Object.values(b).every(Number.isFinite));
  return merge([],bars);
}

export async function marketFeed(interval, signal, publish, fast = false) {
  const step = interval.aggregate ? DAY : interval.step;
  const key = 'ohlc-' + step;
  const saved = await cacheGet(key);
  let bars = saved?.bars || [];
  let complete = saved?.complete || false;
  const unpack = bars => interval.aggregate ? aggregate(bars, interval.aggregate) : bars;
  if (bars.length && !signal.aborted && !fast) publish(unpack(bars), 'cache');
  let current = false;
  try {
    const gap = bars.length ? Math.floor((Date.now()/1000 - bars.at(-1).t) / step) : Infinity;
    const incremental = gap < 995;
    const newest = await candles(step, incremental ? Math.max(3, gap + 3) : 1000, undefined, signal);
    if (!newest.length) throw new Error('Empty candle feed');
    current = (Date.now()/1000 - newest.at(-1).t) < Math.max(step*2, 15*60);
    if (!incremental) { bars = []; complete = false; }
    bars = merge(bars,newest);
    const historical = step >= DAY;
    const limit = historical ? 9000 : 3500;
    if (bars.length > limit) bars = bars.slice(-limit);
    if (signal.aborted) return;
    if (bars.length >= limit || bars[0].t <= FIRST_BITSTAMP_DAY + step ||
        (historical && !incremental && newest.length < 1000)) complete = true;
    publish(unpack(bars), current ? complete ? 'live' : fast ? 'partial' : 'history' : 'stale');
    await cachePut(key,{bars,complete});
    while (!complete && !fast && !signal.aborted) {
      const pageSize = Math.min(1000,limit - bars.length);
      if (pageSize <= 0) break;
      const oldest = bars[0].t;
      const older = (await candles(step,pageSize,oldest-1,signal)).filter(b => b.t < oldest);
      if (signal.aborted) return;
      bars = merge(older,bars);
      complete = older.length < pageSize || bars.length >= limit || bars[0].t <= FIRST_BITSTAMP_DAY + step;
      if (bars.length >= 1430 || complete) publish(unpack(bars), current ? complete ? 'live' : 'history' : 'stale');
      await cachePut(key,{bars,complete});
    }
  } catch (error) {
    if (!signal.aborted) publish(unpack(bars),bars.length ? current ? 'partial' : 'stale' : 'failed');
  }
}

export function miningHistory(payload) {
  const hash = merge([],payload.hashrates.map(p => ({
    t:Math.floor(+p.timestamp/DAY)*DAY, v:+p.avgHashrate
  })).filter(p => Number.isFinite(p.t) && Number.isFinite(p.v) && p.v >= 0));
  const adjustments = merge([],payload.difficulty.map(p => ({
    t:+p.time, v:+p.difficulty
  })).filter(p => Number.isFinite(p.t) && Number.isFinite(p.v) && p.v > 0));
  if (hash.length < 200 || !adjustments.length) throw new Error('Incomplete mining history');
  const difficulty = [];
  let j = 0, current;
  for (let t = Math.floor(adjustments[0].t/DAY)*DAY; t <= hash.at(-1).t; t += DAY) {
    while (j < adjustments.length && adjustments[j].t < t+DAY) current = adjustments[j++].v;
    difficulty.push({t,v:current});
  }
  return {difficulty,'hash-rate':hash};
}

export async function miningFeed() {
  const key = 'mining-history-v2';
  const saved = await cacheGet(key);
  let data = saved?.data;
  let status = 'ok';
  if (!saved || Date.now() - saved.savedAt >= 6 * 60 * 60 * 1000) {
    try {
      data = miningHistory(await request('mining'));
      await cachePut(key,{data,savedAt:Date.now()});
    } catch {
      status = saved ? 'cached' : 'unavailable';
    }
  }
  return {data:data || emptyNetwork(),status:{difficulty:status,'hash-rate':status}};
}

export function demoFeed(interval) {
  const network = emptyNetwork(), bars = [];
  const quoteAnchors = [64900,63200,62980,70500,79700,78400,82000,77000,80500,86500,83900,84400,
    86400,81400,82100,80100,82700,80800,79900,76500,78800,75400,74200,72000,64300,65500,63047];
  const dailyTime = Date.UTC(2026,10,19)/1000;
  const baseStep = interval.aggregate || interval.step >= DAY ? DAY : interval.step;
  const start = Math.floor(dailyTime/baseStep)*baseStep - 2499*baseStep;
  let last = 18000;
  for (let i = 0; i < 2500; i++) {
    const t = start + i*baseStep;
    const fromEnd = 2499-i;
    const anchorPos = Math.max(0,26-fromEnd/4);
    const left = Math.floor(anchorPos), frac = anchorPos-left;
    const anchor = quoteAnchors[left] * (1-frac) + (quoteAnchors[left+1] ?? quoteAnchors[left])*frac;
    const texture = Math.sin(i*1.89)*420 + Math.cos(i*.89)*360;
    const c = fromEnd === 0 ? 63047 : fromEnd < 105 ? anchor+texture :
      19000+ Math.min(i/2360,1)*48900 + 9200*Math.sin(i/61)+5200*Math.sin(i/173);
    const o = i > 0 ? last + Math.sin(i*.91)*150 : last;
    const h = Math.max(o,c) + 270 + (Math.sin(i*2.4)+1)*390;
    const l = Math.min(o,c) - 210 - (Math.cos(i*2.1)+1)*390;
    bars.push({t,o,h,l,c,v:200+Math.abs(Math.sin(i*2.67))*2300});
    last = c;
  }
  for (let i = 0; i < 2600; i++) {
    const t = dailyTime-(2599-i)*DAY;
    network.difficulty.push({t,v:15e12 + i*49e9 + Math.floor(Math.sin(i/118)*9)*1e12});
    network['hash-rate'].push({t,v:8e7 + i*27e4 + (Math.sin(i/23)+Math.cos(i/75))*6e7});
  }
  let output = bars;
  if (interval.aggregate) output = aggregate(bars,interval.aggregate);
  else if (interval.step === 3*DAY) output = bars.slice(0,bars.length-2).filter((_,i) => i%3===0)
    .map((bar,i) => {
      const b = bars[i*3+1], c = bars[i*3+2];
      return {...bar,h:Math.max(bar.h,b.h,c.h),l:Math.min(bar.l,b.l,c.l),c:c.c,v:bar.v+b.v+c.v};
    });
  return {bars:output,network};
}
