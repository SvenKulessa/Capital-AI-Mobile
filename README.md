# Capital-AI-Mobile

Mobiles Terminal für Capital-AI. Scoring, Modellierung und Markierungen laufen mit offenen Formeln, nicht mit einer Blackbox.

## Daten

- Krypto-Kerzen: öffentliche Binance-API
- Aktien: öffentliche Yahoo-Chart-API (SAP.DE, ASML.AS, NVDA)
- Sentiment: Crypto Fear & Greed von alternative.me, als ganze Zahl. 28 bleibt 28. Keine Umrechnung auf −1…+1, keine Desk-Notizen, keine Modellkerzen.
- Aktien haben keinen Fear-&-Greed-Rohwert und bleiben leer.

## Rechnung

Fünf Cluster parallel: Trend, Momentum, Volatilität, Volumen, Struktur.

- 50 Indikatoren (SMA, EMA, WMA, DEMA, HMA, RSI, Stochastik, MACD, Bollinger, ATR, ADX, Ichimoku, OBV, CMF, …)
- 50 Flags, jede in Long und Short ausgewertet
- Score = Mittel der Cluster-Mehrheiten, danach separates Risiko-Gate. Das Sentiment wird dabei nicht umgeschrieben.

## Konto und Protokoll

Anmeldung mit Google (Gmail) oder E-Mail und Passwort. Jede autonome Tageslesung schreibt eine Audit-Sitzung. Zurücknehmen markiert die Lesung und legt einen Revert-Eintrag an. Kurse werden nicht gelöscht.

## Stripe

Der Stripe-Connector ist in diesem Konto nicht verbunden. Es gibt deshalb keinen Checkout und keine erfundenen Price-IDs.

## Herkunft der Logik

Faktoren und Terminal-Hülle aus den verbundenen Repos SvenKulessa/Finance und SvenKulessa/Capital-AI. Die Mobile-Rechnung steht in diesem Repo unter `src/`.
