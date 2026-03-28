export type Severity = "critical" | "high" | "medium" | "low";

export type BountyStatus =
  | "draft"
  | "reported"
  | "triaging"
  | "accepted"
  | "duplicate"
  | "rejected"
  | "paid";

export type PlatformType = "web" | "mobile" | "api" | "other";

export type VulnerabilityType = "XSS" | "SQLi" | "IDOR" | "SSRF" | "RCE" | "Auth Bypass" | "Other";

export type SyncStatus = "idle" | "syncing" | "error";

export type FreelanceStage =
  | "lead"
  | "proposal_sent"
  | "negotiating"
  | "in_progress"
  | "delivered"
  | "closed_won"
  | "closed_lost";

export type PaymentStatus = "unpaid" | "partial" | "paid";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export interface Bounty {
  id: string;
  user_id: string;
  company_name: string;
  company_email: string | null;
  vulnerability_type: VulnerabilityType | null;
  severity: Severity | null;
  platform: PlatformType | null;
  title: string;
  description: string | null;
  poc_notes: string | null;
  status: BountyStatus;
  bounty_expected: number | null;
  bounty_awarded: number | null;
  reported_at: string | null;
  resolved_at: string | null;
  gmail_thread_id: string | null;
  last_email_at: string | null;
  stale_after_days: number;
  created_at: string;
  updated_at: string;
}

export interface FreelanceEngagement {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string | null;
  title: string;
  scope_summary: string | null;
  stage: FreelanceStage;
  expected_value: number | null;
  agreed_value: number | null;
  payment_status: PaymentStatus;
  gmail_thread_id: string | null;
  last_email_at: string | null;
  stale_after_days: number;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  user_id: string;
  bounty_id: string | null;
  freelance_id: string | null;
  gmail_message_id: string;
  gmail_thread_id: string;
  from_address: string | null;
  to_address: string | null;
  subject: string | null;
  body_preview: string | null;
  body_full: string | null;
  is_sent_by_me: boolean;
  received_at: string | null;
  synced_at: string;
  seen_at: string | null;
}

export interface Payout {
  id: string;
  user_id: string;
  bounty_id: string | null;
  freelance_id: string | null;
  amount: number;
  currency: string;
  payment_method: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}
