import {calculate, DAY, groups, series} from './indicators.mjs';
import {intervals, marketFeed, miningFeed, demoFeed} from './data.mjs';
import {Chart} from './chart.mjs';
import {chooseLanguage,createLocale} from './locale.mjs';
import {guides} from './guide.mjs';
import {streamTrades, accumulateTrades, withTrades} from './trades.mjs';

const byId = id => document.getElementById(id);
const ranges = [['1D',DAY],['1W',7*DAY],['1M',30*DAY],['3M',91*DAY],['1Y',365*DAY],['all',Infinity]];
const initialSettings = {layers:{}, labels:true, projections:true, fit:false, log:false, autoScale:true, language:'system'};
const systemLocale = new URLSearchParams(location.search).get('lang') ?? navigator.language;
const marketMessage = {
  loading:'marketLoading', history:'marketHistory', partial:'marketPartial', live:'marketLive',
  cache:'marketCache', stale:'marketStale', failed:'marketFailed', demo:'marketDemo'
};
const feedMessage = {loading:'connecting', unavailable:'feedUnavailable', cached:'cachedData', ok:'dailyData'};
const state = {
  interval:intervals.find(i => i.label === '1D'),
  settings:loadSettings(),
  network:{difficulty:[],'hash-rate':[]},
  metrics:{difficulty:'loading','hash-rate':'loading'},
  market:'loading', history:[], bars:[], demo:false, request:null, activeRange:null, needsReset:true,
  tradeCandles:new Map(), lastTrade:null, snapshotStarted:0, live:false
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('overlay-settings'));
    return {...initialSettings,...saved,layers:{...saved?.layers}};
  } catch {
    return {...initialSettings,layers:{}};
  }
}

function saveSettings() {
  try { localStorage.setItem('overlay-settings',JSON.stringify(state.settings)); } catch {}
}

let locale = createLocale(chooseLanguage(state.settings.language,systemLocale));
const t = (key,...args) => locale.t(key,...args);
const chart = new Chart(byId('plot'),state.settings,selectCandle,() => setAutoScale(false),locale);

function renderGuide() {
  const guide = byId('guide');
  // Both HTML versions ship with the app and contain no external content.
  guide.innerHTML = guides[locale.language];
  guide.scrollTop = 0;
}

function applyLanguage() {
  document.documentElement.lang = locale.language;
  for (const element of document.querySelectorAll('[data-text]')) element.textContent = t(element.dataset.text);
  for (const element of document.querySelectorAll('[data-label]')) element.setAttribute('aria-label',t(element.dataset.label));
  for (const element of document.querySelectorAll('[data-title]')) element.title = t(element.dataset.title);
  for (const element of document.querySelectorAll('button[data-interval]')) {
    const label = element.dataset.interval;
    element.textContent = locale.shortInterval(label,element.parentElement.id === 'quick-intervals');
    element.setAttribute('aria-label',locale.longInterval(label));
  }
  for (const control of byId('ranges').children) {
    const label = control.dataset.range;
    control.textContent = label === 'all' ? t('all') : locale.shortInterval(label);
    control.setAttribute('aria-label',label === 'all' ? t('all') : locale.longInterval(label));
  }
  for (const [key] of groups) byId('name-'+key).textContent = t(key);
  byId('active-interval').textContent = locale.shortInterval(state.interval.label);
  chart.locale = locale;
  selectCandle(chart.bars[chart.index]);
  updateQuote();
  updateLayerValues();
  updateStatus();
  if (byId('help-dialog').open) renderGuide();
  chart.schedule();
}

function selectCandle(selected) {
  const bar = selected || state.bars.at(-1);
  ['open','high','low','close'].forEach((key,i) => {
    byId(key).textContent = bar ? locale.decimal.format(bar['ohlc'[i]]) : '—';
  });
  const selectedDate = selected && new Date(selected.t * 1000);
  byId('selected-time').textContent = selectedDate ?
    locale.date.format(selectedDate)+(state.interval.step < DAY ? ' '+locale.clock.format(selectedDate) : '') : '';
}

