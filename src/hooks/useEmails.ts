import { useQuery } from "@tanstack/react-query";

import { requireSupabase } from "@/services/supabase";
import { Email } from "@/types";

export function useEmails() {
  return useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .order("received_at", { ascending: false });
      if (error) {
        throw error;
      }
      return (data ?? []) as Email[];
    },
  });
}
