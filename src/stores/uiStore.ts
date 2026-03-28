import { create } from "zustand";

import { BountyStatus, SyncStatus } from "@/types";

type BountyFilter = "all" | "active" | "accepted" | "pending" | "duplicate" | "rejected" | "paid";

interface UIState {
  bountyFilter: BountyFilter;
  selectedThreadId: string | null;
  emailFilter: "all" | "unread" | "sent" | "stale";
  syncStatus: SyncStatus;
  statusFilter: BountyStatus | "all";
  setBountyFilter: (filter: BountyFilter) => void;
  setSelectedThreadId: (threadId: string | null) => void;
  setEmailFilter: (filter: UIState["emailFilter"]) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setStatusFilter: (status: UIState["statusFilter"]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  bountyFilter: "all",
  selectedThreadId: null,
  emailFilter: "all",
  syncStatus: "idle",
  statusFilter: "all",
  setBountyFilter: (bountyFilter) => set({ bountyFilter }),
  setSelectedThreadId: (selectedThreadId) => set({ selectedThreadId }),
  setEmailFilter: (emailFilter) => set({ emailFilter }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
}));
