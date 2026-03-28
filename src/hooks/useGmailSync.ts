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

      const { data, error } = await supabase.functions.invoke("gmail-sync", {
        body: { userId: user.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (error) {
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
