package com.ykn.app;

import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;
import java.io.ByteArrayInputStream;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends BridgeActivity {
    
    // Ad-blocking domain list (Basic common ones)
    private static final List<String> AD_DOMAINS = Arrays.asList(
        "adsterra.com",
        "doubleclick.net",
        "googlesyndication.com",
        "google-analytics.com",
        "highperformanceformat.com",
        "popads.net",
        "popcash.net",
        "exoclick.com",
        "juicyads.com",
        "onclickperformance.com",
        "propellerads.com",
        "creative.ak.kickads.com",
        "adservice.google"
    );

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        
        WebView webView = getBridge().getWebView();
        webView.setWebViewClient(new WebViewClient() {
            
            // Layer 1: Block top-level redirects (hijacking)
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.contains("diaww.my.id") || url.startsWith("capacitor://") || url.startsWith("http://localhost")) {
                    return false;
                }
                return true; 
            }

            // Layer 2: Network-level Ad Blocker (Like Brave)
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString().toLowerCase();
                
                for (String domain : AD_DOMAINS) {
                    if (url.contains(domain)) {
                        // Return an empty response to block the request
                        return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream("".getBytes()));
                    }
                }
                
                return super.shouldInterceptRequest(view, request);
            }
        });
    }
}
