import { useQuery } from "@tanstack/react-query";

import { requireSupabase } from "@/services/supabase";
import { Bounty } from "@/types";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from("bounties").select("*");
      if (error) {
        throw error;
      }

      const bounties = (data ?? []) as Bounty[];
      const totalEarned = bounties.reduce(
        (sum, bounty) => sum + Number(bounty.bounty_awarded ?? 0),
        0,
      );
      const reportsSent = bounties.filter((bounty) => bounty.status !== "draft").length;
      const pendingPayout = bounties
        .filter((bounty) => bounty.status === "accepted")
        .reduce(
          (sum, bounty) => sum + Number(bounty.bounty_awarded ?? bounty.bounty_expected ?? 0),
          0,
        );
      const acceptedCount = bounties.filter((bounty) => bounty.status === "accepted").length;

      const severityCounts = bounties.reduce(
        (acc, bounty) => {
          if (!bounty.severity) {
            return acc;
          }
          acc[bounty.severity] += 1;
          return acc;
        },
        { critical: 0, high: 0, medium: 0, low: 0 },
      );

      return {
        totalEarned,
        reportsSent,
        pendingPayout,
        acceptedCount,
        severityCounts,
      };
    },
  });
}
