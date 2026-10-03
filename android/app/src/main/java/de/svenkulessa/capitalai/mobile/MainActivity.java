package de.svenkulessa.capitalai.mobile;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.util.Base64;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.List;
import java.util.Map;

public final class MainActivity extends Activity {
  private static final String LOCAL_HOST="app.capital-ai.local";
  private static final String LOCAL_URL="https://"+LOCAL_HOST+"/index.html";
  private static final String APP_ORIGIN="https://capital-ai.online";
  private static final SecureRandom RANDOM=new SecureRandom();
  private WebView webView;

  private static String b64(byte[] v){return Base64.encodeToString(v,Base64.URL_SAFE|Base64.NO_WRAP|Base64.NO_PADDING);}
  private static String verifier(){byte[] b=new byte[32];RANDOM.nextBytes(b);return b64(b);}
  private static String challenge(String v){try{return b64(MessageDigest.getInstance("SHA-256").digest(v.getBytes(StandardCharsets.US_ASCII)));}catch(Exception e){throw new IllegalStateException(e);}}

  private SharedPreferences prefs(){return getSharedPreferences("mobile_auth",MODE_PRIVATE);}
  private void startLogin(){
    String v=verifier();
    prefs().edit().putString("verifier",v).putLong("created",System.currentTimeMillis()).apply();
    Uri target=Uri.parse(APP_ORIGIN+"/api/auth/mobile-login").buildUpon().appendQueryParameter("challenge",challenge(v)).build();
    startActivity(new Intent(Intent.ACTION_VIEW,target));
  }

  private boolean allowed(Uri u,String method){
    if(u==null||!"https".equals(u.getScheme()))return false;
    String h=u.getHost(),p=u.getPath()==null?"":u.getPath();
    if("capital-ai.online".equals(h))return "GET".equals(method)&&p.equals("/api/auth/session");
    if(!"GET".equals(method))return false;
    return ("api.binance.com".equals(h)&&p.equals("/api/v3/klines"))
      ||("api.coinpaprika.com".equals(h)&&(p.equals("/v1/tickers")||p.matches("^/v1/tickers/[a-z0-9-]+/historical$")))
      ||("api.alternative.me".equals(h)&&p.startsWith("/fng"));
  }

