import { useQuery } from "@tanstack/react-query";

import { requireSupabase } from "@/services/supabase";
import { Email } from "@/types";

export function useEmails() {
  return useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const supabase = requireSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) return [] as Email[];
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("user_id", user.id)
        .order("received_at", { ascending: false });
      if (error) {
        // Table may not exist yet — return empty silently
        if (error.code === "42P01") return [] as Email[];
        throw error;
      }
      return (data ?? []) as Email[];
    },
  });
}
