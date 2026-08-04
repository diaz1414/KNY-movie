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
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
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
