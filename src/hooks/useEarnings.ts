import { useQuery } from "@tanstack/react-query";

import { requireSupabase } from "@/services/supabase";
import { Payout } from "@/types";

export function useEarnings() {
  return useQuery({
    queryKey: ["earnings"],
    queryFn: async () => {
      const supabase = requireSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) return { payouts: [], totalPaid: 0 };
      const { data, error } = await supabase
        .from("payouts")
        .select("*")
        .eq("user_id", user.id)
        .order("paid_at", { ascending: false });
      if (error) {
        if (error.code === "42P01") return { payouts: [], totalPaid: 0 };
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