function updateQuote() {
  const last = state.bars.at(-1), previous = state.bars.at(-2);
  const trade = state.lastTrade;
  const useTrade = !state.demo && trade && (!last || trade.receivedAt >= state.snapshotStarted);
  const currentPrice = useTrade ? trade.price : last?.c;
  byId('price').textContent = currentPrice ? locale.quote.format(currentPrice) : '—';
  const delta = previous ? currentPrice-previous.c : NaN;
  const sign = delta>=0 ? '+' : '−';
  const change = byId('change');
  change.textContent = Number.isFinite(delta) ?
    sign+locale.decimal.format(Math.abs(delta/previous.c*100))+'% · '+locale.shortInterval(state.interval.label) : '—';
  change.className = Number.isFinite(delta) ? delta>=0 ? 'up' : 'down' : '';
}

function updatePlot({status = true, expand = false} = {}) {
  if (!state.demo) state.bars = withTrades(state.history,state.tradeCandles,state.snapshotStarted);
  const bars = calculate(state.bars,state.network,state.interval);
  chart.set(bars,state.interval,state.needsReset || !bars.length);
  if (bars.length) state.needsReset = false;
  if (expand && state.settings.autoScale && state.activeRange === Infinity && bars.length)
    chart.showRange(Infinity);
  updateQuote();
  if (status) updateStatus();
}

let stopTrades;
function onTrades(trades) {
  for (const trade of trades) {
    if (!state.lastTrade || trade.at >= state.lastTrade.at) state.lastTrade = trade;
  }
  const anchor = state.history.at(-1)?.t;
  if (anchor === undefined) updateQuote();
  else {
    accumulateTrades(state.tradeCandles,trades,state.interval,anchor);
    updatePlot({status:false});
  }
}

function setLive(value) {
  if (state.live === value) return;
  state.live = value;
  updateStatus();
}

function syncStream() {
  if (!state.demo && document.visibilityState !== 'hidden') {
    if (!stopTrades) stopTrades = streamTrades(onTrades,setLive);
  } else if (stopTrades) {
    stopTrades();
    stopTrades = null;
    setLive(false);
  }
}

function setAutoScale(enabled) {
  state.settings.autoScale = enabled;
  byId('auto-scale').setAttribute('aria-pressed',enabled);
  if (state.activeRange === Infinity && !enabled) {
    state.activeRange = null;
    rangesState();
  }
  if (enabled) chart.priceRange = null;
  saveSettings();
  chart.schedule();
}

function statusMessage() {
  if (!state.live) return t(marketMessage[state.market]);
  if (state.market === 'cache' || state.market === 'stale') return t('liveCached');
  if (state.market === 'failed') return t('liveUnavailable');
  if (state.market === 'history' || state.market === 'partial') return t('liveHistory');
  return t('liveTrades');
}

function updateStatus() {
  byId('market-state').textContent = statusMessage();
  byId('status-dot').className = 'status-dot '+(state.live ? 'live' : state.market);
  byId('mode-badge').hidden = !(state.demo || state.market === 'stale' || state.market === 'cache');
  byId('mode-badge').textContent = t(state.demo ? 'simulatedBadge' : 'cachedBadge');
  const hasBars = state.bars.length > 0;
  const failed = state.market === 'failed';
  byId('empty').hidden = hasBars;
  byId('empty-title').textContent = t(failed ? 'candleError' : 'loadingCandles');
  byId('empty-detail').textContent = failed ? t('checkConnection') : t('fetching',locale.longInterval(state.interval.label));
  byId('empty-actions').hidden = !failed;
  byId('refresh').disabled = state.demo;
  if (byId('feed-dialog').open) updateSources();
  if (byId('layers-dialog').open) updateLayerValues();
}

function updateSources() {
  const count = state.bars.length;
  let warmup = count ? t('candlesAvailable',locale.number.format(count)) : t('waitingHistory');
  if (count && count < 1430) warmup += ' '+t('warmup',locale.number.format(1400),locale.number.format(1430));
  const rows = [
    ['BTC/USD · Bitstamp',statusMessage()+'. '+warmup],
    [t('difficulty')+' · Mempool.space',t(state.demo ? 'simulatedDifficulty' : feedMessage[state.metrics.difficulty])],
    [t('miners')+' · Mempool.space',t(state.demo ? 'simulatedHashRate' : feedMessage[state.metrics['hash-rate']])]
  ];
  const list = byId('feed-list');
  list.replaceChildren();
  for (const [name,description] of rows) {
    const term = document.createElement('dt'), detail = document.createElement('dd');
    term.textContent = name; detail.textContent = description;
    list.append(term,detail);
  }
  byId('demo-toggle').textContent = t(state.demo ? 'returnToBitstamp' : 'demoChart');
}

