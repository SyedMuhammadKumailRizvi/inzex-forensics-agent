import React from 'react';
import { Finding } from '@/types/database';

interface EvidenceLogProps {
  finding: Finding | null;
}

export function EvidenceLog({ finding }: EvidenceLogProps) {
  if (!finding) {
    return (
      <div className="panel" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Select a finding to view evidence.</p>
      </div>
    );
  }

  return (
    <div className="panel" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column' }}>
      <p className="panel-title" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 3px' }}>Raw Volatility 3 Output</p>
      <p className="panel-sub" style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Plugin: {finding.plugin_name}</p>
      <div className="evidence-log" style={{ fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.9, background: 'var(--bg-page)', border: '1px solid var(--border-soft)', borderRadius: 6, padding: '14px 16px', maxHeight: 480, overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
        <div className="log-line" style={{ color: 'var(--text-tertiary)', whiteSpace: 'pre', padding: '2px 0 2px 10px', borderLeft: '2px solid transparent' }}>
          {finding.volatility_raw_json ? JSON.stringify(finding.volatility_raw_json, null, 2) : 'No output captured.'}
        </div>
      </div>
    </div>
  );
}
