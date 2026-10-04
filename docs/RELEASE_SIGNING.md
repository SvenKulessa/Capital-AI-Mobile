# Private Mobile-Release und dauerhafte Update-Identität

## Unveränderliche Signing-Identity

Bestehender PKCS12-Release-Key, Alias `capital-ai-mobile-release`.
Zertifikat SHA-256:

`BE78F7D0774ECCF322EB560B2B2131D35D87D14F1FBB25B92F3542A7D7042006`

Die Identity wurde mit dem bereits vorhandenen Release-Zertifikat und dem
bestehenden Keystore abgeglichen. Kein neuer Schlüssel wird erzeugt.

Package: `de.svenkulessa.capitalai.mobile`; aktuelle Version: `0.2.0-mobile`;
versionCode: `2`; minSdk: `26`.

Für spätere Updates müssen Package und Signing-Identity gleich bleiben und der
versionCode steigen. Versionsprüfungen und Dateinamen sind dann gemeinsam zu
aktualisieren. Der Fingerprint darf dabei nicht geändert werden.

## Manuell auslösbarer Release-Workflow

`.github/workflows/mobile-release.yml` läuft ausschließlich für `main`.
Er benötigt zwei bereits eingerichtete GitHub Actions Secrets:

- `MOBILE_RELEASE_KEYSTORE_BASE64`: Base64 des **bestehenden** PKCS12-Keystores.
- `MOBILE_RELEASE_PASSWORD`: das vorhandene Keystore-/Key-Passwort.

Diese Änderung legt keine Secrets an, rotiert keine Keys und verändert keine
produktiven Secrets. Die Einrichtung dieser Secret-Werte benötigt eine separate
Owner-Freigabe. Fehlende Werte blockieren die Freigabe.

Der Keystore wird erst nach Build und Lint außerhalb des Checkout im Runner-Temp
mit Modus 0600 dekodiert. Er wird nach Erfolg und Fehler entfernt; Gradle-Caching
ist für den Release-Job deaktiviert. Artefakte verwenden eine explizite Allowlist
und enthalten weder Key noch Passwort. Shell-Tracing bleibt abgeschaltet.

## Freigabegates

1. Unit Tests, Browser-Emulation und Live-API-Verträge; Source Secret Scan.
2. `assembleRelease` und `lintRelease` mit Gradle 8.13, Java 17, AGP 8.13.2,
   compileSdk 36, Android Build Tools 36.0.0.
3. Android `aapt2` überprüft die unsigned APK; ZIP-Integrität, Version,
   Package, minSdk und tatsächliche Web-Assets werden geprüft.
4. Fingerprint des bestehenden Keys muss exakt der festen Identity entsprechen.
5. `zipalign -P 16` vor `apksigner`; v2/v3 an, v1/v4 aus.
6. `apksigner verify --verbose --print-certs`, genau ein Signer mit dem festen
   Fingerprint und Prüfung der vier Signature-Scheme-Flags.
7. Alignment erneut prüfen, entpackte APK auf Secrets scannen, SHA-256 erzeugen.
8. Unit Tests, Browser-Emulation, Live-Auth-/Datenverträge und Source Secret Scan
   erneut ausführen; SHA-256 danach erneut abgleichen.
9. Nur bei vollständigem Erfolg APK und öffentliche Prüfnachweise hochladen.

Browser-Emulation prüft UI/Login-Status/Daten/Scoring mit Testdaten. Live-Auth-Gates
prüfen konfigurierte Session und HTTPS-Weiterleitung des Mobile-Login-Endpoints.
Sie ersetzen keine interaktive Anmeldung mit einem echten Benutzer und keinen
Android-Geräte-/Instrumentierungstest. Es gibt aktuell keine zugelassene OSS-Marktdatenquelle. Der reale
Multi-Asset-/Kursdaten-Gate blockiert die APK-Freigabe ausdrücklich.

Der Workflow erstellt weder einen öffentlichen GitHub Release noch ein Deployment.
Bitidentische Builds auf unterschiedlichen Runnern sind durch die festgelegte
Signing-Identity allein nicht nachgewiesen; SHA-256 und Source-Commit kennzeichnen
jede konkret geprüfte APK.

## Aktualisierte Asset-Authority (2026-10-04)

`docs/MOBILE_MARKET_POLICY.json` ersetzt die Top-400-Zielvorgabe durch den gepinnten Web-Plan: Pilot mit 20 realen Assets je Klasse; Ausbauziele 500/300/100/100/300. Perpetuals zusätzlich. Die Zahlen sind Ziele, keine aktuelle Coverage-Evidence. `scripts/live-contracts.mjs` berichtet Source-Admission, Auth und Live-Universe unabhängig; fehlende Quellen bleiben FAIL. Kein interaktiver Android-Login oder Installationsupgrade ist durch den HTTP-Redirect-Test nachgewiesen.
