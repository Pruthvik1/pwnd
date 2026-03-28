import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { requireSupabase } from "@/services/supabase";
import { FreelanceEngagement } from "@/types";

const key = ["freelance-engagements"];

export function useFreelanceEngagements() {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from("freelance_engagements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
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
      const { data, error } = await supabase
        .from("freelance_engagements")
        .insert(payload)
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
