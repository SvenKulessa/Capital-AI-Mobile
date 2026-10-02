import { ema, mean } from "./math";
import type { Bar, Marker } from "./types";

export type ClusterId = "trend" | "momentum" | "volatilitaet" | "volumen" | "struktur";

export type IndicatorReading = {
  id: string;
  name: string;
  cluster: ClusterId;
  value: number | null;
  digits: number;
};

export type FlagReading = {
  id: string;
  name: string;
  cluster: ClusterId;
  long: boolean;
  short: boolean;
};

export type ClusterReport = {
  id: ClusterId;
  label: string;
  ms: number;
  long: number;
  short: number;
  vote: number;
};

export type Analysis = {
  indicators: IndicatorReading[];
  flags: FlagReading[];
  clusters: ClusterReport[];
  score: number;
  marks: Marker[];
};

const CLUSTERS: { id: ClusterId; label: string }[] = [
  { id: "trend", label: "Trend" },
  { id: "momentum", label: "Momentum" },
  { id: "volatilitaet", label: "Volatilität" },
  { id: "volumen", label: "Volumen" },
  { id: "struktur", label: "Struktur" },
];

type Tape = {
  last: number;
  prev: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  sma20: number;
  sma50: number;
  sma200: number;
  sma20p: number;
  sma50p: number;
  ema12: number;
  ema26: number;
  ema50: number;
  ema12p: number;
  ema26p: number;
  wma20: number;
  dema20: number;
  tema20: number;
  hma20: number;
  vwma20: number;
  rsi: number;
  rsip: number;
  stochK: number;
  stochD: number;
  stochKp: number;
  stochRsi: number;
  macd: number;
  macdSig: number;
  macdHist: number;
  macdP: number;
  sigP: number;
  ppo: number;
  roc: number;
  mom: number;
  cci: number;
  willr: number;
  mfi: number;
  obvDelta: number;
  cmf: number;
  atr: number;
  natr: number;
  percentB: number;
  bbWidth: number;
  bbPos: number;
  keltnerPos: number;
  donchianPos: number;
  adx: number;
  plusDI: number;
  minusDI: number;
  aroonUp: number;
  aroonDown: number;
  psarDist: number;
  psarBelow: boolean;
  superUp: boolean;
  vwapDist: number;
  tenkan: number;
  kijun: number;
  cloudDist: number;
  aboveCloud: boolean;
  trix: number;
  trixUp: boolean;
  uo: number;
  cmo: number;
  force: number;
  ao: number;
  tsi: number;
  ulcer: number;
  engulfBull: boolean;
  engulfBear: boolean;
  hammer: boolean;
  star: boolean;
  insideBreakUp: boolean;
  insideBreakDown: boolean;
  nr7Up: boolean;
  nr7Down: boolean;
  volUp: boolean;
  volDown: boolean;
  gapUp: boolean;
  gapDown: boolean;
  threeUp: boolean;
  threeDown: boolean;
  stackBull: boolean;
  stackBear: boolean;
  breakHigh: boolean;
  breakLow: boolean;
  hhhl: boolean;
  lhll: boolean;
  sweepUp: boolean;
  sweepDown: boolean;
  fvgUp: boolean;
  fvgDown: boolean;
  bosUp: boolean;
  bosDown: boolean;
  chochUp: boolean;
  chochDown: boolean;
  atrExpandUp: boolean;
  atrExpandDown: boolean;
  candleBull: boolean;
  candleBear: boolean;
};

function finite(n: number): number | null {
  return Number.isFinite(n) ? n : null;
}

function smaAt(values: number[], period: number, end: number) {
  if (end < period - 1 || end >= values.length) return Number.NaN;
  let s = 0;
  for (let i = end - period + 1; i <= end; i++) s += values[i];
  return s / period;
}

function wmaAt(values: number[], period: number, end: number) {
  if (end < period - 1) return Number.NaN;
  let acc = 0;
  let w = 0;
  for (let i = 0; i < period; i++) {
    const weight = i + 1;
    acc += values[end - period + 1 + i] * weight;
    w += weight;
  }
  return acc / w;
}

function rollHigh(bars: Bar[], end: number, period: number) {
  let h = -Infinity;
  for (let i = end - period + 1; i <= end; i++) h = Math.max(h, bars[i].high);
  return h;
}

function rollLow(bars: Bar[], end: number, period: number) {
  let l = Infinity;
  for (let i = end - period + 1; i <= end; i++) l = Math.min(l, bars[i].low);
  return l;
}

function trueRange(bars: Bar[], i: number) {
  const prev = bars[i - 1].close;
  return Math.max(bars[i].high - bars[i].low, Math.abs(bars[i].high - prev), Math.abs(bars[i].low - prev));
}

function wilderSeries(values: number[], period: number) {
  const out = new Array<number>(values.length).fill(Number.NaN);
  if (values.length < period) return out;
  let s = 0;
  for (let i = 0; i < period; i++) s += values[i];
  out[period - 1] = s;
  for (let i = period; i < values.length; i++) {
    s = s - s / period + values[i];
    out[i] = s;
  }
  return out;
}

function lastFiniteAt(values: number[], index: number) {
  const v = values[index];
  return Number.isFinite(v) ? v : Number.NaN;
}

