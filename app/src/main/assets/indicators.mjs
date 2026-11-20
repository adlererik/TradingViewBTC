export const DAY = 86400;

const CAPS = [9, 14, 25, 40, 60, 90, 128, 200];
const HALVINGS = [[2012, 11, 28], [2016, 7, 9], [2020, 5, 11], [2024, 3, 11]]
  .map(([year, month, day]) => Date.UTC(year, month - 1, day) / 1000);
const GENESIS = Date.UTC(2009, 0, 3) / 1000;
const CHANNEL_START = 1279670400;

export const groups = [
  ['investor', '#68af72'],
  ['wma', '#f0f1f5'],
  ['heat', '#b03ab3'],
  ['pi', '#f5db32'],
  ['golden', '#f3cb56'],
  ['woo', '#be58d4'],
  ['sar', '#29a0ff'],
  ['guppy', '#58dc74'],
  ['channel', '#e2e5ed'],
  ['difficulty', '#e39d66'],
  ['miners', '#36accd'],
  ['halvings', '#f27b82']
];

export const series = [
  {key:'wma', group:'wma', color:'#f4f3f6', label:true},
  {key:'piFast', group:'pi', color:'#f7dc27', label:true},
  {key:'piSlow', group:'pi', color:'#009d91', label:true},
  {key:'golden', group:'golden', color:'#eec752', label:true},
  {key:'woo', group:'woo', color:'#ad46bd', label:true, width:2},
  {key:'logHigh', group:'channel', color:'#ececf3'},
  {key:'logMid', group:'channel', color:'#ececf3'},
  {key:'logLow', group:'channel', color:'#ececf3'},
  ...['#ea606b','#f48f3c','#f3d849','#64c57d','#42c8cf','#367feb','#249e9e','#ae62c3']
    .map((color, i) => ({key:'diff'+i, group:'difficulty', color, alpha:.5})),
  {key:'sar', group:'sar', color:'#279fff', width:1.5, cross:true},
  {key:'guppy', group:'guppy', color:'#30e36c', cross:true, label:true}
];

export function sma(values, period) {
  const queue = [];
  let total = 0;
  return values.map(value => {
    if (Number.isFinite(value)) {
      queue.push(value);
      total += value;
      if (queue.length > period) total -= queue.shift();
    }
    return queue.length === period ? total / period : NaN;
  });
}

function ema(values, period) {
  const alpha = 2 / (period + 1);
  let prior = NaN;
  return values.map(value => {
    prior = Number.isFinite(prior) ? alpha * value + (1 - alpha) * prior : value;
    return prior;
  });
}

// LUCID_SAR, Casey Bowman (MIT). See reference/LUCID-SAR-LICENSE.txt.
export function lucidSar(bars) {
  if (!bars.length) return [];
  const initial = .00285714, increment = .0014, maximum = .2;
  let up = true, reversal = false, extreme = bars[0].h, factor = initial;
  let sar = bars[0].l;
  return bars.map((bar, i) => {
    if (i === 0) return sar;
    const one = bars[i - 1], two = bars[i - 2] || one;
    const priorExtreme = extreme;
    extreme = up ? Math.max(bar.h, extreme) : Math.min(bar.l, extreme);
    if (reversal) factor = initial;
    else if (extreme !== priorExtreme) factor = Math.min(maximum, factor + increment);
    sar += factor * (extreme - sar);
    if (up) {
      sar = Math.min(sar, one.l, two.l);
      reversal = sar > bar.l;
      if (reversal) {
        sar = Math.max(bar.h, priorExtreme);
        extreme = Math.min(bar.l, one.l);
      }
    } else {
      sar = Math.max(sar, one.h, two.h);
      reversal = sar < bar.h;
      if (reversal) {
        sar = Math.min(bar.l, priorExtreme);
        extreme = Math.max(bar.h, one.h);
      }
    }
    if (reversal) up = !up;
    return sar;
  });
}

export function channel(t, projected = false) {
  const i = !projected && t < CHANNEL_START ? 3 : (t - CHANNEL_START) / DAY;
  if (i <= 2) return [NaN, NaN, NaN];
  const w = (Math.log10(i + 10) * i * i - i) / 30000;
  const high = Math.log(w) + 1.06930947 + .00076 * i;
  const low = Math.log(w) - 3.0269716 + .001329 * i;
  return [high, (high + low) * .5, low].map(v => Math.pow(2.718281828459, v));
}

export function crossed(a, b, previousA, previousB) {
  return a > b && previousA <= previousB;
}

