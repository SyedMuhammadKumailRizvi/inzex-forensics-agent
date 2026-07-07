export interface Case {
  id: string;
  case_number: string;
  title: string;
  summary: string | null;
  investigator_name: string;
  organization: string | null;
  os_profile: string | null;
  status: 'pending_upload' | 'analyzing' | 'review_pending' | 'completed';
  created_at: string;
}

export interface Evidence {
  id: string;
  case_id: string;
  file_name: string;
  file_size: number;
  storage_path: string;
  upload_status: 'uploading' | 'complete' | 'failed';
  created_at: string;
}

export interface Finding {
  id: string;
  case_id: string;
  plugin_name: string;
  technique: string | null;
  confidence_score: number | null;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info' | null;
  ai_rationale: string | null;
  volatility_raw_output: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface FindingThread {
  id: string;
  finding_id: string;
  author: 'analyst' | 'gemma_ai';
  content: string;
  created_at: string;
}
