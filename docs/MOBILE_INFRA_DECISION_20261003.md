# Mobile: aktueller Abgleich und offene Entscheidungen

Aktualisiert am 2026-10-04. TRUST: Signing, Rechte und Release-Gates; MARKET: Quellen und Asset-Coverage; PLATFORM: Infrastruktur; PRODUCT: zusätzliche Multi-Asset-Oberflächen und Scorer.

## Erneut verifizierte Repository-Authority

- Mobile main `2a86e7532cf1a78f96dc4994ba19c3d622e985cb`; kein Tree-Diff zum gemergten PR #1 (`f50e27a`). Keine AGENTS.md im Mobile-Repository.
- PR #2 wurde offen, nicht gemergt und konfliktfrei gelesen; Head `bc76468` vor diesem Follow-up.
- Web main und AGENTS.md wurden erneut gelesen: `SvenKulessa/Capital-AI@3c8cd0d4fa1745d60282132de48f722f48857fcb`.
- Die ausdrückliche Owner-Anweisung übernimmt die Web-Assetzahlen und Quellenvorgaben. Die gepinnte Projektion liegt in `MOBILE_MARKET_POLICY.json`, einschließlich Quellenhashes, Kandidaten, Sperrstatus, Perpetual- und kommerziellen Regeln. Der Plan enthält ältere Baseline-Refs; diese wurden erhalten und nicht als aktueller Web-main ausgegeben.
- Die generischen Provider-Registry-Defaults des Web-Repos sind keine kommerzielle Freigabe. Binance und CoinGecko bleiben in Mobile ausgeschlossen. Die zehn Benchmark-Kandidaten sind keine zehn aktivierten Datenprovider.

## Cache-Entscheidung

Statisches Client-Caching ist aktiviert: WebView LOAD_DEFAULT; die sechs gebündelten Dateien sind erlaubt; JS/CSS private max-age=86400, HTML no-cache; Installationsänderung invalidiert den Cache. Unbekannte lokale Pfade, falsche Schemes/Ports und Userinfo werden mit 404/no-store abgewiesen. Auth-/API-Zugriffe bleiben no-store; DOM-Speicher ist deaktiviert. Marktdaten-Caching und Valkey sind für Mobile nicht aktiviert. Die frühere Aussage „Client-Caching deaktiviert“ ist superseded.

## Infrastruktur und verbleibende Grenzen

Keine Services, NATS-Accounts, Secrets oder Supabase-Projekte wurden eingerichtet. Die früheren Service-Metadaten wurden in diesem Lauf nicht erneut gelesen und gelten hier nicht als aktuelle Runtime-Evidence. Eine zusätzliche Mobile-Instanz, eigene Supabase-Auth oder neue HTTPS-API bleiben eigenständige PLATFORM-/Auth-Architekturentscheidungen mit Owner-Dialog. Der vorhandene Mobile-OIDC-Transfer bleibt bestehen.

Die vorhandene UI und der Finance-Kernel unterstützen Krypto. Weitere Assetklassen sind Zielvorgaben; vorhandene Perpetuals werden nicht als Spot oder Ersatzinstrumente gezählt. Für alle Quellen fehlen reale kommerzielle Zulassung, ein freigegebenes Instrumentmanifest und Live-Coverage. Fixtures zählen nicht als reale Assets.

## Release

Bestehende Package-/Key-Identity und versionCode 2 bleiben maßgeblich. Kein neuer Key. Historische Signing-PASS-Werte ersetzen keinen neuen Build, eine reale Updateinstallation oder den Nachweis des aktuellen Heads. Die Freigabe bleibt bei fehlender Quelle gesperrt; der Main-only-Release-Workflow darf nicht zum Umgehen der Sperre geändert werden.
