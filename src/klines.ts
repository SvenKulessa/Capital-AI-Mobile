import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseSentimentPoints } from "./sentiment";
import type { Bar, Source, TF } from "./types";
import { instrument } from "./universe";

const Query = z.object({
  ticker: z.string().regex(/^[A-Z0-9]{2,12}$/),
  tf: z.enum(["1h", "4h", "1d"]),
});

const BarZ = z.object({
  time: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export type SeriesResult = {
  ok: boolean;
  bars: Bar[];
  source: Source | null;
  error: string | null;
};

function pack(rows: Bar[], source: Source): SeriesResult {
  const bars = rows
    .filter((bar) => [bar.open, bar.high, bar.low, bar.close, bar.volume, bar.time].every(Number.isFinite))
    .filter((bar) => bar.high >= bar.low && bar.high >= Math.max(bar.open, bar.close) && bar.low <= Math.min(bar.open, bar.close))
    .sort((a, b) => a.time - b.time);
  const deduped: Bar[] = [];
  for (const bar of bars) {
    const prev = deduped[deduped.length - 1];
    if (prev && prev.time === bar.time) deduped[deduped.length - 1] = bar;
    else deduped.push(bar);
  }
  return { ok: deduped.length > 40, bars: deduped, source, error: deduped.length > 40 ? null : "zu wenig Kerzen" };
}

async function binance(pair: string, tf: TF): Promise<SeriesResult> {
  const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${tf}&limit=240`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return { ok: false, bars: [], source: null, error: `Binance ${response.status}` };
  const rows = (await response.json()) as unknown[];
  if (!Array.isArray(rows)) return { ok: false, bars: [], source: null, error: "Binance ohne Reihen" };
  const bars = rows.flatMap((row) => {
    if (!Array.isArray(row) || row.length < 6) return [];
    const bar = {
      time: Number(row[0]) / 1000,
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5]),
    };
    const parsed = BarZ.safeParse(bar);
    return parsed.success ? [parsed.data] : [];
  });
  return pack(bars, "binance");
}

function bucket(bars: Bar[], seconds: number) {
  const map = new Map<number, Bar>();
  for (const bar of bars) {
    const key = Math.floor(bar.time / seconds) * seconds;
    const prev = map.get(key);
    if (!prev) map.set(key, { ...bar, time: key });
    else {
      prev.high = Math.max(prev.high, bar.high);
      prev.low = Math.min(prev.low, bar.low);
      prev.close = bar.close;
      prev.volume += bar.volume;
    }
  }
  return [...map.values()].sort((a, b) => a.time - b.time);
}

async function yahoo(symbol: string, tf: TF): Promise<SeriesResult> {
  const interval = tf === "1d" ? "1d" : "60m";
  const range = tf === "1d" ? "2y" : "60d";
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`,
    { signal: AbortSignal.timeout(8000), headers: { "user-agent": "Capital-AI-Mobile" } },
  );
  if (!response.ok) return { ok: false, bars: [], source: null, error: `Yahoo ${response.status}` };
  const body = (await response.json()) as {
    chart?: {
      result?: Array<{
        timestamp?: number[];
        indicators?: { quote?: Array<Record<string, Array<number | null>>> };
      }>;
    };
  };
  const result = body.chart?.result?.[0];
  const times = result?.timestamp ?? [];
  const quote = result?.indicators?.quote?.[0];
  if (!quote) return { ok: false, bars: [], source: null, error: "Yahoo ohne Kurse" };
  const bars: Bar[] = [];
  for (let i = 0; i < times.length; i++) {
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    const volume = quote.volume?.[i] ?? 0;
    if (open == null || high == null || low == null || close == null) continue;
    bars.push({ time: times[i], open, high, low, close, volume });
  }
  const shaped = tf === "4h" ? bucket(bars, 4 * 3600) : bars;
  return pack(shaped, "yahoo");
}

export const fetchSeries = createServerFn({ method: "POST" })
  .validator((input: unknown) => Query.parse(input))
  .handler(async ({ data }): Promise<SeriesResult> => {
    const spec = instrument(data.ticker);
    if (!spec) return { ok: false, bars: [], source: null, error: "unbekanntes Symbol" };
    try {
      if (spec.pair) return await binance(spec.pair, data.tf);
      if (spec.yahoo) return await yahoo(spec.yahoo, data.tf);
      return { ok: false, bars: [], source: null, error: "keine öffentliche Quelle" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Netzwerk";
      return { ok: false, bars: [], source: null, error: message };
    }
  });

export type FearGreed = { points: number | null; label: string | null; error: string | null };

export const fetchFearGreed = createServerFn({ method: "GET" }).handler(async (): Promise<FearGreed> => {
  try {
    const response = await fetch("https://api.alternative.me/fng/?limit=1", { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return { points: null, label: null, error: `Fear & Greed ${response.status}` };
    const body = (await response.json()) as { data?: Array<{ value?: string; value_classification?: string }> };
    const row = body.data?.[0];
    const points = parseSentimentPoints(row?.value);
    return { points, label: row?.value_classification ?? null, error: points === null ? "Wert fehlt" : null };
  } catch (error) {
    return { points: null, label: null, error: error instanceof Error ? error.message : "Fear & Greed nicht erreichbar" };
  }
});