function updateLayerValues() {
  const bar = chart.bars[chart.index ?? chart.bars.length-1];
  const readouts = {};
  for (const s of series) {
    if (s.label || s.group === 'sar') {
      const v = bar?.[s.key];
      if (Number.isFinite(v)) (readouts[s.group] ||= []).push(locale.decimal.format(v));
    }
  }
  if (Number.isFinite(bar?.heat)) readouts.heat = [locale.decimal.format(bar.heat)+'%'];
  for (const [key] of groups) {
    const value = readouts[key]?.join(' / ');
    const metricsKey = key === 'difficulty' ? 'difficulty' : key === 'miners' ? 'hash-rate' : null;
    const feed = !state.demo && metricsKey && state.metrics[metricsKey];
    const note = feed === 'unavailable' ? ' · '+t('feedUnavailable') : feed === 'cached' ? ' · '+t('cachedFeed') : '';
    byId('info-'+key).textContent = t(key+'Info')+(value ? ' · '+value : '')+note;
  }
}

function rangesState() {
  for (const button of byId('ranges').children) {
    button.disabled = Number(button.dataset.sec) < state.interval.step*6;
    button.setAttribute('aria-pressed',Number(button.dataset.sec) === state.activeRange);
  }
}

function chooseInterval(interval) {
  state.request?.abort();
  state.interval = interval;
  state.history = [];
  state.bars = [];
  state.tradeCandles.clear();
  state.snapshotStarted = 0;
  state.needsReset = true;
  state.activeRange = null;
  chart.index = null;
  byId('active-interval').textContent = locale.shortInterval(interval.label);
  const buttons = document.querySelectorAll('button[data-interval]');
  buttons.forEach(b => b.setAttribute('aria-pressed',b.dataset.interval === interval.label));
  rangesState();
  if (state.demo) showDemo();
  else {
    state.market = 'loading';
    updatePlot();
    refresh(false);
    syncStream();
  }
}

function showDemo() {
  state.request?.abort();
  state.demo = true;
  state.market = 'demo';
  state.lastTrade = null;
  syncStream();
  const mock = demoFeed(state.interval);
  state.bars = mock.bars;
  state.network = mock.network;
  updatePlot();
}

let mining;
let lastMiningAttempt = 0;
async function updateMining(force) {
  if (mining) return;
  if (!force && Date.now()-lastMiningAttempt < 6*60*60*1000) return;
  lastMiningAttempt = Date.now();
  mining = miningFeed();
  try {
    const result = await mining;
    state.liveNetwork = result.data;
    state.metrics = result.status;
    if (!state.demo) {
      state.network = state.liveNetwork;
      if (state.bars.length) updatePlot();
    }
  } finally {
    mining = null;
  }
}

async function refresh(fast, forceMining = false) {
  if (state.demo) return;
  if (fast && state.request) return;
  state.request?.abort();
  const request = new AbortController();
  state.request = request;
  const selected = state.interval;
  const started = Date.now();
  void updateMining(forceMining);
  try {
    await marketFeed(selected,request.signal,(bars,status) => {
      if (request.signal.aborted || state.demo || selected !== state.interval) return;
      const firstHistory = !state.history.length;
      if (bars.length) state.history = bars;
      state.market = status;
      if (status === 'live' || status === 'history' || status === 'partial')
        state.snapshotStarted = started;
      if (firstHistory && state.history.length && state.lastTrade) {
        accumulateTrades(state.tradeCandles,[state.lastTrade],selected,state.history.at(-1).t);
      }
      updatePlot({expand:true});
    },fast);
  } finally {
    if (state.request === request) state.request = null;
  }
}

function button(click) {
  const b = document.createElement('button');
  b.type = 'button'; b.addEventListener('click',click);
  return b;
}

