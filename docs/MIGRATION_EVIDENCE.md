# Mobile Scorer Migration Evidence — 2026-10-03

## Baselines
- Mobile before cleanup: `3bf21cd5c76083324a68f8b6182c3e1f03d56e9b`
- Capital-AI source progress: `fbb67ca0b3e08cdeeaf9835b09ca7af06b6230d7`
- Finance scoring source: `dcef421fe6e350a3a2ade61d0299aad9ecca213c`

## Finance security preflight
The first dependency pass observed 3 npm advisories: 1 low, 1 moderate and 1 high.
- HIGH: `nodemailer` address-parser DoS advisories.
- MODERATE: `multer` orphaned-disk-write DoS.
- Neither package is imported by the migrated scoring boundary and neither dependency exists in this Mobile runtime.
- The Finance scan also records the optional `lightningcss-linux-x64-musl` npm-ls platform mismatch separately instead of misclassifying it as a scoring vulnerability.

Migration is fail-closed on critical findings or any new HIGH package that crosses the selected scoring boundary.

## What moved from Finance
The APK projection preserves:
- `crypto-technical-provenance/0.7.0`
- nominal weights from `crypto-technical-weights/0.7.0`
- dynamic weight renormalization for missing evidenced factors
- inverted `data_quality_risk`
- trend, momentum, volatility-quality, breakout, RSI, liquidity and supply calculations
- decision thresholds and fail-closed availability semantics
- UAI-style identity and canonical result metadata

Sentiment remains display/evidence only and has zero scoring weight.

## What moved from Capital-AI
- external-browser Mobile OIDC / PKCE transfer contract
- HTTPS-only WebView hardening
- private Android package identity
- server-score drift comparison contract
- Top-400 private-research universe semantics

NATS/Valkey code is not copied into the APK. The APK contains no broker credentials.

## Removed from old Mobile baseline
The previous root `src/*` implementation and `migrations/0002_audit.sql` are deleted. Their useful technical ideas were reimplemented inside the new self-contained mobile bundle. No detached SQL/database surface remains.
