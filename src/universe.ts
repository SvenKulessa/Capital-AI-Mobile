export type AssetClass = "krypto" | "aktien" | "index" | "rohstoff" | "fx" | "anleihe";

export type Instrument = {
  ticker: string;
  name: string;
  klass: AssetClass;
  group: string;
  pair: string | null;
  yahoo: string | null;
  currency: "USD" | "EUR";
};

export const INSTRUMENTS: Instrument[] = [
  { ticker: "BTC", name: "Bitcoin", klass: "krypto", group: "Layer 1", pair: "BTCUSDT", yahoo: null, currency: "USD" },
  { ticker: "ETH", name: "Ether", klass: "krypto", group: "Layer 1", pair: "ETHUSDT", yahoo: null, currency: "USD" },
  { ticker: "SOL", name: "Solana", klass: "krypto", group: "Layer 1", pair: "SOLUSDT", yahoo: null, currency: "USD" },
  { ticker: "AVAX", name: "Avalanche", klass: "krypto", group: "Layer 1", pair: "AVAXUSDT", yahoo: null, currency: "USD" },
  { ticker: "UNI", name: "Uniswap", klass: "krypto", group: "DeFi", pair: "UNIUSDT", yahoo: null, currency: "USD" },
  { ticker: "AAVE", name: "Aave", klass: "krypto", group: "DeFi", pair: "AAVEUSDT", yahoo: null, currency: "USD" },
  { ticker: "MKR", name: "Maker", klass: "krypto", group: "DeFi", pair: "MKRUSDT", yahoo: null, currency: "USD" },
  { ticker: "LDO", name: "Lido", klass: "krypto", group: "DeFi", pair: "LDOUSDT", yahoo: null, currency: "USD" },
  { ticker: "SAP", name: "SAP", klass: "aktien", group: "Europa", pair: null, yahoo: "SAP.DE", currency: "EUR" },
  { ticker: "ASML", name: "ASML", klass: "aktien", group: "Europa", pair: null, yahoo: "ASML.AS", currency: "EUR" },
  { ticker: "NVDA", name: "NVIDIA", klass: "aktien", group: "USA", pair: null, yahoo: "NVDA", currency: "USD" },
  { ticker: "DAX", name: "DAX", klass: "index", group: "Europa", pair: null, yahoo: "^GDAXI", currency: "EUR" },
  { ticker: "SPX", name: "S&P 500", klass: "index", group: "USA", pair: null, yahoo: "^GSPC", currency: "USD" },
  { ticker: "NDX", name: "Nasdaq 100", klass: "index", group: "USA", pair: null, yahoo: "^NDX", currency: "USD" },
  { ticker: "GOLD", name: "Gold", klass: "rohstoff", group: "Metall", pair: null, yahoo: "GC=F", currency: "USD" },
  { ticker: "WTI", name: "WTI-Rohöl", klass: "rohstoff", group: "Energie", pair: null, yahoo: "CL=F", currency: "USD" },
  { ticker: "EURUSD", name: "Euro / US-Dollar", klass: "fx", group: "Major", pair: null, yahoo: "EURUSD=X", currency: "USD" },
  { ticker: "US10Y", name: "US-Treasury 10J", klass: "anleihe", group: "Rendite", pair: null, yahoo: "^TNX", currency: "USD" },
];
