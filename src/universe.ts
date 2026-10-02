import type { Instrument } from "./types";

export const INSTRUMENTS: Instrument[] = [
  { ticker: "BTC", name: "Bitcoin", klass: "krypto", group: "Layer 1", pair: "BTCUSDT", yahoo: null, currency: "USD", base: 64200, vol: 0.028, baseVolume: 18000 },
  { ticker: "ETH", name: "Ether", klass: "krypto", group: "Layer 1", pair: "ETHUSDT", yahoo: null, currency: "USD", base: 3180, vol: 0.032, baseVolume: 160000 },
  { ticker: "SOL", name: "Solana", klass: "krypto", group: "Layer 1", pair: "SOLUSDT", yahoo: null, currency: "USD", base: 148, vol: 0.045, baseVolume: 2400000 },
  { ticker: "AVAX", name: "Avalanche", klass: "krypto", group: "Layer 1", pair: "AVAXUSDT", yahoo: null, currency: "USD", base: 27.5, vol: 0.042, baseVolume: 820000 },
  { ticker: "UNI", name: "Uniswap", klass: "krypto", group: "DeFi", pair: "UNIUSDT", yahoo: null, currency: "USD", base: 8.2, vol: 0.04, baseVolume: 1100000 },
  { ticker: "AAVE", name: "Aave", klass: "krypto", group: "DeFi", pair: "AAVEUSDT", yahoo: null, currency: "USD", base: 164, vol: 0.042, baseVolume: 86000 },
  { ticker: "MKR", name: "Maker", klass: "krypto", group: "DeFi", pair: "MKRUSDT", yahoo: null, currency: "USD", base: 1540, vol: 0.038, baseVolume: 3800 },
  { ticker: "LDO", name: "Lido", klass: "krypto", group: "DeFi", pair: "LDOUSDT", yahoo: null, currency: "USD", base: 1.12, vol: 0.05, baseVolume: 7200000 },
  { ticker: "SAP", name: "SAP", klass: "aktien", group: "Europa", pair: null, yahoo: "SAP.DE", currency: "EUR", base: 228, vol: 0.012, baseVolume: 1400000 },
  { ticker: "ASML", name: "ASML", klass: "aktien", group: "Europa", pair: null, yahoo: "ASML.AS", currency: "EUR", base: 755, vol: 0.018, baseVolume: 480000 },
  { ticker: "NVDA", name: "NVIDIA", klass: "aktien", group: "USA", pair: null, yahoo: "NVDA", currency: "USD", base: 131, vol: 0.024, baseVolume: 2.1e8 },
];

export const DEFI = ["UNI", "AAVE", "MKR", "LDO"] as const;

export function instrument(ticker: string) {
  return INSTRUMENTS.find((item) => item.ticker === ticker) ?? null;
}

export const DISCLAIMER =
  "Keine Anlageberatung und kein Angebot. Krypto-Kerzen kommen von der öffentlichen Binance-API, Aktien von der öffentlichen Yahoo-Chart-API. Sentiment ist der unveränderte Fear-&-Greed-Index (alternative.me), nur für Krypto. Scores sind die offene Cluster-Mehrheit aus 50 Flags. Fehlt eine Quelle, bleibt das Feld leer.";