for (const [label,seconds] of ranges) {
  const control = button(() => {
    state.activeRange = seconds;
    chart.showRange(seconds);
    rangesState();
  });
  control.dataset.range = label;
  control.dataset.sec = seconds;
  byId('ranges').append(control);
}
for (const interval of intervals) {
  const control = button(() => {
    byId('interval-dialog').close();
    if (state.interval !== interval) chooseInterval(interval);
  });
  control.dataset.interval = interval.label;
  byId('interval-grid').append(control);
}
document.querySelectorAll('#quick-intervals button').forEach(control => control.addEventListener('click',() => {
  const interval = intervals.find(i => i.label === control.dataset.interval);
  if (interval !== state.interval) chooseInterval(interval);
}));
for (const [key,color] of groups) {
  const label = document.createElement('label'), dot = document.createElement('span');
  const text = document.createElement('span'), name = document.createElement('b'), small = document.createElement('small');
  const toggle = document.createElement('input');
  dot.className = 'legend-color'; dot.style.background = color;
  name.id = 'name-'+key; small.id = 'info-'+key;
  text.append(name,small);
  toggle.type = 'checkbox'; toggle.checked = state.settings.layers[key] !== false;
  toggle.addEventListener('change',() => {
    state.settings.layers[key] = toggle.checked;
    saveSettings(); chart.paint();
  });
  label.append(dot,text,toggle);
  byId('layer-list').append(label);
}
for (const [id,key] of [['end-labels','labels'],['projections','projections']]) {
  const control = byId(id);
  control.checked = state.settings[key];
  control.addEventListener('change',() => {
    state.settings[key] = control.checked;
    saveSettings(); chart.paint();
  });
}
for (const id of ['fit','log']) {
  const control = byId(id);
  control.setAttribute('aria-pressed',state.settings[id]);
  control.addEventListener('click',() => {
    state.settings[id] = !state.settings[id];
    control.setAttribute('aria-pressed',state.settings[id]);
    chart.priceRange = null;
    saveSettings(); chart.paint();
  });
}
byId('auto-scale').setAttribute('aria-pressed',state.settings.autoScale);
byId('auto-scale').addEventListener('click',() => setAutoScale(!state.settings.autoScale));

for (const [control,dialog] of [['interval-menu','interval-dialog'],['layers','layers-dialog'],['feed-button','feed-dialog'],['help','help-dialog']]) {
  const modal = byId(dialog);
  byId(control).addEventListener('click',() => {
    if (dialog === 'help-dialog') renderGuide();
    modal.showModal();
    if (dialog === 'feed-dialog') updateSources();
    if (dialog === 'layers-dialog') updateLayerValues();
  });
  modal.querySelector('.dismiss').addEventListener('click',() => modal.close());
  modal.addEventListener('click',event => {
    if (event.target !== modal) return;
    const rect = modal.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
  });
}
const startDemo = () => {
  state.needsReset = true;
  state.activeRange = null; rangesState();
  showDemo();
};
const retry = () => {
  if (!state.bars.length) { state.market = 'loading'; updateStatus(); }
  refresh(false,true);
};
byId('refresh').addEventListener('click',retry);
byId('retry').addEventListener('click',retry);
byId('sample').addEventListener('click',startDemo);
byId('demo-toggle').addEventListener('click',() => {
  byId('feed-dialog').close();
  if (!state.demo) startDemo();
  else {
    state.demo = false;
    state.network = state.liveNetwork || {difficulty:[],'hash-rate':[]};
    chooseInterval(state.interval);
  }
});
byId('latest').addEventListener('click',() => chart.latest());
for (const event of ['wheel','pointerdown','keydown']) byId('plot').addEventListener(event,() => {
  if (state.activeRange !== null) { state.activeRange = null; rangesState(); }
});
const languageControl = byId('language');
languageControl.value = ['system','en','sv'].includes(state.settings.language) ? state.settings.language : 'system';
languageControl.addEventListener('change',() => {
  state.settings.language = languageControl.value;
  saveSettings();
  locale = createLocale(chooseLanguage(state.settings.language,systemLocale));
  applyLanguage();
});
applyLanguage();
chooseInterval(state.interval);
setInterval(() => {
  if (document.visibilityState === 'visible' && !state.request) refresh(state.market !== 'partial');
},30000);
document.addEventListener('visibilitychange',() => {
  syncStream();
  if (document.visibilityState === 'visible' && !state.request) refresh(state.market !== 'partial');
});
