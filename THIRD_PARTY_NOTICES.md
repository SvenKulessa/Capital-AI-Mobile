# Third-Party / Provenance Notices

The mobile crypto scoring projection in `web/scoring.js` is derived from CAPITAL-AI Finance source owned by the same repository owner, primarily:

- `src/services/realMarketSignals.ts`
- `src/services/cryptoScoringService.ts`
- `src/services/verifiedCryptoTechnicalScoring.ts`
- `src/platform/Scoring/ScoringModelRegistry.ts`
- `src/platform/Scoring/ScoringDispatcher.ts`

Finance baseline: `dcef421fe6e350a3a2ade61d0299aad9ecca213c`.

The migrated scoring primitive files in Finance carry SPDX `Apache-2.0` headers. The CAPITAL-AI repositories themselves remain proprietary as recorded by their repository license files.

Runtime public data sources used by the private research app:
- CoinPaprika public API for ranked crypto metadata.
- Binance public Spot API for OHLCV candles.
- alternative.me Fear & Greed for display-only crypto sentiment.

Provider/data rights are not inferred from software licenses. This application is scoped to private research unless separate rights evidence says otherwise.
