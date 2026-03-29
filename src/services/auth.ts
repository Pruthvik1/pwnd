import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { requireSupabase } from "@/services/supabase";

WebBrowser.maybeCompleteAuthSession();

const GMAIL_SCOPES =
  "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose";

function getTokensFromUrl(url: string) {
  const hash = url.split("#")[1] ?? "";
  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(url.split("?")[1] ?? "");

  const get = (key: string) => hashParams.get(key) ?? queryParams.get(key);
  return {
    accessToken: get("access_token"),
    refreshToken: get("refresh_token"),
    providerToken: get("provider_token"),
    providerRefreshToken: get("provider_refresh_token"),
  };
}

export async function signInWithGoogle() {
  const supabase = requireSupabase();
  const redirectTo = Linking.createURL("/");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      scopes: GMAIL_SCOPES,
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error("No OAuth URL returned by Supabase.");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success") {
    throw new Error("Google sign-in was cancelled or failed.");
  }

  const { accessToken, refreshToken, providerToken, providerRefreshToken } = getTokensFromUrl(
    result.url,
  );
  if (!accessToken || !refreshToken) {
    throw new Error("Missing auth tokens in OAuth callback URL.");
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    throw sessionError;
  }

  // Store Google provider tokens in gmail_sync — extracted from callback URL
  // (session.provider_token is not persisted by Supabase after setSession)
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  // Use URL-extracted token first; fall back to what Supabase stored (usually null)
  const googleToken = providerToken ?? sessionData.session?.provider_token ?? null;
  const googleRefreshToken =
    providerRefreshToken ?? sessionData.session?.provider_refresh_token ?? null;

  if (userId && googleToken) {
    await supabase.from("gmail_sync").upsert(
      {
        user_id: userId,
        google_access_token: googleToken,
        google_refresh_token: googleRefreshToken,
        sync_status: "idle",
      },
      { onConflict: "user_id" },
    );
  }
}

export async function signOut() {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentSession() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
}

export async function isOnboardingCompleted(userId: string) {
  const supabase = requireSupabase();
  // maybeSingle() returns null when no row exists (instead of throwing 406)
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Onboarding status check error:", error);
    return false;
  }

  return Boolean(data?.onboarding_completed);
}

export async function completeOnboarding(userId: string) {
  const supabase = requireSupabase();
  // upsert creates the row if no profile exists yet, update if it does
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, onboarding_completed: true }, { onConflict: "id" });

  if (error) {
    throw error;
  }

  // Refresh session so the auth state change listener in AppNavigator
  // fires and re-checks onboarding status
  await supabase.auth.refreshSession();
}
