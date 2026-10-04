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
- Aktuell keine aktivierten externen Marktdaten- oder Sentiment-Provider.
- Frühere Provider wurden aufgrund der Owner-Vorgabe entfernt; ein kostenloser
  API-Zugang oder ein OSS-Client ersetzt keinen Datenrechte-Nachweis.
- `web/market-adapter.js` ist ein neues eigenständiges Apache-2.0-Modul.
  Lizenztext: `licenses/market-adapter-APACHE-2.0.txt`.
- Browser-Emulation verwendet ausschließlich lokale synthetische Test-Fixtures;
  diese sind weder Produktionskurse noch eine freigegebene Datenquelle.
