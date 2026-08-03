package com.ykn.app;

import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import com.getcapacitor.BridgeActivity;
import java.io.ByteArrayInputStream;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends BridgeActivity {
    
    private static final List<String> AD_DOMAINS = Arrays.asList(
        "adsterra.com", "doubleclick.net", "googlesyndication.com",
        "google-analytics.com", "highperformanceformat.com", "popads.net",
        "popcash.net", "exoclick.com", "juicyads.com", "onclickperformance.com",
        "propellerads.com", "creative.ak.kickads.com", "adservice.google"
    );

    private boolean isAllowedAppUrl(String url) {
        if (url.startsWith("capacitor://") || url.startsWith("http://localhost")) {
            return true;
        }

        String host = Uri.parse(url).getHost();
        return host != null && (
            host.equals("movies.ykn.my.id") ||
            host.endsWith(".movies.ykn.my.id") ||
            host.endsWith(".ykn.my.id")
        );
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        
        WebView webView = getBridge().getWebView();
        
        // Anti-Redirect & Ad Blocker
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (isAllowedAppUrl(url)) {
                    return false;
                }
                return true; 
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString().toLowerCase();
                for (String domain : AD_DOMAINS) {
                    if (url.contains(domain)) {
                        return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream("".getBytes()));
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }
        });

        // Auto-Rotate to Landscape on Fullscreen
        webView.setWebChromeClient(new WebChromeClient() {
            private View customView;
            private WebChromeClient.CustomViewCallback customViewCallback;
            private int originalOrientation;

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) {
                    onHideCustomView();
                    return;
                }
                customView = view;
                originalOrientation = getRequestedOrientation();
                customViewCallback = callback;
                
                // Force Landscape
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
                
                ((FrameLayout) getWindow().getDecorView()).addView(customView, new FrameLayout.LayoutParams(-1, -1));
                getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                );
            }

            @Override
            public void onHideCustomView() {
                ((FrameLayout) getWindow().getDecorView()).removeView(customView);
                customView = null;
                setRequestedOrientation(originalOrientation);
                customViewCallback.onCustomViewHidden();
                getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
            }
        });
    }
}
