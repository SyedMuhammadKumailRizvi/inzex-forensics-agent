import React, { useState } from 'react';
import { Finding } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

interface AIFindingProps {
  finding: Finding | null;
}

export function AIFinding({ finding }: AIFindingProps) {
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!finding) {
    return (
      <div className="panel" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Select a finding to view AI analysis.</p>
      </div>
    );
  }

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from('cases').update({ status: 'analyzing' }).eq('id', finding.case_id);
    await supabase.from('findings').update({ 
      status: 'rechecking',
      human_feedback: feedback
    }).eq('id', finding.id);

    const amdBackendUrl = process.env.NEXT_PUBLIC_AMD_BACKEND_URL || "http://localhost:8000";
    try {
      await fetch(`${amdBackendUrl}/reevaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finding_id: finding.id, human_feedback: feedback })
      });
    } catch (err) {
      console.error("Failed to trigger backend re-evaluation:", err);
    }
    
    setSubmitting(false);
    setFeedback("");
  };

  return (
    <div className="panel" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column' }}>
      <p className="panel-title" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 3px' }}>Gemma 4 AI Inference</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p className="panel-sub" style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Plugin: {finding.plugin_name}</p>
        {finding.status === 'rechecking' && (
          <span style={{ fontSize: 10, background: 'var(--amber-dim)', color: 'var(--amber)', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Re-evaluating...</span>
        )}
      </div>
      
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
        <textarea 
          placeholder="Notice an issue with the AI's logic? Enter feedback here to force a re-evaluation..." 
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          style={{ width: '100%', minHeight: 80, background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12, resize: 'vertical', outline: 'none', fontFamily: 'var(--sans)' }}
        />
        <button onClick={handleSubmitFeedback} disabled={submitting || !feedback.trim()} className="btn" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500, padding: '8px 0', width: '100%', borderRadius: 6, border: '1px solid var(--red-glow)', background: 'var(--red-dim)', color: '#D6A6FF', cursor: (submitting || !feedback.trim()) ? 'not-allowed' : 'pointer', opacity: (submitting || !feedback.trim()) ? 0.5 : 1 }}>
          {submitting ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(214, 166, 255, 0.3)', borderTopColor: '#D6A6FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
              Re-evaluating logic securely...
            </div>
          ) : 'Submit to Engine for Re-evaluation'}
        </button>
      </div>
      
      <div className="review-actions" style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button className="btn btn-confirm" style={{ flex: 1, fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, padding: '9px 0', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-raised)', color: 'var(--text-secondary)', cursor: 'pointer' }}>Approve Finding</button>
      </div>
    </div>
  );
}
