export interface GmailAgentWorkflowStatus {
  readonly configured: boolean;
  readonly reachable: boolean;
  readonly workflowId?: string;
  readonly workflowName?: string;
  readonly active?: boolean;
  readonly updatedAt?: string;
  readonly error?: string;
}

export interface GmailAgentStatusResponse {
  readonly ok: boolean;
  readonly checkedAt: string;
  readonly agent: GmailAgentWorkflowStatus;
  readonly errorAlert: GmailAgentWorkflowStatus;
}
