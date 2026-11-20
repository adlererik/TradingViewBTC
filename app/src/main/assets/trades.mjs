import {periodAt} from './data.mjs';

const CHANNEL = 'live_trades_btcusd';
const URL = 'wss://ws.bitstamp.net';
const SILENCE_LIMIT = 45_000;

export function streamTrades(onTrades, onLive) {
  let socket = null;
  let touched = 0, retryAt = 0, failures = 0;
  let batch = [];

  function reconnect() {
    const previous = socket;
    socket = null;
    if (previous) previous.close();
    retryAt = Date.now() + Math.min(30_000, 1000 * 2 ** Math.min(failures++, 5));
    onLive(false);
  }

  function connect() {
    let connection;
    try {
      connection = new WebSocket(URL);
    } catch {
      reconnect();
      return;
    }
    socket = connection;
    touched = Date.now();
    connection.onopen = () => {
      if (socket !== connection) return;
      touched = Date.now();
      connection.send(JSON.stringify({event:'bts:subscribe', data:{channel:CHANNEL}}));
    };
    connection.onmessage = ({data}) => {
      if (socket !== connection) return;
      let message;
      try { message = JSON.parse(data); } catch { return; }
      if (!message || typeof message !== 'object') return;
      if (message.event === 'bts:request_reconnect' || message.event === 'bts:error') {
        reconnect();
        return;
      }
      if (message.event !== 'trade' || message.channel !== CHANNEL) return;
      const price = Number(message.data?.price), seconds = Number(message.data?.timestamp);
      const micros = Number(message.data?.microtimestamp);
      const at = Number.isSafeInteger(micros) && micros > 0 ? micros : Math.round(seconds*1e6);
      if (!(Number.isFinite(price) && price > 0 && Number.isSafeInteger(at) && at > 0)) return;
      touched = Date.now();
      failures = 0;
      batch.push({price,at,receivedAt:touched});
    };
    connection.onerror = connection.onclose = () => {
      if (socket === connection) reconnect();
    };
  }

  const timer = setInterval(() => {
    if (batch.length) {
      const updates = batch;
      batch = [];
      onTrades(updates);
      if (socket) onLive(true);
    }
    if (socket && Date.now()-touched >= SILENCE_LIMIT) reconnect();
    if (!socket && Date.now() >= retryAt) connect();
  },1000);

  connect();
  return () => {
    clearInterval(timer);
    const previous = socket;
    socket = null;
    if (previous) previous.close();
  };
}

export function accumulateTrades(candles, trades, interval, anchor) {
  for (const trade of trades) {
    const {t,end} = periodAt(trade.at/1e6,interval,anchor);
    const candle = candles.get(t);
    if (!candle) {
      candles.set(t,{t,end,o:trade.price,h:trade.price,l:trade.price,c:trade.price,
        first:trade.at,last:trade.at,receivedAt:trade.receivedAt,v:0});
      continue;
    }
    candle.h = Math.max(candle.h,trade.price);
    candle.l = Math.min(candle.l,trade.price);
    if (trade.at < candle.first) {
      candle.first = trade.at;
      candle.o = trade.price;
    }
    if (trade.at >= candle.last) {
      candle.last = trade.at;
      candle.receivedAt = trade.receivedAt;
      candle.c = trade.price;
    }
  }
  while (candles.size > 8) candles.delete(Math.min(...candles.keys()));
}

export function withTrades(history, candles, snapshotStarted) {
  if (!history.length || !candles.size) return history;
  const tail = history.at(-1);
  const updates = Array.from(candles.values()).filter(bar => bar.t >= tail.t).sort((a,b) => a.t-b.t);
  if (!updates.length) return history;
  const bars = history.slice();
  for (const candle of updates) {
    if (candle.t === tail.t) {
      bars[bars.length-1] = {
        ...tail,h:Math.max(tail.h,candle.h),l:Math.min(tail.l,candle.l),
        c:candle.receivedAt >= snapshotStarted ? candle.c : tail.c
      };
    } else {
      bars.push({...candle});
    }
  }
  return bars;
}
