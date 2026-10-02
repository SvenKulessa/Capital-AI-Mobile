# Capital-AI-Mobile

Mobiles Terminal für Capital-AI. Scoring, Modellierung und Markierungen laufen mit offenen Formeln, nicht mit einer Blackbox.

Repo: https://github.com/SvenKulessa/Capital-AI-Mobile

## Daten

Keine Modellkerzen und keine erfundenen Sentiment-Werte.

- Krypto-Kerzen: öffentliche Binance-API
- Aktien, Indizes, Rohstoffe, FX, Anleihen: öffentliche Yahoo-Chart-API
  - SAP.DE, ASML.AS, NVDA, ^GDAXI, ^GSPC, ^NDX, GC=F, CL=F, EURUSD=X, ^TNX
- Sentiment: Crypto Fear & Greed von alternative.me, als ganze Zahl. 28 bleibt 28. Keine Umrechnung auf −1…+1. Aktien und die übrigen Klassen bleiben leer, wenn dieser Index nicht gilt.

## Rechnung

Fünf Cluster parallel: Trend, Momentum, Volatilität, Volumen, Struktur.

- 50 Indikatoren (SMA, EMA, WMA, DEMA, HMA, RSI, Stochastik, MACD, Bollinger, ATR, ADX, Ichimoku, OBV, CMF, …)
- 50 Flags, jede in Long und Short ausgewertet
- Score = Mittel der Cluster-Mehrheiten, danach separates Risiko-Gate. Das Sentiment wird dabei nicht umgeschrieben.

## Konto und Protokoll

Anmeldung mit Google (dasselbe Konto wie Gmail) oder E-Mail und Passwort. Jede autonome Tageslesung schreibt eine Audit-Sitzung. Zurücknehmen markiert die Lesung und legt einen Revert-Eintrag an. Kurse werden nicht gelöscht. Das Gmail-Postfach ist dafür nicht angebunden.

## Stripe

Livemodus-Konto CAPITAL-AI. Die App erfindet keine Preise. Zahlungslinks:

- CAPITAL-AI STARTER, 7,00 € / Monat — https://buy.stripe.com/28E28t5IJbV682ocRB00000
- CAPITAL-AI STARTER Jahr, 75,60 € — https://buy.stripe.com/cNi8wRb338IU5Ug8Bl00003
- CAPITAL-AI PRO, 29,00 € / Monat — https://buy.stripe.com/4gM00l2wx4sE6YkeZJ00001
- CAPITAL-AI PRO Jahr, 248,00 € — https://buy.stripe.com/28EdRb2wx6AM4Qc8Bl00004
- AIFINANCIAL Enterprise, 109,00 € / Monat — https://buy.stripe.com/4gM14pc77cZaeqMbNx00002
- CAPITAL-AI ENTERPRISE Jahr, 1.280,00 € — https://buy.stripe.com/aFabJ3c775wI1E04l500005

CAPITAL-AI FOUNDER (25.000 € einmalig) bleibt ohne Link in dieser App. Die Zahlung bei Stripe schaltet das Terminal-Login nicht automatisch frei.

## Herkunft der Logik

Faktoren und Terminal-Hülle aus den verbundenen Repos SvenKulessa/Finance und SvenKulessa/Capital-AI. Die Mobile-Rechnung steht in diesem Repo unter `src/`.
