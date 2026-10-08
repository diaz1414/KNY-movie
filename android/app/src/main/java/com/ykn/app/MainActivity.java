package com.ykn.app;

import android.app.Dialog;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import com.getcapacitor.BridgeWebViewClient;
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
    private SafeBridgeWebChromeClient safeWebChromeClient;
    
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

    private int dp(float value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private GradientDrawable roundedBackground(int color, float radiusDp) {
        GradientDrawable background = new GradientDrawable();
        background.setColor(color);
        background.setCornerRadius(dp(radiusDp));
        return background;
    }

    private TextView createDialogText(String text, float sizeSp, int color, int style) {
        TextView view = new TextView(this);
        view.setText(text);
        view.setTextSize(sizeSp);
        view.setTextColor(color);
        view.setGravity(Gravity.CENTER);
        view.setTypeface(Typeface.DEFAULT, style);
        view.setIncludeFontPadding(true);
        return view;
    }

    private void showAndroidSessionAdGate(WebView webView) {
        if (androidSessionAdGatePassed || androidSessionAdGateShowing || isFinishing()) {
            return;
        }

        androidSessionAdGateShowing = true;
        webView.setVisibility(View.INVISIBLE);

        Dialog dialog = new Dialog(this);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        dialog.setCancelable(false);

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setGravity(Gravity.CENTER_HORIZONTAL);
        card.setPadding(dp(26), dp(28), dp(26), dp(24));

        GradientDrawable cardBackground = new GradientDrawable(
            GradientDrawable.Orientation.TOP_BOTTOM,
            new int[] { Color.rgb(18, 18, 22), Color.rgb(5, 5, 8) }
        );
        cardBackground.setCornerRadius(dp(28));
        cardBackground.setStroke(dp(1), Color.argb(95, 229, 9, 20));
        card.setBackground(cardBackground);

        TextView logo = createDialogText("YKN", 22, Color.WHITE, Typeface.BOLD);
        GradientDrawable logoBackground = roundedBackground(Color.rgb(229, 9, 20), 20);
        logo.setBackground(logoBackground);
        LinearLayout.LayoutParams logoParams = new LinearLayout.LayoutParams(dp(72), dp(58));
        logoParams.bottomMargin = dp(18);
        card.addView(logo, logoParams);

        TextView title = createDialogText("Continue to YKN", 24, Color.WHITE, Typeface.BOLD);
        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        titleParams.bottomMargin = dp(10);
        card.addView(title, titleParams);

        TextView message = createDialogText(
            "Please open our sponsor once to start this app session.",
            15,
            Color.argb(210, 255, 255, 255),
            Typeface.NORMAL
        );
        message.setLineSpacing(dp(2), 1.0f);
        LinearLayout.LayoutParams messageParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        messageParams.bottomMargin = dp(20);
        card.addView(message, messageParams);

        TextView note = createDialogText(
            "After that, player redirects stay blocked until you restart the app.",
            12,
            Color.argb(135, 255, 255, 255),
            Typeface.NORMAL
        );
        note.setLineSpacing(dp(2), 1.0f);
        LinearLayout.LayoutParams noteParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        noteParams.bottomMargin = dp(22);
        card.addView(note, noteParams);

        TextView button = createDialogText("OPEN SPONSOR", 14, Color.WHITE, Typeface.BOLD);
        button.setLetterSpacing(0.08f);
        button.setPadding(dp(18), dp(15), dp(18), dp(15));
        GradientDrawable buttonBackground = roundedBackground(Color.rgb(229, 9, 20), 999);
        button.setBackground(buttonBackground);
        button.setOnClickListener(view -> {
            androidSessionAdGatePassed = true;
            androidSessionAdGateShowing = false;
            webView.setVisibility(View.VISIBLE);
            dialog.dismiss();
            openExternalUrl(AD_REDIRECT_URL);
        });
        LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        card.addView(button, buttonParams);

        dialog.setContentView(card);
        dialog.setOnCancelListener(cancelledDialog -> {
            androidSessionAdGateShowing = false;
            if (!androidSessionAdGatePassed) {
                webView.setVisibility(View.INVISIBLE);
            }
        });
        dialog.show();

        Window window = dialog.getWindow();
        if (window != null) {
            window.setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
            WindowManager.LayoutParams attrs = window.getAttributes();
            attrs.dimAmount = 0.86f;
            window.setAttributes(attrs);
            window.addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
            int width = Math.min(getResources().getDisplayMetrics().widthPixels - dp(42), dp(430));
            window.setLayout(width, WindowManager.LayoutParams.WRAP_CONTENT);
        }
    }

    private class SafeBridgeWebViewClient extends BridgeWebViewClient {
        public SafeBridgeWebViewClient(Bridge bridge) {
            super(bridge);
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            if (request != null && request.getUrl() != null) {
                String url = request.getUrl().toString();
                if (handleUrlOverride(url, request.isForMainFrame())) {
                    return true;
                }
            }
            return super.shouldOverrideUrlLoading(view, request);
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            if (url != null && handleUrlOverride(url, true)) {
                return true;
            }
            return super.shouldOverrideUrlLoading(view, url);
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            if (request != null && request.getUrl() != null) {
                String url = request.getUrl().toString();
                if (isBlockedAdUrl(url)) {
                    return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream("".getBytes()));
                }
            }
            return super.shouldInterceptRequest(view, request);
        }

        @Override
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            boolean didCrash = detail != null && detail.didCrash();
            Log.e("YKN", "WebView render process exited: didCrash=" + didCrash);

            try {
                if (view != null) {
                    ViewGroup parent = (ViewGroup) view.getParent();
                    if (parent != null) {
                        parent.removeView(view);
                    }
                    view.destroy();
                }
            } catch (Exception ignored) {}

            try {
                runOnUiThread(() -> {
                    try {
                        recreate();
                    } catch (Exception ignored) {}
                });
            } catch (Exception ignored) {}

            // Returning true prevents the Android OS from killing the host application!
            return true;
        }
    }

    private class SafeBridgeWebChromeClient extends BridgeWebChromeClient {
        private View customView;
        private WebChromeClient.CustomViewCallback customViewCallback;
        private int originalOrientation;

        public SafeBridgeWebChromeClient(Bridge bridge) {
            super(bridge);
        }

        public boolean isCustomViewShowing() {
            return customView != null;
        }

        @Override
        public void onShowCustomView(View view, CustomViewCallback callback) {
            try {
                if (customView != null) {
                    if (callback != null) {
                        callback.onCustomViewHidden();
                    }
                    return;
                }

                customView = view;
                customViewCallback = callback;
                originalOrientation = getRequestedOrientation();

                if (view.getParent() instanceof ViewGroup) {
                    ((ViewGroup) view.getParent()).removeView(view);
                }

                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);

                FrameLayout decor = (FrameLayout) getWindow().getDecorView();
                decor.addView(customView, new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                ));

                getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                );
            } catch (Exception e) {
                Log.e("YKN", "onShowCustomView error", e);
                if (callback != null) {
                    try {
                        callback.onCustomViewHidden();
                    } catch (Exception ignored) {}
                }
            }
        }

        @Override
        public void onHideCustomView() {
            try {
                if (customView != null) {
                    FrameLayout decor = (FrameLayout) getWindow().getDecorView();
                    decor.removeView(customView);
                    customView = null;
                }
                setRequestedOrientation(originalOrientation);
                if (customViewCallback != null) {
                    customViewCallback.onCustomViewHidden();
                    customViewCallback = null;
                }
                getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
            } catch (Exception e) {
                Log.e("YKN", "onHideCustomView error", e);
            }
        }
    }

    private void setupWebView() {
        WebView webView = getBridge().getWebView();
        if (webView == null) {
            return;
        }

        webView.setKeepScreenOn(true);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        getBridge().setWebViewClient(new SafeBridgeWebViewClient(getBridge()));
        safeWebChromeClient = new SafeBridgeWebChromeClient(getBridge());
        webView.setWebChromeClient(safeWebChromeClient);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        setupWebView();
    }

    @Override
    public void onResume() {
        super.onResume();
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.setKeepScreenOn(true);
            showAndroidSessionAdGate(webView);
        }
    }

    @Override
    public void onBackPressed() {
        if (safeWebChromeClient != null && safeWebChromeClient.isCustomViewShowing()) {
            safeWebChromeClient.onHideCustomView();
            return;
        }
        super.onBackPressed();
    }
}
