export type ReliabilityTier = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' | 'Tier 5';

export interface EvidenceSource {
  id: string;
  organization: string;
  sourceType: 'Government / Tax Authority' | 'Official Statistics Bureau' | 'Central Bank' | 'Housing Market Registry' | 'Public Utility Commission';
  canonicalReference: string;
  url?: string;
  jurisdiction: string;
  reliabilityTier: ReliabilityTier;
  retrievedAt: string;
  effectiveDate: string;
  verifiedAt: string;
  verifiedBy: string;
  notes: string;
}

export interface CalculationEvidence {
  taxSources: EvidenceSource[];
  housingSources: EvidenceSource[];
  costOfLivingSources: EvidenceSource[];
  fxSources: EvidenceSource[];
  ruleVersions: {
    taxRuleVersion: string;
    colDatasetVersion: string;
    fxSnapshotDate: string;
  };
}
