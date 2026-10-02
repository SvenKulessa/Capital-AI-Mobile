export type TF = "1h" | "4h" | "1d";

export type Source = "binance" | "yahoo";

export type Bar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Signal = "long" | "short";

export type Marker = {
  time: number;
  position: "aboveBar" | "belowBar";
  text: string;
};

export type PatternHit = {
  id: string;
  name: string;
  signal: Signal;
  weight: number;
  rangeLow: number;
  rangeHigh: number;
  indicators: string[];
  note: string;
  markers: Marker[];
};

export type FactorKey = "momentum" | "trend" | "risk" | "liquidity" | "value" | "sentiment";

export type Weights = Record<FactorKey, number>;

export type AssetClass = "krypto" | "aktien";

export type Instrument = {
  ticker: string;
  name: string;
  klass: AssetClass;
  group: string;
  pair: string | null;
  yahoo: string | null;
  currency: "USD" | "EUR";
  base: number;
  vol: number;
  baseVolume: number;
};
