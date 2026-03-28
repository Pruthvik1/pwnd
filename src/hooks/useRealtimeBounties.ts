import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { hasSupabaseConfig, requireSupabase } from "@/services/supabase";

export function useRealtimeBounties() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!hasSupabaseConfig) {
      return;
    }

    const supabase = requireSupabase();
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["bounties"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["freelance-engagements"] });
      queryClient.invalidateQueries({ queryKey: ["earnings"] });
    };

    const channel = supabase
      .channel("bounties-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bounties",
        },
        invalidate,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emails",
        },
        invalidate,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "freelance_engagements",
        },
        invalidate,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
