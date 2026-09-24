export interface SocialWorkflowStatus {
  readonly configured: boolean;
  readonly reachable: boolean;
  readonly workflowId?: string;
  readonly workflowName?: string;
  readonly active?: boolean;
  readonly updatedAt?: string;
  readonly error?: string;
}

export interface SocialAgentStatusResponse {
  readonly ok: boolean;
  readonly checkedAt: string;
  readonly brandSetup: SocialWorkflowStatus;
  readonly dailyPublisher: SocialWorkflowStatus;
  readonly approvalPublisher: SocialWorkflowStatus;
}
