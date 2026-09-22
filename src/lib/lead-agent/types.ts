export type DiscoverySource =
  | "google_maps"
  | "linkedin_public_search"
  | "job_platform_public_search"
  | "agency_collaboration_public_search"
  | "google_intent_public_search";

export interface LeadSearchCriteria {
  source: DiscoverySource;
  country: string;
  region: string;
  city: string;
  radiusKm: number;
  categories: string[];
  service: string;
  leadType: string;
  requestedLeadCount: number;
  minimumScore: number;
  requireEmail: boolean;
  requirePhone: boolean;
  requireDecisionMaker: boolean;
  excludedDomains: string[];
  additionalInstructions: string;
}

export interface LeadRequestStartResponse {
  request: { id: string; status: string; createdAt?: string };
  dispatched: boolean;
  detail: string;
}

export interface ProgressStage {
  key: string;
  label: string;
  status: string;
  detail: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface LeadSearchProgress {
  requestId: string;
  status: string;
  percentComplete: number;
  currentStage: string;
  stages: ProgressStage[];
  sourcesChecked: number;
  businessesDiscovered: number;
  duplicatesRemoved: number;
  invalidContactsRejected: number;
  verifiedLeads: number;
  highPotentialLeads: number;
  startedAt: string | null;
  updatedAt: string;
  elapsedSeconds: number;
  errorMessage: string | null;
}

export interface LeadResult {
  id: string;
  companyName: string;
  category: string;
  country: string;
  region: string | null;
  city: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  score: number;
  verificationStatus: string;
  approvalStatus: string;
  recommendedService: string;
  opportunitySignals: string[];
  websiteIssues: string[];
  decisionMaker?: {
    name: string | null;
    role: string | null;
    email: string | null;
    phone: string | null;
    profileUrl: string | null;
  } | null;
}

export interface LeadResultsResponse {
  items: LeadResult[];
  total: number;
  page: number;
  pageSize: number;
}
