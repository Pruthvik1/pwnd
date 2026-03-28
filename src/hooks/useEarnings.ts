import { useQuery } from "@tanstack/react-query";

import { requireSupabase } from "@/services/supabase";
import { Payout } from "@/types";

export function useEarnings() {
  return useQuery({
    queryKey: ["earnings"],
    queryFn: async () => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from("payouts")
        .select("*")
        .order("paid_at", { ascending: false });
      if (error) {
        throw error;
      }

      const payouts = (data ?? []) as Payout[];
      const totalPaid = payouts.reduce((sum, payout) => sum + Number(payout.amount ?? 0), 0);

      return {
        payouts,
        totalPaid,
      };
    },
  });
}
