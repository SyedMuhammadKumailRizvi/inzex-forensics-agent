import React from 'react';
import { Finding } from '@/types/database';
import { AgenticLoop } from '../chat/agentic-loop';

interface AIFindingProps {
  finding: Finding | null;
}

export function AIFinding({ finding }: AIFindingProps) {
  if (!finding) {
    return (
      <div className="panel" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Select a finding to view AI analysis.</p>
      </div>
    );
  }

  return (
    <div className="panel" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column' }}>
      <p className="panel-title" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 3px' }}>Gemma 3 AI Inference</p>
      <p className="panel-sub" style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Plugin: {finding.plugin_name}</p>
      
      {finding.technique && (
        <div className="finding-badge" style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', marginBottom: 12, background: '#251B33', color: '#A982ED', border: '1px solid #3B2A52', alignSelf: 'flex-start' }}>
          Mitre ATT&CK // {finding.technique}
        </div>
      )}
      
      {finding.confidence_score && (
        <div className="conf-score" style={{ fontFamily: 'var(--mono)', fontSize: 34, fontWeight: 700, color: 'var(--amber)', margin: '4px 0 2px' }}>
          {finding.confidence_score}%
        </div>
      )}
      
      <div className="conf-note" style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 18, padding: '10px 12px', background: 'var(--amber-dim)', border: '1px solid #4A3A15', borderRadius: 6 }}>
        {finding.severity} finding — {finding.ai_rationale?.split('.')[0] + '.' || 'Detected suspicious behavior.'}
      </div>
      
      <p className="rationale" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 18, margin: 0 }}>
        {finding.ai_rationale}
      </p>
      
      <div className="review-actions" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, marginTop: 18 }}>
        <button className="btn btn-confirm" style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, padding: '9px 0', width: '100%', borderRadius: 6, border: '1px solid var(--red)', background: 'var(--red)', color: '#fff', cursor: 'pointer' }}>Approve / Add to Report</button>
        <button className="btn btn-dismiss" style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, padding: '9px 0', width: '100%', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Reject / Dismiss</button>
      </div>
      
      <AgenticLoop />
    </div>
  );
}
