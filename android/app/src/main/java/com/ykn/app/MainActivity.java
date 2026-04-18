package com.ykn.app;

import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        
        // Anti-Redirect Protection for APK
        WebView webView = getBridge().getWebView();
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                
                // Only allow top-level navigation to our own domains
                if (url.contains("diaww.my.id") || url.startsWith("capacitor://") || url.startsWith("http://localhost")) {
                    return false; // Let Capacitor handle it
                }
                
                // Block all other top-level redirects (ads, hijackers, etc.)
                return true; 
            }
        });
    }
}
