import {channel, series, DAY} from './indicators.mjs';

import {createLocale} from './locale.mjs';

const defaultLocale = createLocale('en');
const mono = 'ui-monospace, Menlo, monospace';
const clamp = (value,min,max) => Math.max(min,Math.min(max,value));

function gestureAxis(x,y) {
  const width = Math.abs(x), height = Math.abs(y);
  if (width > 2*height) return 'x';
  if (height > 2*width) return 'y';
  return 'both';
}

export class Chart {
  constructor(canvas, settings, select, lockScale = () => {}, locale = defaultLocale) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.settings = settings;
    this.locale = locale;
    this.select = select;
    this.lockScale = lockScale;
    this.priceRange = null;
    this.bars = [];
    this.interval = {label:'1D',step:DAY};
    this.right = 0;
    this.count = 100;
    this.index = null;
    this.points = new Map();
    this.down = null;
    this.resize = new ResizeObserver(() => this.paint());
    this.resize.observe(canvas);
    this.bind();
  }

  bounds(right) {
    const last = this.bars.length - 1;
    const projectionSpace = this.settings.projections && this.interval.step >= 3600 ? 1300 : 0;
    return clamp(right,0,last+Math.max(this.count*.92,projectionSpace));
  }

  set(bars, interval, reset) {
    const oldIndex = Math.round(this.right);
    const oldTime = this.bars[oldIndex]?.t;
    const fractional = this.right - oldIndex;
    const oldSelection = this.bars[this.index]?.t;
    const oldLast = this.bars.length - 1;
    const followLatest = oldLast >= 0 && this.right >= oldLast;
    this.bars = bars;
    this.interval = interval;
    if (reset) {
      this.count = this.canvas.clientWidth >= 680 ? 118 : 92;
      this.priceRange = null;
    }
    const latest = bars.length - 1;
    const shifted = oldTime !== undefined ? bars.findIndex(bar => bar.t === oldTime) : -1;
    if (reset || followLatest || shifted < 0) {
      const future = !reset && followLatest ? this.right-oldLast : 0;
      this.right = Math.max(0,latest + future);
    } else {
      this.right = shifted + fractional;
    }
    const selected = oldSelection === undefined ? -1 : bars.findIndex(b => b.t === oldSelection);
    this.index = !reset && selected >= 0 ? selected : null;
    this.select(this.index === null ? null : bars[this.index]);
    this.paint();
  }

  showRange(seconds) {
    if (!this.bars.length) return;
    const count = Math.ceil(seconds / this.interval.step);
    this.count = clamp(count,6,Math.max(12,this.bars.length));
    this.latest();
  }

  latest(resetSelection = true) {
    if (!this.bars.length) return;
    this.right = this.bars.length-1;
    if (resetSelection) {
      this.index = null;
      this.select(null);
    }
    this.paint();
  }

  schedule() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      this.paint();
    });
  }

  zoom(factor, anchorX) {
    if (!this.geometry || !this.bars.length) return;
    const {left, lastX} = this.geometry;
    const axisWidth = lastX-left;
    const distance = clamp(anchorX,left,lastX) - lastX;
    const anchorIndex = this.right + distance*(this.count-1)/axisWidth;
    this.count = clamp(this.count*factor,6,Math.max(12,this.bars.length));
    this.right = this.bounds(anchorIndex - distance*(this.count-1)/axisWidth);
    this.schedule();
  }

  panTime(pixels) {
    const {left, lastX} = this.geometry;
    this.right = this.bounds(this.right - pixels*(this.count-1)/(lastX-left));
    this.schedule();
  }

  adjustPrice(factor, anchor, pixels = 0) {
    const range = this.priceRange ?? this.drawnPriceRange;
    if (!range) return;
    const {top,bottom} = this.geometry;
    const span = range.high-range.low;
    const fraction = clamp((anchor-top)/(bottom-top),0,1);
    const pivot = range.high-fraction*span;
    const minSpan = this.settings.log ? .002 : Math.max(pivot*.0002,.01);
    const min = this.settings.log ? Math.log(.000001) : 0;
    const max = this.settings.log ? Math.log(1e12) : 1e12;
    const width = clamp(span*factor,minSpan,max-min);
    const low = clamp(pivot-(1-fraction)*width+pixels*width/(bottom-top),min,max-width);
    this.priceRange = {low,high:low+width};
    if (this.settings.autoScale !== false) this.lockScale();
    this.schedule();
  }

  bind() {
    const canvas = this.canvas;
    const position = e => {
      const box = canvas.getBoundingClientRect();
      return {x:e.clientX-box.left,y:e.clientY-box.top};
    };
    const pinchState = () => {
      const [a,b] = this.points.values();
      return {width:Math.abs(a.x-b.x),height:Math.abs(a.y-b.y),
        x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    };
    canvas.addEventListener('pointerdown',e => {
      if (e.button !== 0 || this.points.size > 1) return;
      const point = position(e);
      canvas.setPointerCapture(e.pointerId);
      this.points.set(e.pointerId,point);
      if (this.points.size === 1) {
        this.down = {...point,moved:false,axis:null};
      } else {
        this.down.moved = true;
        this.pinch = pinchState();
        this.pinch.axis = gestureAxis(this.pinch.width,this.pinch.height);
      }
    });
    canvas.addEventListener('pointermove',e => {
      if (!this.points.has(e.pointerId) || !this.geometry || !this.bars.length) return;
      const point = position(e);
      let previous = this.points.get(e.pointerId);
      this.points.set(e.pointerId,point);
      if (this.points.size === 2) {
        const next = pinchState(), old = this.pinch;
        const ratio = (a,b) => clamp(Math.max(12,a)/Math.max(12,b),.8,1.25);
        if (old.axis !== 'y') {
          this.zoom(ratio(old.width,next.width),old.x);
          this.panTime(next.x-old.x);
        }
        if (old.axis !== 'x' && (next.height !== old.height || next.y !== old.y)) {
          this.adjustPrice(ratio(old.height,next.height),old.y,next.y-old.y);
        }
        this.pinch = {...next,axis:old.axis};
      } else {
        if (!this.down.moved) {
          const dx = point.x-this.down.x, dy = point.y-this.down.y;
          if (Math.hypot(dx,dy) <= 5) return;
          this.down.moved = true;
          this.down.axis = gestureAxis(dx,dy);
          previous = this.down;
        }
        if (this.down.axis !== 'y') this.panTime(point.x-previous.x);
        if (this.down.axis !== 'x' && point.y !== previous.y) {
          this.adjustPrice(1,previous.y,point.y-previous.y);
        }
      }
    });
    const release = e => {
      if (!this.points.has(e.pointerId)) return;
      if (e.type === 'pointerup' && this.points.size === 1 && !this.down.moved) {
        const point = position(e);
        const g = this.geometry;
        if (g && point.x >= g.left && point.x <= g.plotRight && this.bars.length) {
          const i = Math.round(this.right+(point.x-g.lastX)/g.step);
          this.index = i >= 0 && i < this.bars.length && this.index !== i ? i : null;
          this.select(this.index === null ? null : this.bars[this.index]);
          this.schedule();
        }
      }
      this.points.delete(e.pointerId);
      if (!this.points.size) this.down = null;
      else this.down = {...this.points.values().next().value,moved:true,axis:'both'};
    };
    ['pointerup','pointercancel','lostpointercapture'].forEach(event => canvas.addEventListener(event,release));
    canvas.addEventListener('wheel',e => {
      if (!this.geometry || !this.bars.length) return;
      e.preventDefault();
      const point = position(e);
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        this.right = this.bounds(this.right+(e.deltaX || e.deltaY)/this.geometry.step);
        this.schedule();
      } else this.zoom(e.deltaY > 0 ? 1.14 : .88,point.x);
    },{passive:false});
    canvas.addEventListener('keydown',e => {
      if (!this.geometry || !this.bars.length) return;
      if (e.key === '+' || e.key === '=' || e.key === '-') {
        this.zoom(e.key === '-' ? 1.2 : .83,this.geometry.lastX);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const delta = Math.max(1,this.count/12);
        this.right = this.bounds(this.right+(e.key === 'ArrowLeft' ? -delta : delta));
        this.schedule();
      } else if (e.key === 'End') this.latest();
      else if (e.key === 'Escape') {
        this.index = null; this.select(null); this.schedule();
      } else return;
      e.preventDefault();
    });
  }

  paint() {
    const {canvas,context:ctx,bars,settings,interval} = this;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w < 80 || h < 60) return;
    const dpr = Math.min(3,window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(w*dpr) || canvas.height !== Math.round(h*dpr)) {
      canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
    }
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);
    const axis = w < 520 ? 53 : 66;
    const left = 4, plotRight = w-axis, top = 8, bottom = h-28;
    const gutter = Math.min(w < 520 ? 57 : 111,(plotRight-left)*.19);
    const lastX = plotRight-gutter;
    const step = (lastX-left)/Math.max(1,this.count-1);
    const x = i => lastX+(i-this.right)*step;
    this.geometry = {left,lastX,step,plotRight,top,bottom};
    const first = Math.max(0,Math.floor(this.right - this.count));
    const last = Math.min(bars.length-1,Math.ceil(this.right+(plotRight-lastX)/step));
    const enabled = group => settings.layers[group] !== false;
    const transform = settings.log ? Math.log : n => n;
    const inverse = settings.log ? Math.exp : n => n;
    let range = settings.autoScale === false ? this.priceRange : null;
    if (!range) {
      let lo = Infinity, hi = -Infinity;
      const include = value => {
        if (Number.isFinite(value) && value > 0) {
          lo = Math.min(lo,value); hi = Math.max(hi,value);
        }
      };
      for (let i = first; i <= last; i++) {
        const bar = bars[i];
        include(bar.l); include(bar.h);
        if (settings.fit) {
          for (const s of series) if (enabled(s.group)) include(bar[s.key]);
          if (enabled('heat')) include(bar.heat);
          if (enabled('investor') && bar.o <= bar.investor) include(bar.investor);
          if (enabled('investor') && bar.o >= bar.highBand) include(bar.highBand);
        }
      }
      if (lo === Infinity) {
        const lastBar = bars.at(-1);
        lo = lastBar ? lastBar.l*.88 : 55000;
        hi = lastBar ? lastBar.h*1.16 : 90000;
      }
      const base = transform(lo);
      const span = Math.max(transform(hi)-base,settings.log ? .008 : Math.max(hi*.007,1));
      range = {low:base-span*.105,high:base+span*1.115};
      if (!settings.log) range.low = Math.max(0,range.low);
      if (bars.length && settings.autoScale === false) this.priceRange = range;
    }
    this.drawnPriceRange = bars.length ? range : null;
    const lo = Math.max(.000001,inverse(range.low)), hi = inverse(range.high);
    const y = value => clamp(bottom-(transform(value)-range.low)/(range.high-range.low)*(bottom-top),-h*5,h*6);

    ctx.fillStyle = '#161c27';
    ctx.fillRect(plotRight,0,axis,h);
    ctx.lineWidth = 1;
    ctx.font = '10px '+mono;
    ctx.textBaseline = 'middle';
    this.scales(ctx,{lo,hi,y,top,bottom,plotRight,w,h,x,first,last,step,interval,bars});
    ctx.save();
    ctx.beginPath(); ctx.rect(0,0,plotRight,bottom); ctx.clip();
    if (enabled('halvings')) {
      ctx.fillStyle = '#ef52656e';
      for (let i = first;i <= last;i++) if (bars[i].halving) ctx.fillRect(x(i)-step/2,0,step,bottom);
    }
    if (enabled('investor')) this.bands(ctx,first,last,x,y,step);
    for (const s of series) {
      if (enabled(s.group) && !s.cross) this.line(ctx,s,first,last,x,y);
    }
    if (enabled('heat') && settings.fit)
      this.line(ctx,{key:'heat',color:'#a731ae',width:2,colorKey:'heatColor'},first,last,x,y);
    if (enabled('channel') && settings.projections)
      this.projection(ctx,x,y,step,w,plotRight);
    this.candles(ctx,first,last,x,y,step,enabled);
    for (const s of series) {
      if (enabled(s.group) && s.cross) this.crosses(ctx,s,first,last,x,y,step);
    }
    this.signals(ctx,first,last,x,y,enabled);
    if (settings.labels) this.labels(ctx,x,y,enabled,top,bottom,plotRight);
    const lastBar = bars.at(-1);
    if (lastBar && y(lastBar.c)>top && y(lastBar.c)<bottom) {
      ctx.strokeStyle = lastBar.c >= lastBar.o ? '#43baae90' : '#f16c7290';
      ctx.setLineDash([2,3]);
      ctx.beginPath(); ctx.moveTo(0,y(lastBar.c)); ctx.lineTo(plotRight,y(lastBar.c)); ctx.stroke();
      ctx.setLineDash([]);
    }
    const selected = this.index === null ? null : bars[this.index];
    if (selected && x(this.index) >= left && x(this.index) <= plotRight) {
      ctx.strokeStyle = '#bac5d5a0';
      ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.moveTo(x(this.index),0); ctx.lineTo(x(this.index),bottom);
      ctx.moveTo(0,y(selected.c)); ctx.lineTo(plotRight,y(selected.c)); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
    if (lastBar && y(lastBar.c)>top && y(lastBar.c)<bottom) {
      const y0 = y(lastBar.c);
      ctx.fillStyle = lastBar.c >= lastBar.o ? '#2da89a' : '#e26a70';
      ctx.fillRect(plotRight,y0-10,axis,20);
      ctx.fillStyle = '#08171a'; ctx.textAlign = 'left';
      ctx.fillText(this.locale.price.format(lastBar.c),plotRight+4,y0,axis-6);
    }
  }

  scales(ctx,g) {
    const {number,price,month,date,clock} = this.locale;
    const {lo,hi,y,top,bottom,plotRight,w,h,x,first,last,step,interval,bars} = g;
    const target = Math.max(3,Math.min(11,Math.round(h/51)));
    const increment = Math.max((hi-lo)/target,hi*.001);
    const unit = 10 ** Math.floor(Math.log10(increment));
    const jump = ([1,2,2.5,5,10].find(v => v>=increment/unit) || 10)*unit;
    let ticks = [];
    if (this.settings.log && hi/lo > 5) {
      for (let e = Math.floor(Math.log10(lo))-1;e <= Math.ceil(Math.log10(hi))+1;e++) {
        ticks.push(...[1,2,5].map(v => v*10**e));
      }
    } else {
      const start = Math.max(jump,Math.floor((lo-(hi-lo)*.22)/jump)*jump);
      for (let p = start; p <= hi+(hi-lo)*.25+jump; p += jump) ticks.push(p);
    }
    ctx.strokeStyle = '#2a3342';
    ctx.lineWidth = 1;
    let priorY = Infinity;
    for (const value of ticks) {
      const py = y(value);
      if (py < top || py > bottom-5 || priorY-py < 20) continue;
      priorY = py;
      ctx.beginPath(); ctx.moveTo(0,Math.floor(py)+.5); ctx.lineTo(plotRight,Math.floor(py)+.5); ctx.stroke();
      ctx.fillStyle = '#a6b0c0';
      ctx.textAlign = 'left';
      ctx.fillText(value < 10 ? price.format(value) : number.format(value),plotRight+5,py,w-plotRight-7);
    }
    const stride = Math.max(1,Math.ceil((w < 520 ? 71 : 116)/step));
    const end = Math.max(last,Math.ceil(this.right+(plotRight-this.geometry.lastX)/step));
    const lastBar = bars.at(-1);
    ctx.textAlign = 'center';
    for (let i = Math.ceil(first/stride)*stride; i <= end; i+=stride) {
      const px = x(i);
      if (px < 19 || px > plotRight-21) continue;
      ctx.beginPath(); ctx.moveTo(Math.floor(px)+.5,0); ctx.lineTo(Math.floor(px)+.5,bottom); ctx.stroke();
      const sec = bars[i]?.t ?? (lastBar && lastBar.t + (i-bars.length+1)*interval.step);
      if (!sec) continue;
      const d = new Date(sec*1000);
      const label = interval.step < DAY ? (d.getUTCHours() === 0 ? date.format(d) : clock.format(d)) :
        interval.aggregate === 'month' || this.count*interval.step > DAY*720 ?
          month.format(d)+' '+String(d.getUTCFullYear()).slice(-2) : date.format(d);
      ctx.fillStyle = '#a6b0c0';
      ctx.fillText(label,px,bottom+14);
    }
    ctx.strokeStyle = '#333d4b';
    ctx.beginPath(); ctx.moveTo(0,bottom+.5); ctx.lineTo(w,bottom+.5);
    ctx.moveTo(plotRight+.5,0); ctx.lineTo(plotRight+.5,h); ctx.stroke();
  }

  bands(ctx,first,last,x,y,step) {
    for (const [key,color,valid] of [
      ['investor','#58a66d49',b => b.o <= b.investor],
      ['highBand','#ed535a47',b => b.o >= b.highBand]
    ]) {
      ctx.fillStyle = color;
      let run = [];
      const fill = () => {
        if (!run.length) return;
        const [a,b] = [run[0],run.at(-1)];
        ctx.beginPath(); ctx.moveTo(x(a)-step/2,y(this.bars[a].c));
        for (const i of run) ctx.lineTo(x(i),y(this.bars[i].c));
        ctx.lineTo(x(b)+step/2,y(this.bars[b].c));
        ctx.lineTo(x(b)+step/2,y(this.bars[b][key]));
        for (let j=run.length-1;j>=0;j--) ctx.lineTo(x(run[j]),y(this.bars[run[j]][key]));
        ctx.lineTo(x(a)-step/2,y(this.bars[a][key]));
        ctx.closePath(); ctx.fill();
        run = [];
      };
      for(let i=first;i<=last;i++) {
        if (valid(this.bars[i])) run.push(i);
        else fill();
      }
      fill();
    }
  }

  line(ctx,s,first,last,x,y) {
    ctx.lineWidth = s.width ?? 1;
    ctx.globalAlpha = s.alpha ?? 1;
    let previous;
    for (let i=first;i<=last;i++) {
      const bar = this.bars[i], v = bar[s.key];
      if (!Number.isFinite(v) || v <= 0) { previous = undefined; continue; }
      if (previous !== undefined) {
        ctx.strokeStyle = bar[s.colorKey] ?? s.color;
        ctx.beginPath(); ctx.moveTo(x(previous),y(this.bars[previous][s.key]));
        ctx.lineTo(x(i),y(v)); ctx.stroke();
      }
      previous = i;
    }
    ctx.globalAlpha = 1;
  }

  crosses(ctx,s,first,last,x,y,step) {
    const r = Math.max(.8,Math.min(2.5,step*.32));
    ctx.lineWidth = step < 2 ? 1 : s.width ?? 1;
    for (let i=first;i<=last;i++) {
      const b = this.bars[i], v = b[s.key];
      if (!Number.isFinite(v) || v <= 0) continue;
      const px = x(i), py = y(v);
      ctx.strokeStyle = s.key === 'guppy' ? b.guppyColor : s.color;
      ctx.beginPath(); ctx.moveTo(px-r,py); ctx.lineTo(px+r,py);
      ctx.moveTo(px,py-r); ctx.lineTo(px,py+r); ctx.stroke();
    }
  }

  projection(ctx,x,y,step,w,plotRight) {
    const bars = this.bars, interval = this.interval, n = bars.length-1;
    if (n < 1 || x(n) > plotRight || interval.step < 3600) return;
    const minutes = interval.step / 60;
    const stride = interval.aggregate === 'month' ? 12 : interval.aggregate === 'week' ? 26 :
      interval.step >= DAY ? Math.ceil(91*DAY/interval.step) : Math.ceil(10080/minutes);
    const delta = bars[n].t-bars[n-1].t;
    const t = bars[n].t;
    ctx.strokeStyle = '#dce2f39a'; ctx.lineWidth = 1;
    for (let curve=0;curve<3;curve++) {
      ctx.beginPath();
      const leftJump = Math.max(0,Math.floor(-x(n)/(step*stride)));
      for (let j=leftJump;j<=13;j++) {
        const px = x(n+j*stride), py = y(channel(t+j*stride*delta,true)[curve]);
        if (j===leftJump) ctx.moveTo(px,py);
        else ctx.lineTo(px,py);
        if (px>w) break;
      }
      ctx.stroke();
    }
  }

  candles(ctx,first,last,x,y,step,enabled) {
    const width = Math.max(1,Math.min(24,Math.floor(step*.73)));
    for(let i=first;i<=last;i++) {
      const b = this.bars[i], px = x(i);
      const color = b.c>=b.o ? '#29a999' : '#eb6268';
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = .9;
      ctx.beginPath(); ctx.moveTo(px,y(b.h)); ctx.lineTo(px,y(b.l)); ctx.stroke();
      ctx.fillRect(px-width/2,Math.min(y(b.o),y(b.c)),width,Math.max(1,Math.abs(y(b.o)-y(b.c))));
      if (enabled('heat') && step >= 2 && Number.isFinite(b.heat) && b.heat !== 0) {
        ctx.fillStyle = b.heatColor;
        ctx.beginPath(); ctx.arc(px,y(b.h)-8,Math.min(3.3,step*.34),0,Math.PI*2); ctx.fill();
      }
    }
  }

  labels(ctx,x,y,enabled,top,bottom,plotRight) {
    const idx = this.bars.length-1;
    const bar = this.bars[idx];
    if (!bar || x(idx) < 0 || x(idx) > plotRight) return;
    const marks = series.filter(s => s.label && enabled(s.group)).map(s => ({
      ...s, label:this.locale.t(s.key+'Label'), py:y(s.key === 'guppy' ? bar.guppyValue : bar[s.key])
    })).filter(m => m.py > top && m.py < bottom-5).sort((a,b) => a.py-b.py);
    ctx.font = '600 9px system-ui,sans-serif';
    ctx.textAlign = 'left';
    let prev = -Infinity;
    for (const mark of marks) {
      const px = Math.min(x(idx+8),plotRight-38);
      const py = Math.max(mark.py,prev+12);
      if (py>bottom-4) continue;
      ctx.fillStyle = '#151a24e5';
      ctx.fillRect(px-2,py-6,Math.min(ctx.measureText(mark.label).width+4,plotRight-px),12);
      ctx.fillStyle = mark.color;
      ctx.fillText(mark.label,px,py,Math.max(30,plotRight-px-2));
      prev = py;
    }
  }

  signals(ctx,first,last,x,y,enabled) {
    const {t,price} = this.locale;
    ctx.font = '600 9px system-ui,sans-serif';
    ctx.textAlign = 'center';
    for (let i=first;i<=last;i++) {
      const b = this.bars[i];
      let above = 0, below = 0;
      for (const s of b.signals) {
        if (!enabled(s.group) || s.hidden) continue;
        const px = x(i);
        const upper = s.position === 'above';
        const direction = upper ? -1 : 1;
        const py = upper ? y(b.h)-15-above*25 : y(b.l)+12+below*25;
        if (upper) above++; else below++;
        ctx.fillStyle = s.color;
        ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px-3.5,py+direction*5);
        ctx.lineTo(px+3.5,py+direction*5); ctx.closePath(); ctx.fill();
        if (this.count > 220) continue;
        const title = t(s.key);
        const detail = Number.isFinite(s.price) ? title+' '+price.format(s.price) : title;
        const rows = detail.split('\n');
        const width = Math.max(...rows.map(row => ctx.measureText(row).width))+8;
        const tx = clamp(px,width/2+2,this.geometry.plotRight-width/2-2);
        const y0 = upper ? py-rows.length*12-6 : py+4;
        if (!s.arrow) ctx.fillRect(tx-width/2,y0,width,rows.length*12+2);
        ctx.fillStyle = s.arrow ? s.color : '#101824';
        rows.forEach((row,j) => ctx.fillText(row,tx,y0+7+j*12));
      }
    }
  }
}
