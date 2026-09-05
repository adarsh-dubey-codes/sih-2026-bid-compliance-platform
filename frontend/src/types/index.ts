export type NavigationPath = 
  | 'officer-review-queue'
  | 'split-screen-evidence-inspector'
  | 'bidder-submission-portal'
  | 'cryptographic-audit-ledger';

export type UserRole = 'officer' | 'bidder' | 'auditor';

export interface EvidenceItem {
  id: string;
  clauseRef: string;
  requirement: string;
  requirementDetail: string;
  artifactName: string;
  shaHash: string;
  fileSize: string;
  uploadTime: string;
  validationStatus: 'verified' | 'warning' | 'error' | 'expired';
  validationBadge: string;
  validationDetail: string;
  actionType: 'inspect' | 'resolve' | 'upload' | 'renew';
  docKey: string;
}

export interface AuditEvent {
  timestamp: string;
  timeDetail: string;
  blockRef: string;
  category: 'RULESET_COMMITTED' | 'BID_SUBMISSION_SEAL' | 'REGISTRY_VERIFICATION' | 'ENGINE_DISCREPANCY' | 'STATUTORY_NOTICE';
  actorName: string;
  actorTitle: string;
  actorFingerprint: string;
  actionTitle: string;
  actionDetails: string;
  sha256Root: string;
  statusBadge: string;
  statusType: 'success' | 'warning' | 'error' | 'notice';
}

export interface AssetVerification {
  id: string;
  name: string;
  context: string;
  fileSize: string;
  immutableHash: string;
  recomputedHash: string;
  blockRef: string;
  timestamp: string;
  consensusCount: number;
  consensusNodes: string;
  byteDiff: number;
  status: 'verified' | 'tampered';
}

export interface TenderReviewItem {
  id: string;
  ref: string;
  title: string;
  bidder: string;
  gstin: string;
  bidId: string;
  category: string;
  score: number;
  status: string;
  riskLevel: 'high' | 'medium' | 'low' | 'critical';
  discrepanciesCount: number;
  flaggedClauses: string[];
  submissionTime: string;
  deadline: string;
}
