import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { requireSupabase } from "@/services/supabase";

export function useGmailSyncStatus() {
  return useQuery({
    queryKey: ["gmail-sync"],
    queryFn: async () => {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from("gmail_sync").select("*").single();
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

      const { data, error } = await supabase.functions.invoke("gmail-sync", {
        body: { userId: user.id },
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
