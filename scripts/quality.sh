#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p evidence
failed=0
: >evidence/quality-gates.txt
record(){
  printf '%s=%s\n' "$1" "$2" | tee -a evidence/quality-gates.txt
  if [[ "$2" != PASS ]]; then
    failed=1
    if [[ "${GITHUB_ACTIONS:-false}" == true ]]; then
      printf '::error title=Mobile Gate %s::%s fehlgeschlagen; siehe mobile-quality-diagnostics.\n' "$1" "$1"
    fi
  fi
}
if node --test tests/*.test.mjs | tee evidence/unit-tests.txt; then record UNIT PASS; else record UNIT FAIL; fi
python3 -m http.server 4173 --bind 127.0.0.1 --directory web >evidence/browser-server.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT
for i in {1..30}; do
  if curl -fsS http://127.0.0.1:4173/ >/dev/null 2>&1; then break; fi
  sleep 0.2
done
chrome="${CHROME_BIN:-$(command -v chromium || command -v chromium-browser || true)}"
browser_ok=false
if [[ -x "$chrome" ]] && timeout --kill-after=5s 30s "$chrome" --headless=new --no-sandbox --disable-gpu --virtual-time-budget=8000 --dump-dom 'http://127.0.0.1:4173/?emulate=1' >evidence/browser-emulation.html 2>evidence/browser-stderr.log; then
  browser_ok=true
  for gate in login data score quality; do
    if ! grep -Fq "data-$gate=\"PASS\"" evidence/browser-emulation.html; then browser_ok=false; fi
  done
fi
if [[ "$browser_ok" == true ]]; then record BROWSER PASS; else record BROWSER FAIL; fi
if node scripts/live-contracts.mjs >evidence/live-contracts.log 2>&1; then record LIVE_CONTRACTS PASS; else record LIVE_CONTRACTS FAIL; fi
if "${TRIVY_BIN:-trivy}" fs --scanners secret,misconfig --severity HIGH,CRITICAL --exit-code 1 --skip-dirs .git --skip-dirs android/app/build --skip-dirs android/build --skip-dirs evidence . >evidence/source-scan.txt 2>&1; then record SOURCE_SCAN PASS; else record SOURCE_SCAN FAIL; fi
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    printf '### Mobile Quality Gates\n\n```text\n'
    cat evidence/quality-gates.txt
    printf '```\n\nLive-Daten erfordern belegte OSS- und kommerzielle Datenrechte. Fixtures ersetzen keine Quellenfreigabe.\n'
  } >>"$GITHUB_STEP_SUMMARY"
fi
exit "$failed"
