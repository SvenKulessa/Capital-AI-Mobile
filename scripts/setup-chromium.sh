#!/usr/bin/env bash
set -euo pipefail
# Official OSS Chromium snapshot, fixed revision + verified artifact digest.
readonly revision=1710771
readonly digest=e6a9a0162eb740a97b97deb17dc3baf729dfdcf8f0127fb6091f15b70b3b0f35
: "${RUNNER_TEMP:?Runner temporary directory required}"
target="$RUNNER_TEMP/capital-ai-mobile-chromium"
mkdir -p "$target"
curl --fail --silent --show-error --location --max-time 180 \
  "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/$revision/chrome-linux.zip" \
  --output "$target/chromium.zip"
printf '%s  %s\n' "$digest" "$target/chromium.zip" | sha256sum --check
unzip -q -o "$target/chromium.zip" -d "$target"
chmod +x "$target/chrome-linux/chrome" "$target/chrome-linux/chrome_crashpad_handler" "$target/chrome-linux/chrome_sandbox"
printf 'CHROME_BIN=%s\n' "$target/chrome-linux/chrome" >>"$GITHUB_ENV"
