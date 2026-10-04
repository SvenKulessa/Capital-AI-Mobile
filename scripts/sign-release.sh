#!/usr/bin/env bash
# No secret values on command lines or in diagnostics. Never enable shell tracing.
set +x
set -euo pipefail
umask 077
cd "$(dirname "$0")/.."
: "${ANDROID_HOME:?Android SDK required}"
: "${MOBILE_KEYSTORE_FILE:?Existing release keystore required}"
: "${MOBILE_PASSWORD_FILE:?Protected password file required}"
readonly expected='be78f7d0774eccf322eb560b2b2131d35d87d14f1fbb25b92f3542a7d7042006'
readonly bt="$ANDROID_HOME/build-tools/36.0.0"
readonly unsigned='android/app/build/outputs/apk/release/app-release-unsigned.apk'
readonly final='evidence/Capital-AI-Mobile-0.2.0-release.apk'
mkdir -p evidence
rm -f "$final" "$final.idsig" evidence/SHA256SUMS.txt
scratch=$(mktemp -d)
complete=false
cleanup() {
  rm -rf "$scratch"
  if [[ "$complete" != true ]]; then rm -f "$final" "$final.idsig" evidence/SHA256SUMS.txt; fi
}
trap cleanup EXIT
for secret_file in "$MOBILE_KEYSTORE_FILE" "$MOBILE_PASSWORD_FILE"; do
  test -f "$secret_file"
  case "$(realpath "$secret_file")" in "$(pwd)"/*) echo 'Signing material must be outside the repository' >&2; exit 1;; esac
  test "$(stat -c %a "$secret_file")" = 600
 done
# Read only the public certificate from the existing key; keytool does not sign.
keytool -exportcert -keystore "$MOBILE_KEYSTORE_FILE" -storetype PKCS12 \
  -alias capital-ai-mobile-release -storepass:file "$MOBILE_PASSWORD_FILE" \
  -file "$scratch/certificate.der" >"$scratch/keytool.log" 2>&1
actual=$(sha256sum "$scratch/certificate.der" | cut -d' ' -f1)
[[ "$actual" == "$expected" ]] || { echo 'Signing identity mismatch; release blocked' >&2; exit 1; }
"$bt/aapt2" dump badging "$unsigned" >evidence/unsigned-badging.txt
python3 - "$unsigned" <<'PY'
import re,sys,zipfile
from pathlib import Path
badging=Path('evidence/unsigned-badging.txt').read_text()
assert "package: name='de.svenkulessa.capitalai.mobile' versionCode='2' versionName='0.2.0-mobile'" in badging
assert re.search(r"^(?:sdkVersion|minSdkVersion):'26'$",badging,re.M)
assert 'application-debuggable' not in badging
with zipfile.ZipFile(sys.argv[1]) as z:
    assert z.testzip() is None
    for name in ('index.html','app.js','scoring.js','providers.js','market-adapter.js','styles.css'):
        assert z.read('assets/'+name)==Path('web',name).read_bytes(), name
    assert not any(re.search(r'(?i)\.(p12|pfx|jks|keystore|pem|key)$|signing.password',n) for n in z.namelist())
PY
if "$bt/apksigner" verify "$unsigned" >"$scratch/unsigned-verification.txt" 2>&1; then
  echo 'Input unexpectedly signed; release blocked' >&2; exit 1
fi
"$bt/zipalign" -P 16 -f -v 4 "$unsigned" "$scratch/aligned.apk" >evidence/zipalign-before.txt
"$bt/apksigner" sign --ks "$MOBILE_KEYSTORE_FILE" --ks-type PKCS12 \
  --ks-key-alias capital-ai-mobile-release \
  --ks-pass "file:$MOBILE_PASSWORD_FILE" \
  --min-sdk-version 26 --v1-signing-enabled false --v2-signing-enabled true \
  --v3-signing-enabled true --v4-signing-enabled false \
  --out "$final" "$scratch/aligned.apk"
"$bt/apksigner" verify --verbose --print-certs "$final" >evidence/signature-verification.txt
python3 - "$expected" <<'PY'
import re,sys
from pathlib import Path
s=Path('evidence/signature-verification.txt').read_text()
for scheme,enabled in [(1,False),(2,True),(3,True),(4,False)]:
    assert re.search(rf'Verified using v{scheme} scheme[^\n]*: {str(enabled).lower()}$',s,re.M), scheme
certs=re.findall(r'^Signer #\d+ certificate SHA-256 digest: ([0-9a-f]+)$',s,re.M)
assert certs==[sys.argv[1]], 'signing identity mismatch'
PY
"$bt/zipalign" -c -P 16 -v 4 "$final" >evidence/zipalign-after.txt
# Public APK contents only; decoded key/password never enter the scanning tree.
mkdir "$scratch/apk"
unzip -q "$final" -d "$scratch/apk"
"${TRIVY_BIN:-trivy}" fs --scanners secret --severity HIGH,CRITICAL --exit-code 1 "$scratch/apk" >evidence/apk-secret-scan.txt
(cd evidence && sha256sum Capital-AI-Mobile-0.2.0-release.apk | tee SHA256SUMS.txt)
# Repeat all quality gates AFTER signing; artifact upload only follows success.
./scripts/quality.sh
(cd evidence && sha256sum --check SHA256SUMS.txt)
git rev-parse HEAD >evidence/SOURCE_COMMIT.txt
complete=true
