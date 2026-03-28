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

  return {
    accessToken: hashParams.get("access_token") ?? queryParams.get("access_token"),
    refreshToken: hashParams.get("refresh_token") ?? queryParams.get("refresh_token"),
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

  const { accessToken, refreshToken } = getTokensFromUrl(result.url);
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
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST205") {
      return false;
    }
    throw error;
  }

  return Boolean(data.onboarding_completed);
}

export async function completeOnboarding(userId: string) {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", userId);

  if (error) {
    if (error.code === "PGRST205") {
      return;
    }
    throw error;
  }
}
