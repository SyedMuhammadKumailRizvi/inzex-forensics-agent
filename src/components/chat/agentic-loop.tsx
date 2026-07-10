import React from 'react';

export function AgenticLoop() {
  return (
    <div className="agentic-loop">
      <textarea 
        placeholder="Dispute finding or add context for Gemma 4 to re-evaluate..." 
        style={{ 
          width: '100%', 
          background: 'var(--bg-page)', 
          border: '1px solid var(--border-soft)', 
          borderRadius: 6, 
          color: 'var(--text-primary)', 
          fontFamily: 'var(--sans)', 
          fontSize: 13, 
          padding: '10px 12px', 
          resize: 'none', 
          height: 64 
        }}
      />
      <div className="analyst-row" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-soft)' }}>
        <div className="avatar" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--red-dim)', color: '#C58AFF', fontFamily: 'var(--mono)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--red-glow)' }}>KR</div>
        <div className="analyst-name" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pending review by K. Rizvi</div>
      </div>
    </div>
  );
}