function buildTape(bars: Bar[]): Tape | null {
  const n = bars.length;
  if (n < 60) return null;
  const i = n - 1;
  const closes = bars.map((b) => b.close);
  const highs = bars.map((b) => b.high);
  const lows = bars.map((b) => b.low);
  const last = closes[i];
  const prev = closes[i - 1];
  const ema12s = ema(closes, 12);
  const ema26s = ema(closes, 26);
  const ema50s = ema(closes, 50);
  const ema20s = ema(closes, 20);
  const macdLine = ema12s.map((v, idx) => (Number.isFinite(v) && Number.isFinite(ema26s[idx]) ? v - ema26s[idx] : Number.NaN));
  const macdClean = macdLine.map((v) => (Number.isFinite(v) ? v : 0));
  const firstMacd = macdLine.findIndex((v) => Number.isFinite(v));
  const signalFull = ema(macdClean, 9);
  const rsiS = rsiSeries(closes, 14);
  const atrS = atrSeries(bars, 14);
  const adxPack = adxPackAt(bars, 14);
  const stochNow = stochastic(bars, i, 14);
  const stochPrev = stochastic(bars, i - 1, 14);
  const stochD = mean([stochastic(bars, i, 14).k, stochastic(bars, i - 1, 14).k, stochastic(bars, i - 2, 14).k].filter((v) => Number.isFinite(v)));
  const bb = bollinger(closes, i, 20, 2);
  const kelt = keltner(bars, atrS, i, 20, 2);
  const donH = rollHigh(bars, i - 1, 20);
  const donL = rollLow(bars, i - 1, 20);
  const tenkan = (rollHigh(bars, i, 9) + rollLow(bars, i, 9)) / 2;
  const kijun = (rollHigh(bars, i, 26) + rollLow(bars, i, 26)) / 2;
  const spanA = (tenkan + kijun) / 2;
  const spanB = (rollHigh(bars, i, 52) + rollLow(bars, i, 52)) / 2;
  const cloudTop = Math.max(spanA, spanB);
  const cloudBot = Math.min(spanA, spanB);
  const psar = psarState(bars);
  const superUp = supertrendUp(bars, atrS);
  const vwap = sessionVwap(bars, 60);
  const obv = obvDelta(bars, 5);
  const ranges = bars.slice(-8).map((b) => b.high - b.low);
  const nr7 = ranges[7] < Math.min(...ranges.slice(0, 7));
  const priorHigh = rollHigh(bars, i - 1, 20);
  const priorLow = rollLow(bars, i - 1, 20);
  const body = Math.abs(bars[i].close - bars[i].open);
  const upperWick = bars[i].high - Math.max(bars[i].open, bars[i].close);
  const lowerWick = Math.min(bars[i].open, bars[i].close) - bars[i].low;
  const avgVol = mean(bars.slice(-21, -1).map((b) => b.volume));
  const temaNow = temaAt(closes, 15, i);
  const temaPrev = temaAt(closes, 15, i - 1);
  const hma = hmaAt(closes, 20, i);
  const dema = demaAt(ema20s, closes, i);
  const trix = Number.isFinite(temaNow) && Number.isFinite(temaPrev) && temaPrev !== 0 ? ((temaNow - temaPrev) / Math.abs(temaPrev)) * 100 : Number.NaN;

  return {
    last,
    prev,
    open: bars[i].open,
    high: bars[i].high,
    low: bars[i].low,
    volume: bars[i].volume,
    sma20: smaAt(closes, 20, i),
    sma50: smaAt(closes, 50, i),
    sma200: smaAt(closes, 200, i),
    sma20p: smaAt(closes, 20, i - 1),
    sma50p: smaAt(closes, 50, i - 1),
    ema12: lastFiniteAt(ema12s, i),
    ema26: lastFiniteAt(ema26s, i),
    ema50: lastFiniteAt(ema50s, i),
    ema12p: lastFiniteAt(ema12s, i - 1),
    ema26p: lastFiniteAt(ema26s, i - 1),
    wma20: wmaAt(closes, 20, i),
    dema20: dema,
    tema20: temaAt(closes, 20, i),
    hma20: hma,
    vwma20: vwma(bars, i, 20),
    rsi: lastFiniteAt(rsiS, i),
    rsip: lastFiniteAt(rsiS, i - 1),
    stochK: stochNow.k,
    stochD,
    stochKp: stochPrev.k,
    stochRsi: stochRsi(rsiS, i, 14),
    macd: lastFiniteAt(macdLine, i),
    macdSig: firstMacd >= 0 ? lastFiniteAt(signalFull, i) : Number.NaN,
    macdHist: lastFiniteAt(macdLine, i) - lastFiniteAt(signalFull, i),
    macdP: lastFiniteAt(macdLine, i - 1),
    sigP: lastFiniteAt(signalFull, i - 1),
    ppo: Number.isFinite(ema26s[i]) && ema26s[i] !== 0 ? ((ema12s[i] - ema26s[i]) / ema26s[i]) * 100 : Number.NaN,
    roc: closes[i - 12] ? (last / closes[i - 12] - 1) * 100 : Number.NaN,
    mom: last - closes[i - 10],
    cci: cciAt(bars, i, 20),
    willr: williams(bars, i, 14),
    mfi: mfiAt(bars, i, 14),
    obvDelta: obv,
    cmf: cmfAt(bars, i, 20),
    atr: lastFiniteAt(atrS, i),
    natr: last !== 0 && Number.isFinite(atrS[i]) ? (atrS[i] / last) * 100 : Number.NaN,
    percentB: bb.percentB,
    bbWidth: bb.width,
    bbPos: bb.percentB,
    keltnerPos: kelt.pos,
    donchianPos: donH === donL ? Number.NaN : (last - donL) / (donH - donL),
    adx: adxPack.adx,
    plusDI: adxPack.plus,
    minusDI: adxPack.minus,
    aroonUp: aroon(highs, i, 25, true),
    aroonDown: aroon(lows, i, 25, false),
    psarDist: psar.dist,
    psarBelow: psar.below,
    superUp,
    vwapDist: vwap ? ((last - vwap) / vwap) * 100 : Number.NaN,
    tenkan,
    kijun,
    cloudDist: last !== 0 ? ((last - (cloudTop + cloudBot) / 2) / last) * 100 : Number.NaN,
    aboveCloud: last > cloudTop,
    trix,
    trixUp: Number.isFinite(trix) && trix > 0,
    uo: ultimate(bars, i),
    cmo: cmoAt(closes, i, 14),
    force: forceAt(bars, i),
    ao: awesome(bars, i),
    tsi: tsiAt(closes, i),
    ulcer: ulcerAt(closes, i, 14),
    engulfBull: bars[i].close > bars[i].open && bars[i - 1].close < bars[i - 1].open && bars[i].close >= bars[i - 1].open && bars[i].open <= bars[i - 1].close,
    engulfBear: bars[i].close < bars[i].open && bars[i - 1].close > bars[i - 1].open && bars[i].close <= bars[i - 1].open && bars[i].open >= bars[i - 1].close,
    hammer: lowerWick > body * 2 && upperWick < body && bars[i].close > bars[i].open,
    star: upperWick > body * 2 && lowerWick < body && bars[i].close < bars[i].open,
    insideBreakUp: bars[i - 1].high < bars[i - 2].high && bars[i - 1].low > bars[i - 2].low && last > bars[i - 2].high,
    insideBreakDown: bars[i - 1].high < bars[i - 2].high && bars[i - 1].low > bars[i - 2].low && last < bars[i - 2].low,
    nr7Up: nr7 && last > prev,
    nr7Down: nr7 && last < prev,
    volUp: avgVol > 0 && bars[i].volume > avgVol * 1.8 && last > prev,
    volDown: avgVol > 0 && bars[i].volume > avgVol * 1.8 && last < prev,
    gapUp: bars[i].low > bars[i - 1].high && last > bars[i].open,
    gapDown: bars[i].high < bars[i - 1].low && last < bars[i].open,
    threeUp: closes[i] > closes[i - 1] && closes[i - 1] > closes[i - 2] && closes[i - 2] > closes[i - 3],
    threeDown: closes[i] < closes[i - 1] && closes[i - 1] < closes[i - 2] && closes[i - 2] < closes[i - 3],
    stackBull: ema12s[i] > ema26s[i] && ema26s[i] > ema50s[i],
    stackBear: ema12s[i] < ema26s[i] && ema26s[i] < ema50s[i],
    breakHigh: last > priorHigh,
    breakLow: last < priorLow,
    hhhl: bars[i].high > bars[i - 1].high && bars[i].low > bars[i - 1].low,
    lhll: bars[i].high < bars[i - 1].high && bars[i].low < bars[i - 1].low,
    sweepUp: bars[i].low < bars[i - 1].low && last > bars[i - 1].low && last > bars[i].open,
    sweepDown: bars[i].high > bars[i - 1].high && last < bars[i - 1].high && last < bars[i].open,
    fvgUp: bars[i].low > bars[i - 2].high,
    fvgDown: bars[i].high < bars[i - 2].low,
    bosUp: last > rollHigh(bars, i - 1, 10),
    bosDown: last < rollLow(bars, i - 1, 10),
    chochUp: closes[i - 1] < closes[i - 2] && closes[i - 2] < closes[i - 3] && last > rollHigh(bars, i - 1, 5),
    chochDown: closes[i - 1] > closes[i - 2] && closes[i - 2] > closes[i - 3] && last < rollLow(bars, i - 1, 5),
    atrExpandUp: Number.isFinite(atrS[i]) && Number.isFinite(atrS[i - 5]) && atrS[i] > atrS[i - 5] * 1.15 && last > prev,
    atrExpandDown: Number.isFinite(atrS[i]) && Number.isFinite(atrS[i - 5]) && atrS[i] > atrS[i - 5] * 1.15 && last < prev,
    candleBull: last > bars[i].open && last > ema20s[i],
    candleBear: last < bars[i].open && last < ema20s[i],
  };
}

