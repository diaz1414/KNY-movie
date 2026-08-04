package com.ykn.app;

import android.app.AlertDialog;
import android.content.Intent;
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
    private static final String AD_REDIRECT_HOST = "www.effectivecpmnetwork.com";
    private static final String AD_REDIRECT_PATH = "/iadikppi";
    private static final String AD_REDIRECT_KEY = "1ef3c31f6d59e0b786859466ce1bb939";
    private static final String AD_REDIRECT_URL = "https://" + AD_REDIRECT_HOST + AD_REDIRECT_PATH + "?key=" + AD_REDIRECT_KEY;
    private static boolean androidSessionAdGatePassed = false;

    private boolean androidSessionAdGateShowing = false;
    
    private static final List<String> AD_DOMAINS = Arrays.asList(
        "adsterra.com", "doubleclick.net", "googlesyndication.com",
        "google-analytics.com", "highperformanceformat.com", "popads.net",
        "popcash.net", "exoclick.com", "juicyads.com", "onclickperformance.com",
        "propellerads.com", "creative.ak.kickads.com", "adservice.google",
        "effectivecpmnetwork.com"
    );

    private boolean isAllowedAppUrl(String url) {
        if (url.startsWith("capacitor://") || url.startsWith("http://localhost")) {
            return true;
        }

        String host = Uri.parse(url).getHost();
        return host != null && (
            host.equals("movies.ykn.my.id") ||
            host.endsWith(".movies.ykn.my.id") ||
            host.endsWith(".ykn.my.id") ||
            host.equals("diaww.my.id") ||
            host.endsWith(".diaww.my.id")
        );
    }

    private boolean isAllowedAdRedirectUrl(String url) {
        Uri uri = Uri.parse(url);
        String host = uri.getHost();
        String path = uri.getPath();
        String key = uri.getQueryParameter("key");

        return "https".equalsIgnoreCase(uri.getScheme()) &&
            AD_REDIRECT_HOST.equalsIgnoreCase(host) &&
            AD_REDIRECT_PATH.equals(path) &&
            AD_REDIRECT_KEY.equals(key);
    }

    private boolean isBlockedAdUrl(String url) {
        String normalizedUrl = url.toLowerCase();
        for (String domain : AD_DOMAINS) {
            if (normalizedUrl.contains(domain)) {
                return true;
            }
        }

        return false;
    }

    private void openExternalUrl(String url) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (Exception ignored) {
            // If Android cannot find a handler, keep the app on the current screen.
        }
    }

    private boolean handleUrlOverride(String url, boolean isMainFrame) {
        if (isAllowedAppUrl(url)) {
            return false;
        }

        if (isAllowedAdRedirectUrl(url) || isBlockedAdUrl(url)) {
            return true;
        }

        return isMainFrame;
    }

    private void showAndroidSessionAdGate(WebView webView) {
        if (androidSessionAdGatePassed || androidSessionAdGateShowing || isFinishing()) {
            return;
        }

        androidSessionAdGateShowing = true;
        webView.setVisibility(View.INVISIBLE);

        new AlertDialog.Builder(this)
            .setTitle("YKN Movie")
            .setMessage("Tekan OK untuk membuka sponsor sekali sebelum masuk.")
            .setCancelable(false)
            .setPositiveButton("OK", (dialog, which) -> {
                androidSessionAdGatePassed = true;
                androidSessionAdGateShowing = false;
                webView.setVisibility(View.VISIBLE);
                openExternalUrl(AD_REDIRECT_URL);
            })
            .show();
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        
        WebView webView = getBridge().getWebView();
        if (webView == null) {
            return;
        }
        
        // Anti-Redirect & Ad Blocker
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                return handleUrlOverride(url, request.isForMainFrame());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrlOverride(url, true);
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (isBlockedAdUrl(url)) {
                    return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream("".getBytes()));
                }
                return super.shouldInterceptRequest(view, request);
            }
        });

        showAndroidSessionAdGate(webView);

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
