# Capital-AI Mobile

Eigenständige private Android-App für CAPITAL-AI. Die Mobile-Oberfläche und der Finance-abgeleitete Crypto-Scoring-Kern liegen vollständig in diesem Repository; die Webanwendung wird nicht eingebettet.

## Architektur

- Android WebView lädt ausschließlich das lokale Bundle unter `https://app.capital-ai.local/`.
- Authentifizierung startet über den externen Browser mit dem bestehenden CAPITAL-AI Mobile-OIDC/PKCE-Transfer; die Webanwendung wird weder geladen noch als Scoring-Backend verwendet.
- Marktdatenquellen benötigen nachgewiesene OSS-Software- und Open-Data-Rechte. Aktuell ist keine reale Ersatzquelle freigegeben; die neue Adapter-Grenze blockiert ohne diese Evidenz.
- Der Mobile-Score wird lokal aus dem aus Finance migrierten `crypto-technical-provenance/0.7.0`-Kern berechnet.
- Sentiment bleibt Presentation/Evidence und verändert den Score nicht.
- NATS JetStream und Valkey/Redis bleiben serverseitig. Broker-Secrets werden niemals in APK oder Web-Bundle übernommen.

## Quellen

- Finance-Baseline: `SvenKulessa/Finance@dcef421fe6e350a3a2ade61d0299aad9ecca213c`
- Capital-AI-Baseline: `SvenKulessa/Capital-AI@fbb67ca0b3e08cdeeaf9835b09ca7af06b6230d7`
- Mobile-Baseline vor Migration: `SvenKulessa/Capital-AI-Mobile@3bf21cd5c76083324a68f8b6182c3e1f03d56e9b`

## Build

```text
gradle -p android :app:assembleDebug :app:assembleRelease
```

Die Release-APK wird außerhalb von Git mit dem bestehenden Owner-Key signiert. Keine Keystores oder Passwörter gehören in dieses Repository.

## Release und OSS-Provider

Siehe `docs/RELEASE_SIGNING.md` und `docs/OSS_PROVIDER_DECISION.md`. Die APK-Freigabe bleibt bis zum realen Daten-, Top-400- und Signing-Nachweis blockiert.
