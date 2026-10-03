import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const native=fs.readFileSync('android/app/src/main/java/de/svenkulessa/capitalai/mobile/MainActivity.java','utf8');
test('native asset route resolves every bundled web entry without a missing www prefix',()=>{
  assert.match(native,/getAssets\(\)\.open\(path\.substring\(1\)\)/);
  for(const name of ['index.html','app.js','scoring.js','providers.js','market-adapter.js','styles.css'])assert.ok(fs.statSync('web/'+name).isFile());
});
test('minSdk 26 login path avoids Android 33-only string and encoding overloads',()=>{
  assert.doesNotMatch(native,/\.isBlank\(|URLEncoder\.encode\([^,]+,StandardCharsets/);
  assert.match(native,/URLEncoder\.encode\(code,"UTF-8"\)/);
  assert.match(native,/URLEncoder\.encode\(v,"UTF-8"\)/);
});
