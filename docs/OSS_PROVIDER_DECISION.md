# OSS-Provider-Entscheidung — 2026-10-03

Owner-Entscheidung: eigener Datenadapter; kein Deployment und keine Änderung
produktiver Secrets. Basis: main `2a86e7532cf1a78f96dc4994ba19c3d622e985cb`,
Merge von Mobile-PR #1, Head `f50e27a6d3dc4c756ff39487bddfcff451348149`.

## Konkrete Umsetzung

- Der frühere Börsenprovider wurde vollständig aus aktivem Browsercode,
  Android-Allowlist und Live-Release-Prüfungen entfernt.
- Alle übrigen bisherigen externen Marktdaten-/Sentimentquellen sind entfernt,
  solange OSS-Provider-Software und offene Datenrechte nicht gemeinsam belegt sind.
- `web/market-adapter.js`: eigenständige Apache-2.0-Grenze ohne Fremddependencies;
  Prüfung von Zeitraster, Duplikaten, Lücken, Aktualität, echten OHLCV und
  Quellen-Evidence. Keine erfundenen Kerzen aus Schlusskurspunkten.
- Aktuell keine zugelassene reale Quelle. `verified=false`, `endpoint=null`.
  Der Release-Gate bricht mit `OSS_PROVIDER_ADMISSION_REQUIRED` ab.
- Lokale Browser-Fixtures bleiben eindeutig `LOCAL_TEST_FIXTURE` und zählen
  nicht als Live-Daten-, Top-400- oder Login-Nachweis.

## Geprüfte Kandidaten

| Kandidat | Software | Daten-/Betriebsgrenze | Urteil |
| --- | --- | --- | --- |
| CCXT | MIT | Einheitliche Börsenadapter; Börsen und Daten werden dadurch nicht OSS | Optionaler serverseitiger Adapter, kein freigegebener OSS-Provider |
| OpenBB | AGPL-3.0 | Provider-Abstraktion; eigene externe Datenverträge bleiben notwendig | Für breites Research prüfen, nicht als Mobile-Bundle einsetzen |
| DefiLlama SDK | MIT laut offizieller README | Preise/TVL; freie und Pro-Endpunkte; Quellenketten separat nachweisen | Kandidat für DeFi, kein nachgewiesener Top-400-OHLCV-Ersatz |
| Uniswap V2 Subgraph | GPL-3.0 | Eigener Onchain-Indexer möglich; DEX-Pools sind kein globales Asset-Ranking | OSS-Ingestion-Baustein, gesonderte Infrastruktur-/Datenprüfung nötig |
| Trading Strategy | AGPL-3.0 | DEX-Daten-/Backtesting-Framework, Datenrechte separat | Challenger für Onchain-Forschung |
| Coin Metrics Community | OSS-Client vorhanden | Datenarchiv CC BY-NC 4.0 | Nicht als uneingeschränkt offene Datenquelle zugelassen |
| CoinPaprika | MIT-Client | API unter eigenen Nutzungsbedingungen | Entfernt; OSS-Client ist keine OSS-Provider-Freigabe |

## Würde ein Adapter bessere Ergebnisse liefern?

Die vorhandenen Tests belegen verbesserte Eingangsvalidierung: Doppelte oder
lückenhafte Zeitreihen, unmögliche Kerzen und stale/future Daten werden verworfen.
Replay mit unveränderten Eingaben und Auswertungszeit ist deterministisch.
Eine höhere Kursgenauigkeit, niedrigere Provider-Latenz oder bessere Rendite wurde
nicht nachgewiesen. Ein Adapter macht eine ungeeignete Quelle nicht genauer.

Empfehlung: schlanke OSS-Ingestion auf der Serverseite, kanonische unveränderliche
Snapshots und eigene HTTPS-API; NATS/Valkey bleiben außerhalb der APK. CCXT nur
für gesondert freigegebene Quellen verwenden. Mobile bleibt ohne Broker-Secrets.

## Blueprint des gewählten eigenen Adapters

1. Quellenadmission: Repo/Commit, Softwarelizenz, genaue Datenlizenz,
   Herkunftskette ohne entfernte Provider, Nutzungs-/Display-/Replayrechte,
   Limits und kanonischer Evidence-Hash.
2. Asset-ID: Chain-ID + Contract-Adresse bzw. native Asset-ID statt Symbol allein;
   eindeutige Pool-/Asset-Zuordnung, Liquiditäts-/Qualitätsfilter.
3. Ingestion: OSS-Indexer oder belegter Open-Data-Feed; Zeitreihen nach 1h/4h/1d,
   UTC, finalisierte Beobachtungen, keine impliziten Nullwerte.
4. Integrity: kanonisches Schema, Checksums, Deduplikation und explizite
   Reorg-/Gap-Behandlung; historische Snapshots bleiben unveränderlich.
5. Eigene Read-API: feste HTTPS-Allowlist, keine Weiterleitungen, ETag,
   bounded responses; zusätzliche Android-Allowlist erst nach API-Verifikation.
6. Score-Evidence: reale Volumen-/Supply-/Market-Cap-Metriken getrennt von
   Preis-/TVL-Daten prüfen. Ein DEX-Token ist nicht automatisch ein globales Asset.
7. Benchmark: identische Assets/Zeiträume; p50/p95/p99, Quote-Abweichung gegen
   unabhängige Referenz, Freshness, Gap-/Duplikatrate, OHLCV-Coverage, Quota,
   deterministischer Replay und gleichzeitige Scoreability messen.
8. Top-400: 400 reale eindeutige Assets und tatsächliche Score-Coverage belegen;
   vorhandene Fixtures beweisen keine Produktionsabdeckung.
9. Promotion erst nach erfolgreichen Source-, Data-, Replay- und Mobile-Gates.

Der Blueprint wurde nicht produktiv installiert. Neue Services, Kosten,
Deployment und produktive Secret-Konfiguration bleiben separat freizugeben.
Die bestehende App-Lizenz bleibt unverändert; ausschließlich das neue
Adapter-Modul ist Apache-2.0. Keine Behauptung, das gesamte proprietäre Produkt
oder bestehende Hosting-/Auth-Dienste seien Open Source.

## Quellen (Primärquellen)

- https://github.com/ccxt/ccxt/blob/master/LICENSE.txt
- https://github.com/openbq-org/OpenBB/blob/develop/LICENSE
- https://github.com/DefiLlama/api-sdk
- https://defillama.com/about
- https://github.com/Uniswap/v2-subgraph
- https://github.com/tradingstrategy-ai/trading-strategy
- https://github.com/coinmetrics/data
- https://github.com/coinpaprika/coinpaprika-api-nodejs-client
- https://coinpaprika.com/api-terms-of-use/
