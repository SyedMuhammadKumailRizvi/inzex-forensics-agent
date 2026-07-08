export type OSHint = 'windows' | 'linux' | 'mac';
export type CaseStatus = 'pending' | 'analyzing' | 'completed';
export type UploadStatus = 'uploading' | 'complete' | 'failed';
export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export interface Case {
  id: string;
  case_designation: string;
  reference_id: string | null;
  lead_investigator: string | null;
  os_hint: OSHint | null;
  status: CaseStatus;
  created_at: string;
}

export interface Evidence {
  id: string;
  case_id: string;
  file_name: string;
  storage_path: string;
  file_size_bytes: number;
  upload_status: UploadStatus;
  created_at: string;
}

export type FindingStatus = 'pending' | 'approved' | 'rejected' | 'rechecking';

export interface Finding {
  id: string;
  case_id: string;
  plugin_name: string;
  mitre_technique: string | null;
  severity: FindingSeverity | null;
  ai_rationale: string | null;
  volatility_raw_json: Record<string, any>; // Typed for JSONB compatibility
  status: FindingStatus;
  human_feedback: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      cases: {
        Row: Case;
        Insert: Omit<Case, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Case, 'id'>>;
      };
      evidence: {
        Row: Evidence;
        Insert: Omit<Evidence, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Evidence, 'id'>>;
      };
      findings: {
        Row: Finding;
        Insert: Omit<Finding, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Finding, 'id'>>;
      };
    };
  };
}
