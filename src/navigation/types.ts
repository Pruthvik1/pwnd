export type AuthStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
};

export type BountiesStackParamList = {
  BountyList: undefined;
  BountyDetail: { bountyId: string };
  AddBounty: { bountyId?: string } | undefined;
};

export type EmailsStackParamList = {
  AllEmails: undefined;
  Thread: { threadId: string; bountyId?: string; freelanceId?: string };
};

export type FreelanceStackParamList = {
  FreelanceList: undefined;
  FreelanceDetail: { engagementId: string };
  AddFreelance: { engagementId?: string } | undefined;
};

export type RootTabParamList = {
  DashboardTab: undefined;
  BountiesTab: undefined;
  EmailsTab: undefined;
  FreelanceTab: undefined;
  EarningsTab: undefined;
};