function rsiSeries(closes: number[], period: number) {
  const out = new Array<number>(closes.length).fill(Number.NaN);
  if (closes.length <= period) return out;
  let gain = 0;
  let loss = 0;
  for (let k = 1; k <= period; k++) {
    const d = closes[k] - closes[k - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  gain /= period;
  loss /= period;
  const value = () => (loss === 0 ? 100 : 100 - 100 / (1 + gain / loss));
  out[period] = value();
  for (let k = period + 1; k < closes.length; k++) {
    const d = closes[k] - closes[k - 1];
    gain = (gain * (period - 1) + (d > 0 ? d : 0)) / period;
    loss = (loss * (period - 1) + (d < 0 ? -d : 0)) / period;
    out[k] = value();
  }
  return out;
}

function atrSeries(bars: Bar[], period: number) {
  const trs = bars.map((bar, idx) => (idx === 0 ? bar.high - bar.low : trueRange(bars, idx)));
  const smoothed = wilderSeries(trs, period);
  return smoothed.map((v) => (Number.isFinite(v) ? v / period : Number.NaN));
}

function stochastic(bars: Bar[], end: number, period: number) {
  if (end < period) return { k: Number.NaN };
  const hh = rollHigh(bars, end, period);
  const ll = rollLow(bars, end, period);
  if (hh === ll) return { k: 50 };
  return { k: ((bars[end].close - ll) / (hh - ll)) * 100 };
}

function stochRsi(rsiS: number[], end: number, period: number) {
  if (end < period) return Number.NaN;
  const slice = rsiS.slice(end - period + 1, end + 1).filter((v) => Number.isFinite(v));
  if (slice.length < period) return Number.NaN;
  const hh = Math.max(...slice);
  const ll = Math.min(...slice);
  const cur = rsiS[end];
  if (!Number.isFinite(cur) || hh === ll) return 50;
  return ((cur - ll) / (hh - ll)) * 100;
}

function bollinger(closes: number[], end: number, period: number, mult: number) {
  const mid = smaAt(closes, period, end);
  if (!Number.isFinite(mid)) return { percentB: Number.NaN, width: Number.NaN };
  let acc = 0;
  for (let k = end - period + 1; k <= end; k++) acc += (closes[k] - mid) ** 2;
  const sd = Math.sqrt(acc / period);
  const upper = mid + mult * sd;
  const lower = mid - mult * sd;
  const width = mid === 0 ? Number.NaN : (upper - lower) / mid;
  const percentB = upper === lower ? 0.5 : (closes[end] - lower) / (upper - lower);
  return { percentB, width };
}

function keltner(bars: Bar[], atrS: number[], end: number, period: number, mult: number) {
  const closes = bars.map((b) => b.close);
  const mid = smaAt(closes, period, end);
  const atr = atrS[end];
  if (!Number.isFinite(mid) || !Number.isFinite(atr)) return { pos: Number.NaN };
  const upper = mid + mult * atr;
  const lower = mid - mult * atr;
  if (upper === lower) return { pos: 0.5 };
  return { pos: (bars[end].close - lower) / (upper - lower) };
}

function cciAt(bars: Bar[], end: number, period: number) {
  if (end < period) return Number.NaN;
  const tps: number[] = [];
  for (let k = end - period + 1; k <= end; k++) tps.push((bars[k].high + bars[k].low + bars[k].close) / 3);
  const m = mean(tps);
  const md = mean(tps.map((v) => Math.abs(v - m)));
  if (md === 0) return 0;
  return (tps[tps.length - 1] - m) / (0.015 * md);
}

function williams(bars: Bar[], end: number, period: number) {
  const hh = rollHigh(bars, end, period);
  const ll = rollLow(bars, end, period);
  if (hh === ll) return -50;
  return ((hh - bars[end].close) / (hh - ll)) * -100;
}

function mfiAt(bars: Bar[], end: number, period: number) {
  if (end < period + 1) return Number.NaN;
  let pos = 0;
  let neg = 0;
  for (let k = end - period + 1; k <= end; k++) {
    const tp = (bars[k].high + bars[k].low + bars[k].close) / 3;
    const prev = (bars[k - 1].high + bars[k - 1].low + bars[k - 1].close) / 3;
    const flow = tp * bars[k].volume;
    if (tp > prev) pos += flow;
    else if (tp < prev) neg += flow;
  }
  if (neg === 0) return 100;
  const ratio = pos / neg;
  return 100 - 100 / (1 + ratio);
}

function cmfAt(bars: Bar[], end: number, period: number) {
  let mfv = 0;
  let vol = 0;
  for (let k = end - period + 1; k <= end; k++) {
    const range = bars[k].high - bars[k].low;
    const mfm = range === 0 ? 0 : (bars[k].close - bars[k].low - (bars[k].high - bars[k].close)) / range;
    mfv += mfm * bars[k].volume;
    vol += bars[k].volume;
  }
  return vol === 0 ? Number.NaN : mfv / vol;
}

function obvDelta(bars: Bar[], lookback: number) {
  let obv = 0;
  let prev = 0;
  for (let k = 1; k < bars.length; k++) {
    if (bars[k].close > bars[k - 1].close) obv += bars[k].volume;
    else if (bars[k].close < bars[k - 1].close) obv -= bars[k].volume;
    if (k === bars.length - 1 - lookback) prev = obv;
  }
  return obv - prev;
}

function aroon(series: number[], end: number, period: number, up: boolean) {
  if (end < period) return Number.NaN;
  let best = end;
  for (let k = end - period; k <= end; k++) {
    if (up ? series[k] >= series[best] : series[k] <= series[best]) best = k;
  }
  const since = end - best;
  return ((period - since) / period) * 100;
}

function adxPackAt(bars: Bar[], period: number) {
  const n = bars.length;
  if (n < period * 2) return { adx: Number.NaN, plus: Number.NaN, minus: Number.NaN };
  const tr: number[] = [];
  const plus: number[] = [];
  const minus: number[] = [];
  for (let k = 1; k < n; k++) {
    const up = bars[k].high - bars[k - 1].high;
    const down = bars[k - 1].low - bars[k].low;
    plus.push(up > down && up > 0 ? up : 0);
    minus.push(down > up && down > 0 ? down : 0);
    tr.push(trueRange(bars, k));
  }
  const trS = wilderSeries(tr, period);
  const pS = wilderSeries(plus, period);
  const mS = wilderSeries(minus, period);
  const dx: number[] = [];
  for (let k = 0; k < tr.length; k++) {
    if (!Number.isFinite(trS[k]) || trS[k] === 0) {
      dx.push(Number.NaN);
      continue;
    }
    const pdi = (100 * pS[k]) / trS[k];
    const mdi = (100 * mS[k]) / trS[k];
    const den = pdi + mdi;
    dx.push(den === 0 ? 0 : (100 * Math.abs(pdi - mdi)) / den);
  }
  const finiteDx = dx.map((v) => (Number.isFinite(v) ? v : 0));
  const adxS = wilderSeries(finiteDx, period);
  const last = n - 2;
  const atrDen = trS[last];
  return {
    adx: Number.isFinite(adxS[last]) ? adxS[last] / period : Number.NaN,
    plus: atrDen ? (100 * pS[last]) / atrDen : Number.NaN,
    minus: atrDen ? (100 * mS[last]) / atrDen : Number.NaN,
  };
}

function psarState(bars: Bar[]) {
  let bull = true;
  let sar = bars[0].low;
  let ep = bars[0].high;
  let af = 0.02;
  for (let k = 1; k < bars.length; k++) {
    sar = sar + af * (ep - sar);
    if (bull) {
      if (bars[k].low < sar) {
        bull = false;
        sar = ep;
        ep = bars[k].low;
        af = 0.02;
      } else {
        if (bars[k].high > ep) {
          ep = bars[k].high;
          af = Math.min(af + 0.02, 0.2);
        }
      }
    } else if (bars[k].high > sar) {
      bull = true;
      sar = ep;
      ep = bars[k].high;
      af = 0.02;
    } else if (bars[k].low < ep) {
      ep = bars[k].low;
      af = Math.min(af + 0.02, 0.2);
    }
  }
  const last = bars[bars.length - 1].close;
  return { below: bull, dist: last === 0 ? Number.NaN : ((last - sar) / last) * 100 };
}

function supertrendUp(bars: Bar[], atrS: number[]) {
  let upTrend = true;
  let upper = bars[0].high;
  let lower = bars[0].low;
  for (let k = 1; k < bars.length; k++) {
    const atr = atrS[k];
    if (!Number.isFinite(atr)) continue;
    const hl2 = (bars[k].high + bars[k].low) / 2;
    const basicUp = hl2 + 3 * atr;
    const basicDn = hl2 - 3 * atr;
    upper = basicUp < upper || bars[k - 1].close > upper ? basicUp : upper;
    lower = basicDn > lower || bars[k - 1].close < lower ? basicDn : lower;
    if (upTrend && bars[k].close < lower) upTrend = false;
    else if (!upTrend && bars[k].close > upper) upTrend = true;
  }
  return upTrend;
}

function sessionVwap(bars: Bar[], lookback: number) {
  const slice = bars.slice(-lookback);
  let pv = 0;
  let vol = 0;
  for (const bar of slice) {
    pv += ((bar.high + bar.low + bar.close) / 3) * bar.volume;
    vol += bar.volume;
  }
  return vol > 0 ? pv / vol : Number.NaN;
}

function vwma(bars: Bar[], end: number, period: number) {
  let pv = 0;
  let vol = 0;
  for (let k = end - period + 1; k <= end; k++) {
    pv += bars[k].close * bars[k].volume;
    vol += bars[k].volume;
  }
  return vol > 0 ? pv / vol : Number.NaN;
}

function demaAt(ema20: number[], closes: number[], end: number) {
  const second = ema(ema20.map((v) => (Number.isFinite(v) ? v : closes[end])), 20);
  const a = ema20[end];
  const b = second[end];
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Number.NaN;
  return 2 * a - b;
}

function temaAt(closes: number[], period: number, end: number) {
  const e1 = ema(closes, period);
  const e2 = ema(e1.map((v, idx) => (Number.isFinite(v) ? v : closes[Math.min(idx, closes.length - 1)])), period);
  const e3 = ema(e2.map((v, idx) => (Number.isFinite(v) ? v : closes[Math.min(idx, closes.length - 1)])), period);
  if (![e1[end], e2[end], e3[end]].every(Number.isFinite)) return Number.NaN;
  return 3 * e1[end] - 3 * e2[end] + e3[end];
}

function hmaAt(closes: number[], period: number, end: number) {
  const half = Math.max(2, Math.round(period / 2));
  const root = Math.max(2, Math.round(Math.sqrt(period)));
  const diff: number[] = [];
  for (let k = 0; k <= end; k++) {
    const a = wmaAt(closes, half, k);
    const b = wmaAt(closes, period, k);
    diff.push(Number.isFinite(a) && Number.isFinite(b) ? 2 * a - b : closes[k]);
  }
  return wmaAt(diff, root, end);
}

function ultimate(bars: Bar[], end: number) {
  const bp = (len: number) => {
    let sumBp = 0;
    let sumTr = 0;
    for (let k = end - len + 1; k <= end; k++) {
      const minL = Math.min(bars[k].low, bars[k - 1].close);
      const maxH = Math.max(bars[k].high, bars[k - 1].close);
      sumBp += bars[k].close - minL;
      sumTr += maxH - minL;
    }
    return sumTr === 0 ? 0 : sumBp / sumTr;
  };
  if (end < 29) return Number.NaN;
  return (100 * (4 * bp(7) + 2 * bp(14) + bp(28))) / 7;
}

function cmoAt(closes: number[], end: number, period: number) {
  let up = 0;
  let down = 0;
  for (let k = end - period + 1; k <= end; k++) {
    const d = closes[k] - closes[k - 1];
    if (d > 0) up += d;
    else down -= d;
  }
  const den = up + down;
  return den === 0 ? 0 : (100 * (up - down)) / den;
}

function forceAt(bars: Bar[], end: number) {
  const raw: number[] = [0];
  for (let k = 1; k < bars.length; k++) raw.push((bars[k].close - bars[k - 1].close) * bars[k].volume);
  const smooth = ema(raw, 13);
  return smooth[end];
}

function awesome(bars: Bar[], end: number) {
  const med = bars.map((b) => (b.high + b.low) / 2);
  const a = smaAt(med, 5, end);
  const b = smaAt(med, 34, end);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Number.NaN;
  return a - b;
}

function tsiAt(closes: number[], end: number) {
  const mom: number[] = [0];
  for (let k = 1; k < closes.length; k++) mom.push(closes[k] - closes[k - 1]);
  const e1 = ema(mom, 25);
  const e2 = ema(e1.map((v) => (Number.isFinite(v) ? v : 0)), 13);
  const a1 = ema(mom.map((v) => Math.abs(v)), 25);
  const a2 = ema(a1.map((v) => (Number.isFinite(v) ? v : 0)), 13);
  if (!Number.isFinite(e2[end]) || !a2[end]) return Number.NaN;
  return (100 * e2[end]) / a2[end];
}

function ulcerAt(closes: number[], end: number, period: number) {
  if (end < period) return Number.NaN;
  const slice = closes.slice(end - period + 1, end + 1);
  let peak = slice[0];
  const dd: number[] = [];
  for (const c of slice) {
    peak = Math.max(peak, c);
    dd.push(peak === 0 ? 0 : ((c - peak) / peak) * 100);
  }
  return Math.sqrt(mean(dd.map((v) => v * v)));
}

function gt(a: number, b: number) {
  return Number.isFinite(a) && Number.isFinite(b) && a > b;
}
function lt(a: number, b: number) {
  return Number.isFinite(a) && Number.isFinite(b) && a < b;
}

function flagsOf(t: Tape): FlagReading[] {
  const row = (
    id: string,
    name: string,
    cluster: ClusterId,
    long: boolean,
    short: boolean,
  ): FlagReading => ({ id, name, cluster, long: Boolean(long), short: Boolean(short) });
  return [
    row("f01", "SMA 20/50", "trend", gt(t.sma20, t.sma50), lt(t.sma20, t.sma50)),
    row("f02", "EMA 12/26", "trend", gt(t.ema12, t.ema26), lt(t.ema12, t.ema26)),
    row("f03", "Schluss über SMA 200", "trend", gt(t.last, t.sma200), lt(t.last, t.sma200)),
    row("f04", "Schluss über EMA 50", "trend", gt(t.last, t.ema50), lt(t.last, t.ema50)),
    row("f05", "PSAR-Seite", "trend", t.psarBelow, !t.psarBelow && Number.isFinite(t.psarDist)),
    row("f06", "Supertrend", "trend", t.superUp, !t.superUp),
    row("f07", "Ichimoku Tenkan/Kijun", "trend", gt(t.tenkan, t.kijun), lt(t.tenkan, t.kijun)),
    row("f08", "Wolke", "trend", t.aboveCloud, Number.isFinite(t.cloudDist) && !t.aboveCloud && t.last < t.kijun),
    row("f09", "ADX und DI", "trend", t.adx > 20 && gt(t.plusDI, t.minusDI), t.adx > 20 && gt(t.minusDI, t.plusDI)),
    row("f10", "Aroon", "trend", t.aroonUp > 70 && gt(t.aroonUp, t.aroonDown), t.aroonDown > 70 && gt(t.aroonDown, t.aroonUp)),
    row("f11", "RSI-Extrem", "momentum", t.rsi < 30, t.rsi > 70),
    row("f12", "RSI kreuzt 50", "momentum", t.rsip <= 50 && t.rsi > 50, t.rsip >= 50 && t.rsi < 50),
    row("f13", "Stochastik-Kreuz", "momentum", t.stochKp <= t.stochD && t.stochK > t.stochD && t.stochK < 30, t.stochKp >= t.stochD && t.stochK < t.stochD && t.stochK > 70),
    row("f14", "MACD-Histogramm", "momentum", t.macdHist > 0, t.macdHist < 0),
    row("f15", "MACD-Kreuz", "momentum", t.macdP <= t.sigP && t.macd > t.macdSig, t.macdP >= t.sigP && t.macd < t.macdSig),
    row("f16", "ROC 12", "momentum", t.roc > 0, t.roc < 0),
    row("f17", "Momentum 10", "momentum", t.mom > 0, t.mom < 0),
    row("f18", "CCI-Extrem", "momentum", t.cci < -100, t.cci > 100),
    row("f19", "TRIX-Steigung", "momentum", t.trixUp, Number.isFinite(t.trix) && !t.trixUp),
    row("f20", "TSI-Vorzeichen", "momentum", t.tsi > 0, t.tsi < 0),
    row("f21", "Bollinger außerhalb", "volatilitaet", t.percentB < 0, t.percentB > 1),
    row("f22", "Bollinger-Mittel", "volatilitaet", t.percentB > 0.5 && t.percentB < 1, t.percentB < 0.5 && t.percentB > 0),
    row("f23", "Keltner-Bruch", "volatilitaet", t.keltnerPos > 1, t.keltnerPos < 0),
    row("f24", "Donchian-Lage", "volatilitaet", t.donchianPos > 0.8, t.donchianPos < 0.2),
    row("f25", "NR7-Ausbruch", "volatilitaet", t.nr7Up, t.nr7Down),
    row("f26", "ATR-Ausweitung", "volatilitaet", t.atrExpandUp, t.atrExpandDown),
    row("f27", "Williams-Extrem", "volatilitaet", t.willr < -80, t.willr > -20),
    row("f28", "Ultimate-Extrem", "volatilitaet", t.uo < 30, t.uo > 70),
    row("f29", "Ulcer unter 5 / über 8", "volatilitaet", Number.isFinite(t.ulcer) && t.ulcer < 5 && t.last > t.prev, Number.isFinite(t.ulcer) && t.ulcer > 8),
    row("f30", "Mean-Reversion BB", "volatilitaet", t.percentB < 0.05 && t.last > t.open, t.percentB > 0.95 && t.last < t.open),
    row("f31", "OBV-Steigung", "volumen", t.obvDelta > 0, t.obvDelta < 0),
    row("f32", "CMF-Vorzeichen", "volumen", t.cmf > 0, t.cmf < 0),
    row("f33", "MFI-Extrem", "volumen", t.mfi < 20, t.mfi > 80),
    row("f34", "Force-Index", "volumen", t.force > 0, t.force < 0),
    row("f35", "Volumen-Klimax", "volumen", t.volUp, t.volDown),
    row("f36", "VWAP-Seite", "volumen", t.vwapDist > 0, t.vwapDist < 0),
    row("f37", "CMO-Vorzeichen", "volumen", t.cmo > 0, t.cmo < 0),
    row("f38", "Awesome-Oszillator", "volumen", t.ao > 0, t.ao < 0),
    row("f39", "Schluss über VWMA", "volumen", gt(t.last, t.vwma20), lt(t.last, t.vwma20)),
    row("f40", "PPO-Vorzeichen", "volumen", t.ppo > 0, t.ppo < 0),
    row("f41", "Höheres Hoch und Tief", "struktur", t.hhhl, t.lhll),
    row("f42", "Engulfing", "struktur", t.engulfBull, t.engulfBear),
    row("f43", "Hammer / Shooting Star", "struktur", t.hammer, t.star),
    row("f44", "Inside-Bar-Bruch", "struktur", t.insideBreakUp, t.insideBreakDown),
    row("f45", "Drei Schlusskurse", "struktur", t.threeUp, t.threeDown),
    row("f46", "EMA-Stapel 12/26/50", "struktur", t.stackBull, t.stackBear),
    row("f47", "20-Bar-Bruch", "struktur", t.breakHigh, t.breakLow),
    row("f48", "Liquidity Sweep", "struktur", t.sweepUp, t.sweepDown),
    row("f49", "Fair Value Gap", "struktur", t.fvgUp, t.fvgDown),
    row("f50", "Strukturbruch und ChoCh", "struktur", t.bosUp || t.chochUp, t.bosDown || t.chochDown),
  ];
}

function indicatorsOf(t: Tape): IndicatorReading[] {
  const row = (id: string, name: string, cluster: ClusterId, value: number, digits: number): IndicatorReading => ({
    id,
    name,
    cluster,
    value: finite(value),
    digits,
  });
  return [
    row("i01", "SMA 20", "trend", t.sma20, 2),
    row("i02", "SMA 50", "trend", t.sma50, 2),
    row("i03", "SMA 200", "trend", t.sma200, 2),
    row("i04", "EMA 12", "trend", t.ema12, 2),
    row("i05", "EMA 26", "trend", t.ema26, 2),
    row("i06", "EMA 50", "trend", t.ema50, 2),
    row("i07", "WMA 20", "trend", t.wma20, 2),
    row("i08", "DEMA 20", "trend", t.dema20, 2),
    row("i09", "HMA 20", "trend", t.hma20, 2),
    row("i10", "Ichimoku Tenkan", "trend", t.tenkan, 2),
    row("i11", "RSI 14", "momentum", t.rsi, 1),
    row("i12", "Stochastik %K", "momentum", t.stochK, 1),
    row("i13", "Stochastik %D", "momentum", t.stochD, 1),
    row("i14", "StochRSI", "momentum", t.stochRsi, 1),
    row("i15", "MACD", "momentum", t.macd, 4),
    row("i16", "MACD-Signal", "momentum", t.macdSig, 4),
    row("i17", "MACD-Histogramm", "momentum", t.macdHist, 4),
    row("i18", "ROC 12", "momentum", t.roc, 2),
    row("i19", "Momentum 10", "momentum", t.mom, 4),
    row("i20", "TRIX", "momentum", t.trix, 3),
    row("i21", "Bollinger %B", "volatilitaet", t.percentB, 2),
    row("i22", "Bollinger-Breite", "volatilitaet", t.bbWidth, 3),
    row("i23", "Keltner-Lage", "volatilitaet", t.keltnerPos, 2),
    row("i24", "Donchian-Lage", "volatilitaet", t.donchianPos, 2),
    row("i25", "ATR 14", "volatilitaet", t.atr, 4),
    row("i26", "NATR 14", "volatilitaet", t.natr, 2),
    row("i27", "CCI 20", "volatilitaet", t.cci, 1),
    row("i28", "Williams %R", "volatilitaet", t.willr, 1),
    row("i29", "Ultimate Oscillator", "volatilitaet", t.uo, 1),
    row("i30", "Ulcer Index", "volatilitaet", t.ulcer, 2),
    row("i31", "OBV-Delta 5", "volumen", t.obvDelta, 0),
    row("i32", "CMF 20", "volumen", t.cmf, 3),
    row("i33", "MFI 14", "volumen", t.mfi, 1),
    row("i34", "Force Index", "volumen", t.force, 0),
    row("i35", "VWAP-Abstand %", "volumen", t.vwapDist, 2),
    row("i36", "VWMA 20", "volumen", t.vwma20, 2),
    row("i37", "CMO 14", "volumen", t.cmo, 1),
    row("i38", "Awesome Oscillator", "volumen", t.ao, 4),
    row("i39", "PPO", "volumen", t.ppo, 2),
    row("i40", "TSI", "momentum", t.tsi, 1),
    row("i41", "Kijun", "trend", t.kijun, 2),
    row("i42", "Wolkenabstand %", "trend", t.cloudDist, 2),
    row("i43", "ADX 14", "trend", t.adx, 1),
    row("i44", "+DI", "trend", t.plusDI, 1),
    row("i45", "−DI", "trend", t.minusDI, 1),
    row("i46", "Aroon Up", "struktur", t.aroonUp, 0),
    row("i47", "Aroon Down", "struktur", t.aroonDown, 0),
    row("i48", "PSAR-Abstand %", "struktur", t.psarDist, 2),
    row("i49", "TEMA 20", "struktur", t.tema20, 2),
    row("i50", "Supertrend 1=auf", "struktur", t.superUp ? 1 : 0, 0),
  ];
}

function vote(flags: FlagReading[]) {
  const long = flags.filter((flag) => flag.long).length;
  const short = flags.filter((flag) => flag.short).length;
  const voteScore = long + short === 0 ? 50 : Math.round((100 * long) / (long + short));
  return { long, short, vote: voteScore };
}

export async function analyzeBars(bars: Bar[]): Promise<Analysis> {
  const tape = buildTape(bars);
  if (!tape) {
    return { indicators: [], flags: [], clusters: [], score: 0, marks: [] };
  }
  const started = performance.now();
  const [indicators, flags] = await Promise.all([Promise.resolve(indicatorsOf(tape)), Promise.resolve(flagsOf(tape))]);
  const clusters = await Promise.all(
    CLUSTERS.map(async (cluster) => {
      const t0 = performance.now();
      const mine = flags.filter((flag) => flag.cluster === cluster.id);
      const tally = vote(mine);
      await Promise.resolve();
      return {
        id: cluster.id,
        label: cluster.label,
        ms: Math.max(0, Math.round(performance.now() - t0)),
        ...tally,
      } satisfies ClusterReport;
    }),
  );
  const score = Math.round(mean(clusters.map((cluster) => cluster.vote)));
  const time = bars[bars.length - 1]?.time ?? 0;
  const marks: Marker[] = [];
  for (const flag of flags) {
    if (marks.length >= 8) break;
    if (flag.long) marks.push({ time, position: "belowBar", text: flag.id });
    else if (flag.short && marks.length < 8) marks.push({ time, position: "aboveBar", text: flag.id });
  }
  void started;
  return { indicators, flags, clusters, score, marks };
}

export const INDICATOR_COUNT = 50;
export const FLAG_COUNT = 50;