  private byte[] readBounded(InputStream in,int max)throws Exception{
    if(in==null)return new byte[0];ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] buf=new byte[8192];int total=0,n;
    while((n=in.read(buf))!=-1){total+=n;if(total>max)throw new IllegalStateException("response_too_large");out.write(buf,0,n);}return out.toByteArray();
  }

  private void setCookies(HttpURLConnection c,String origin){
    Map<String,List<String>> hs=c.getHeaderFields();if(hs==null)return;
    for(Map.Entry<String,List<String>> e:hs.entrySet()){if(e.getKey()!=null&&"set-cookie".equalsIgnoreCase(e.getKey()))for(String v:e.getValue())CookieManager.getInstance().setCookie(origin,v);}
    CookieManager.getInstance().flush();
  }

  private final class Bridge {
    @JavascriptInterface public void login(){runOnUiThread(MainActivity.this::startLogin);}
    @JavascriptInterface public void request(String id,String method,String rawUrl,String body){
      new Thread(()->{
        int status=599;String response="request_failed";
        try{
          String m=String.valueOf(method).toUpperCase();Uri uri=Uri.parse(rawUrl);
          if(!allowed(uri,m))throw new SecurityException("blocked_url");
          HttpURLConnection c=(HttpURLConnection)new URL(rawUrl).openConnection();c.setInstanceFollowRedirects(false);c.setConnectTimeout(7000);c.setReadTimeout(9000);c.setRequestMethod(m);c.setRequestProperty("Accept","application/json");c.setRequestProperty("User-Agent","Capital-AI-Mobile/0.2");
          String cookie=CookieManager.getInstance().getCookie(rawUrl);if(cookie!=null&&!cookie.isBlank())c.setRequestProperty("Cookie",cookie);
          if("POST".equals(m)){byte[] bytes=(body==null?"":body).getBytes(StandardCharsets.UTF_8);if(bytes.length>65536)throw new SecurityException("body_too_large");c.setDoOutput(true);c.setRequestProperty("Content-Type","application/json");c.getOutputStream().write(bytes);}
          status=c.getResponseCode();setCookies(c,uri.getScheme()+"://"+uri.getHost());InputStream in=status>=400?c.getErrorStream():c.getInputStream();response=new String(readBounded(in,10*1024*1024),StandardCharsets.UTF_8);c.disconnect();
        }catch(Exception e){response=e.getClass().getSimpleName();}
        final int s=status;final String r=response;webView.post(()->webView.evaluateJavascript("window.CapitalAIReceive("+JSONObject.quote(id)+","+s+","+JSONObject.quote(r)+")",null));
      }).start();
    }
  }

  private WebResourceResponse local(WebResourceRequest request){
    Uri u=request.getUrl();if(!LOCAL_HOST.equals(u.getHost()))return null;String path=u.getPath();if(path==null||"/".equals(path))path="/index.html";if(path.contains(".."))return new WebResourceResponse("text/plain","utf-8",null);
    String mime=path.endsWith(".js")?"text/javascript":path.endsWith(".css")?"text/css":"text/html";
    try{return new WebResourceResponse(mime,"utf-8",getAssets().open("www"+path));}catch(Exception e){return new WebResourceResponse("text/plain","utf-8",null);}
  }

  @SuppressLint({"SetJavaScriptEnabled","AddJavascriptInterface"})
  @Override protected void onCreate(Bundle state){
    super.onCreate(state);webView=new WebView(this);setContentView(webView);
    CookieManager.getInstance().setAcceptCookie(true);CookieManager.getInstance().setAcceptThirdPartyCookies(webView,false);
    webView.getSettings().setJavaScriptEnabled(true);webView.getSettings().setDomStorageEnabled(false);webView.getSettings().setAllowFileAccess(false);webView.getSettings().setAllowContentAccess(false);webView.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW);webView.getSettings().setSafeBrowsingEnabled(true);
    webView.addJavascriptInterface(new Bridge(),"CapitalAI");
    webView.setWebViewClient(new WebViewClient(){
      @Override public WebResourceResponse shouldInterceptRequest(WebView v,WebResourceRequest r){return local(r);}
      @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return !LOCAL_HOST.equals(r.getUrl().getHost());}
      @Override public void onReceivedSslError(WebView v,SslErrorHandler h,SslError e){h.cancel();}
    });
    if(state==null)webView.loadUrl(LOCAL_URL);handleIntent(getIntent());
  }

  private void handleIntent(Intent intent){
    Uri u=intent==null?null:intent.getData();if(u==null||!"capitalai-private".equals(u.getScheme())||!"auth".equals(u.getHost())||!"/callback".equals(u.getPath()))return;
    String code=u.getQueryParameter("code"),v=prefs().getString("verifier",null);long created=prefs().getLong("created",0);
    prefs().edit().clear().apply();
    if(code==null||!code.matches("[A-Za-z0-9_-]{43}")||v==null||System.currentTimeMillis()-created>600000){webView.loadUrl(LOCAL_URL);return;}
    new Thread(()->{
      try{
        URL url=new URL(APP_ORIGIN+"/api/auth/mobile-exchange");HttpURLConnection c=(HttpURLConnection)url.openConnection();c.setInstanceFollowRedirects(false);c.setConnectTimeout(7000);c.setReadTimeout(9000);c.setRequestMethod("POST");c.setDoOutput(true);c.setRequestProperty("Content-Type","application/x-www-form-urlencoded");
        String body="code="+URLEncoder.encode(code,StandardCharsets.UTF_8)+"&verifier="+URLEncoder.encode(v,StandardCharsets.UTF_8);c.getOutputStream().write(body.getBytes(StandardCharsets.UTF_8));
        int status=c.getResponseCode();setCookies(c,APP_ORIGIN);c.disconnect();webView.post(()->webView.loadUrl(LOCAL_URL+(status==303?"?auth=ok":"?auth=failed")));
      }catch(Exception e){webView.post(()->webView.loadUrl(LOCAL_URL+"?auth=failed"));}
    }).start();
  }

  @Override protected void onNewIntent(Intent intent){super.onNewIntent(intent);setIntent(intent);handleIntent(intent);}
  @Override public void onBackPressed(){if(webView!=null&&webView.canGoBack())webView.goBack();else super.onBackPressed();}
  @Override protected void onDestroy(){if(webView!=null){webView.removeJavascriptInterface("CapitalAI");webView.stopLoading();webView.destroy();webView=null;}super.onDestroy();}
}
