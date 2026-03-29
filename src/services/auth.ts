import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { requireSupabase } from "@/services/supabase";

WebBrowser.maybeCompleteAuthSession();

const GMAIL_SCOPES =
  "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose";

function getTokensFromUrl(url: string) {
  // Always split on # first — tokens are always in the fragment
  const fragment = url.includes("#") ? url.split("#")[1] : "";
  const params = new URLSearchParams(fragment);

  return {
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
    providerToken: params.get("provider_token"),
    providerRefreshToken: params.get("provider_refresh_token"),
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
  console.log("OAuth result URL:", result.type === "success" ? result.url : "no url");

  if (result.type !== "success") {
    throw new Error("Google sign-in was cancelled or failed.");
  }

  const { accessToken, refreshToken, providerToken, providerRefreshToken } = getTokensFromUrl(
    result.url,
  );
  console.log("[auth] accessToken:", accessToken?.substring(0, 30));
  console.log("[auth] refreshToken:", refreshToken?.substring(0, 20));
  console.log("[auth] providerToken:", providerToken?.substring(0, 30));
  console.log("[auth] providerRefreshToken:", providerRefreshToken?.substring(0, 20));

  if (!accessToken || !refreshToken) {
    throw new Error("Missing auth tokens in OAuth callback URL.");
  }
  const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (setSessionError) {
    throw setSessionError;
  }

  const userId = sessionData.session?.user?.id;
  console.log("[auth] setSession succeeded");
  console.log("[auth] userId from session:", userId);

  if (!userId) {
    throw new Error("Could not decode userId from access token.");
  }

  const { error: upsertError } = await supabase.from("gmail_sync").upsert(
    {
      user_id: userId,
      google_access_token: providerToken ?? null,
      google_refresh_token: providerRefreshToken ?? null,
      sync_status: "idle",
    },
    { onConflict: "user_id" },
  );

  console.log("[auth] gmail_sync upsert error:", upsertError);

  if (upsertError) {
    console.warn("[auth] gmail_sync upsert failed; continuing login", upsertError);
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
