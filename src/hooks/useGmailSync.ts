import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { requireSupabase } from "@/services/supabase";

export function useGmailSyncStatus() {
  return useQuery({
    queryKey: ["gmail-sync"],
    queryFn: async () => {
      const supabase = requireSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) return null;
      // maybeSingle() returns null (not 406) when no row exists yet
      const { data, error } = await supabase
        .from("gmail_sync")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useTriggerGmailSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = requireSupabase();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user?.id) {
        throw new Error("No authenticated user available for Gmail sync.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session — please sign out and sign back in.");
      }

      // Refresh session to ensure auth token is fresh
      const { data: refreshed } = await supabase.auth.refreshSession();
      const currentSession = refreshed.session ?? session;

      const { data, error } = await supabase.functions.invoke("gmail-sync", {
        body: {
          userId: user.id,
          // Pass current session's provider token so sync works without a re-login
          providerToken: currentSession?.provider_token ?? undefined,
          providerRefreshToken: currentSession?.provider_refresh_token ?? undefined,
        },
      });
      if (error) {
        const maybeHttpError = error as Error & { context?: Response };
        if (maybeHttpError.context) {
          const payload = await maybeHttpError.context.json().catch(() => ({}));

          // Extract Gmail-specific error if present
          const gmailError = payload?.gmail_error;
          const detail =
            gmailError?.message || payload?.detail || payload?.error || "Unknown error";

          throw new Error(`Gmail sync failed (${maybeHttpError.context.status}): ${detail}`);
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gmail-sync"] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}
