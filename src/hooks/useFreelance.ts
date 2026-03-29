import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { requireSupabase } from "@/services/supabase";
import { FreelanceEngagement } from "@/types";

const key = ["freelance-engagements"];

export function useFreelanceEngagements() {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const supabase = requireSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) return [] as FreelanceEngagement[];
      const { data, error } = await supabase
        .from("freelance_engagements")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        if (error.code === "42P01") return [] as FreelanceEngagement[];
        throw error;
      }
      return (data ?? []) as FreelanceEngagement[];
    },
  });
}

export function useCreateFreelanceEngagement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<FreelanceEngagement>) => {
      const supabase = requireSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("freelance_engagements")
        .insert({ ...payload, user_id: user.id })
        .select("*")
        .single();
      if (error) {
        throw error;
      }
      return data as FreelanceEngagement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
