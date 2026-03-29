import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { requireSupabase } from "@/services/supabase";
import { Bounty, BountyStatus } from "@/types";

const key = ["bounties"];

export function useBounties() {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const supabase = requireSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) return [] as Bounty[];
      const { data, error } = await supabase
        .from("bounties")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        if (error.code === "42P01") return [] as Bounty[];
        throw error;
      }
      return (data ?? []) as Bounty[];
    },
  });
}

export function useCreateBounty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Bounty>) => {
      const supabase = requireSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("bounties")
        .insert({ ...payload, user_id: user.id })
        .select("*")
        .single();
      if (error) {
        throw error;
      }
      return data as Bounty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

export function useBountyById(bountyId?: string) {
  return useQuery({
    queryKey: ["bounties", bountyId],
    enabled: Boolean(bountyId),
    queryFn: async () => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from("bounties")
        .select("*")
        .eq("id", bountyId)
        .single();
      if (error) {
        throw error;
      }
      return data as Bounty;
    },
  });
}

export function useUpdateBounty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bountyId, patch }: { bountyId: string; patch: Partial<Bounty> }) => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from("bounties")
        .update(patch)
        .eq("id", bountyId)
        .select("*")
        .single();
      if (error) {
        throw error;
      }
      return data as Bounty;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bounties"] });
      queryClient.invalidateQueries({ queryKey: ["bounties", data.id] });
    },
  });
}

export function useUpdateBountyStatus() {
  const updateBounty = useUpdateBounty();
  return useMutation({
    mutationFn: ({ bountyId, status }: { bountyId: string; status: BountyStatus }) =>
      updateBounty.mutateAsync({ bountyId, patch: { status } }),
  });
}

export function useMarkBountyPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bountyId, amount }: { bountyId: string; amount: number }) => {
      const supabase = requireSupabase();
      const { error: payoutError } = await supabase.from("payouts").insert({
        bounty_id: bountyId,
        amount,
        payment_method: "paypal",
        paid_at: new Date().toISOString(),
      });

      if (payoutError) {
        throw payoutError;
      }

      const { error: bountyError } = await supabase
        .from("bounties")
        .update({ status: "paid", bounty_awarded: amount, resolved_at: new Date().toISOString() })
        .eq("id", bountyId);

      if (bountyError) {
        throw bountyError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bounties"] });
      queryClient.invalidateQueries({ queryKey: ["earnings"] });
    },
  });
}
