# Mobile Release 0.2.0 — Prüfnachweis und Freigabesperre

**Status: BLOCKED / keine freigegebene APK.**

Basis main `2a86e7532cf1a78f96dc4994ba19c3d622e985cb` ist exakt der Merge von
Mobile-PR #1 mit Head `f50e27a6d3dc4c756ff39487bddfcff451348149`.
Zwischen PR-Head und Merge-Tree besteht kein Inhaltsdiff.
Die hier geprüfte APK enthielt die Arbeitsänderungen dieses PR; eine Release-APK
vom späteren main muss nach Human-Merge erneut gebaut und geprüft werden.

| Gate | Ergebnis |
| --- | --- |
| Package `de.svenkulessa.capitalai.mobile` | PASS, aus unsigned APK via aapt2 |
| versionName `0.2.0-mobile`, versionCode `2`, minSdk `26` | PASS |
| `assembleRelease` | PASS |
| `lintRelease` | PASS: 0 Fehler, 1 bestehende Warnung zum fehlenden App-Icon |
| ZIP-/Web-Bundle-Integrität und nicht debuggable | PASS |
| Bestehender PKCS12-Key vs bestehendes Release-Zertifikat | PASS |
| `zipalign -P 16` vor Signierung | PASS |
| ausschließlich Android `apksigner` | PASS |
| Signature Scheme v1 / v2 / v3 / v4 | false / true / true / false |
| `apksigner verify --verbose --print-certs` | PASS, genau 1 Signer |
| Fingerprint-Abgleich | PASS |
| Alignment nach Signierung | PASS |
| SHA-256 des signierten Kandidaten | Erzeugt; Kandidat wegen Qualitätsfehler entfernt |
| erneute Mobile-/Scoring-/Adapter-Unit-Tests | PASS, 12/12 |
| erneuter Source Secret Scan HIGH/CRITICAL | PASS |
| APK Secret Scan HIGH/CRITICAL | PASS |
| Chromium Browser-Emulation nach Signierung | BLOCKED/FAIL in lokaler eingeschränkter Umgebung |
| Auth-Konfiguration und Mobile-Login-HTTPS-Redirect | PASS |
| vollständige interaktive Anmeldung auf Android | NOT_TESTED |
| reales Top-400-/Marktdaten-Gate | BLOCKED: OSS_PROVIDER_ADMISSION_REQUIRED |
| finale APK-Freigabe | BLOCKED, Kandidaten-APK automatisch entfernt |
| Deployment / Änderung produktiver Secrets | Nicht durchgeführt |

Fester Zertifikat-Fingerprint SHA-256:

`BE78F7D0774ECCF322EB560B2B2131D35D87D14F1FBB25B92F3542A7D7042006`

Kein neuer Key wurde erzeugt. Key und Passwort wurden ausschließlich außerhalb
des Git-Checkout in einem privaten Verzeichnis mit 0700/0600 verarbeitet.
Keine Key-/Passwortdatei ist Teil dieses PR oder eines Upload-Artefakts.

## Korrigierte Release-Fehler

- Native Web-Asset-Route suchte `www/`, während Gradle direkt unter `assets/`
  packt. APK-Asset-Vergleich prüft nun das tatsächlich gebaute Bundle.
- API-26-Kompatibilität: String.isBlank und URLEncoder Charset-Overload ersetzt.
- Android 16 Back-Gesture: OnBackPressedDispatcher mit stabilem AndroidX 1.13.0.
- Locale.ROOT für HTTP-Methoden; Cloud-/Device-Transfer-Backup explizit ausgeschlossen.
- Signierung nutzt dieselbe PKCS12-Identity, Passwort-Datei und v2/v3;
  alle Qualitätsgates werden erneut ausgeführt, bevor irgendein APK-Upload erfolgt.

## Tatsächliche Blocker

1. OSS-Datenquelle mit belegter Software-/Datenlizenz, Quellenkette, realem
   Asset-Universe und OHLCV ist noch nicht vorhanden. Ein eigener Adapter wurde
   gewählt und als validierende Grenze vorbereitet; kein neuer Service deployt.
2. Chromium scheitert hier an eingeschränkten System-/Unix-Socket-Funktionen.
   Ein früherer Google-Chrome-Lauf mit der alten Provider-Fassung war PASS,
   zählt jedoch ausdrücklich nicht als Nachweis dieser OSS-Fassung.
3. Eine echte interaktive Android-OIDC-Anmeldung wurde nicht durchgeführt.
4. GitHub Signing-Secrets wurden nicht eingerichtet oder geändert. Zukünftiger
   Release-Workflow blockiert bei fehlenden Werten und läuft nur manuell auf main.

Die Freigabesperre wurde getestet: Signatur-/Alignmentprüfungen waren erfolgreich,
anschließende Browser-/Live-Daten-Fehler führten zum Entfernen von APK und
SHA256SUMS-Freigabedatei. Es wird keine fehlerhafte APK als Release ausgeliefert.

## Nächste verifizierbare Schritte

- Blueprint aus `OSS_PROVIDER_DECISION.md` gegen konkrete offene Datenquellen
  schließen und Quoten, echte Historie, Supply/Volumen, Top-400 und Replay messen.
- Chromium-QA auf einem geeigneten Runner sowie echte Android-Anmeldung prüfen.
- Human-Merge; vorhandenen Signing-Key bei separat autorisierter Secret-Einrichtung
  in die zwei definierten Actions Secrets übernehmen, niemals einen neuen Key.
- Workflow auf dem dann aktuellen main starten; endgültige APK nur nach PASS
  aller Gates mit neuem SHA-256 bereitstellen.