function dailySeries(bars, points, timeframe, lookahead, select) {
  let point = 0;
  let value = NaN;
  return bars.map((bar, i) => {
    const end = bar.end ?? bar.t + timeframe.step;
    const last = i === bars.length - 1;
    const day = Math.floor(bar.t / DAY) * DAY;
    // Pine's daily lookahead-on uses the containing day on subdaily history,
    // and selects the first intrabar when the chart period exceeds one day.
    let cutoff = day;
    if (!lookahead || last) cutoff = end - DAY;
    if (last) cutoff = Math.min(end - 1, Math.floor(Date.now() / 1000));
    while (point < points.length && points[point].t <= cutoff) {
      value = select(points[point], point);
      point++;
    }
    return value;
  });
}

export function calculate(bars, network, timeframe) {
  if (!bars.length) return [];
  const close = bars.map(b => b.c);
  const investor = sma(close, 730), wma = sma(close, 1400);
  const ma350 = sma(close, 350), ma111 = sma(close, 111);
  const sar = lucidSar(bars);
  const emas = [30, 35, 40, 45, 50, 60].map(period => ema(close, period));
  const difficulty = dailySeries(bars, network.difficulty, timeframe, false, p => p.v / 1e9);
  const ribbon = CAPS.map(period => sma(difficulty, period));
  const hash = network['hash-rate'];
  const rates = hash.map(p => p.v);
  const dailyShort = sma(rates, 30), dailyLong = sma(rates, 60);
  const short = dailySeries(bars, hash, timeframe, true, (p, i) => dailyShort[i]);
  const long = dailySeries(bars, hash, timeframe, true, (p, i) => dailyLong[i]);
  const difference = Math.floor((bars[0].t - GENESIS) / DAY);
  let cumulative = 0;
  let previous = {};
  let lastParabolic, lastHyper;
  const calculated = bars.map((bar, i) => {
    cumulative += bar.c;
    const [logHigh, logMid, logLow] = channel(bar.t);
    const piSlow = ma350[i] * 2, piFast = ma111[i], highBand = 5 * investor[i];
    const heat = Math.abs((wma[i - 30] - wma[i]) / wma[i - 30]) * 100;
    const heatColor = heat >= 20 ? '#f44336' : heat >= 15 ? '#ff981c' :
      heat >= 10 ? '#ffdf34' : heat >= 5 ? '#55bd67' : heat > 2.5 ? '#28d9d4' : '#a731ae';
    const up = emas.slice(1).every((e, j) => emas[j][i] > e[i]);
    const down = emas.slice(1).every((e, j) => emas[j][i] < e[i]);
    const item = {
      ...bar, wma:wma[i], piSlow, piFast, heat, heatColor, logHigh, logMid, logLow,
      investor:investor[i], highBand, golden:ma350[i] * 3, woo:35 * cumulative / (difference + i + 1),
      sar:sar[i], guppy:down ? NaN : emas[5][i], guppyValue:emas[5][i],
      guppyColor:up ? '#26e35c' : '#f39827',
      halving:HALVINGS.some(t => Math.abs(bar.t - t) <= 2 * DAY),
      signals:[]
    };
    ribbon.forEach((line, j) => { item['diff'+j] = line[i]; });
    const add = (group, position, color, key, price, arrow = false) => {
      const signal = {group, position, color, key, price, arrow};
      item.signals.push(signal);
      return signal;
    };
    if (crossed(bar.c, highBand, previous.c, previous.highBand))
      add('investor', 'above', '#ec585d', 'overSold', undefined, true);
    if (crossed(item.wma, bar.l, previous.wma, previous.l))
      add('wma', 'below', '#259def', 'buy', bar.l);
    if (crossed(piFast, piSlow, previous.piFast, previous.piSlow))
      add('pi', 'above', '#f26669', 'sellPi', bar.c);
    if (piSlow > piFast && heat > 13 && heat <= 15) {
      if (lastParabolic) lastParabolic.hidden = true;
      lastParabolic = add('heat', 'above', '#f39827', 'parabolic');
    }
    if (piSlow > piFast && heat > 15 && heat <= 20) {
      if (lastHyper) lastHyper.hidden = true;
      lastHyper = add('heat', 'above', '#ef6669', 'hyperParabolic');
    }
    if (crossed(long[i], short[i], long[i-1], short[i-1]))
      add('miners', 'above', '#ef6669', 'minerCapitulation', undefined, true);
    if (crossed(short[i], long[i], short[i-1], long[i-1]))
      add('miners', 'below', '#2ba4f9', 'minerIncrease', undefined, true);
    if (crossed(logLow, bar.l, previous.logLow, previous.l))
      add('channel', 'below', '#65df61', 'buy', bar.l);
    if (crossed(bar.h, logHigh, previous.h, previous.logHigh))
      add('channel', 'above', '#ef6669', 'sellChannel', bar.h);
    previous = item;
    return item;
  });
  return calculated;
}
