import React, { useState } from 'react';
import { Finding } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

interface AIFindingProps {
  finding: Finding | null;
  onUpdate?: () => void;
  onReevaluating?: (val: boolean) => void;
}

export function AIFinding({ finding, onUpdate, onReevaluating }: AIFindingProps) {
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!finding) {
    return (
      <div className="panel" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Select a finding to view AI analysis.</p>
      </div>
    );
  }

  const handleApprove = async () => {
    const supabase = createClient();
    await supabase.from('findings').update({ status: 'approved' }).eq('id', finding.id);
    
    // Check if this is the last finding to be approved
    const { data: allFindings } = await supabase.from('findings').select('status, id').eq('case_id', finding.case_id);
    const everythingApproved = allFindings && allFindings.every(f => f.id === finding.id ? true : f.status === 'approved');

    if (everythingApproved) {
      // Notify backend to clean up temp files
      const amdBackendUrl = process.env.NEXT_PUBLIC_AMD_BACKEND_URL || "http://localhost:8000";
      try {
        await fetch(`${amdBackendUrl}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ case_id: finding.case_id })
        });
      } catch (err) {
        console.error("Failed to notify backend for file cleanup:", err);
      }
    }
    
    if (onUpdate) onUpdate();
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    setSubmitting(true);
    if (onReevaluating) onReevaluating(true);
    const supabase = createClient();
    await supabase.from('cases').update({ status: 'analyzing' }).eq('id', finding.case_id);
    await supabase.from('findings').update({ 
      status: 'rechecking',
      human_feedback: feedback
    }).eq('id', finding.id);

    if (onUpdate) onUpdate();

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
    if (onUpdate) onUpdate();
  };

  const isRechecking = finding.status === 'rechecking' || submitting;

  return (
    <div className="panel" style={{ position: 'relative', background: 'var(--bg-surface)', border: `1px solid ${finding.status === 'approved' ? '#4CAF50' : 'var(--border)'}`, borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {isRechecking && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
          <div style={{ width: '80%', background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#D6A6FF', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Sending to Gemma 4</p>
            <div style={{ width: '100%', height: 4, background: 'var(--bg-page)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '50%', background: 'var(--red)', animation: 'pulse-bar 1.5s infinite ease-in-out' }}></div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 12 }}>Re-evaluating based on your feedback...</p>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes pulse-bar {
              0% { left: -50%; }
              100% { left: 100%; }
            }
          `}} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <p className="panel-title" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: 0 }}>Gemma 4 AI Inference</p>
        {finding.status === 'approved' && (
          <span style={{ fontSize: 10, background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 1, border: '1px solid #4CAF50' }}>Approved</span>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p className="panel-sub" style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Plugin: {finding.plugin_name}</p>
      </div>
      
      {finding.mitre_technique && (
        <div className="finding-badge" style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', marginBottom: 12, background: '#251B33', color: '#A982ED', border: '1px solid #3B2A52', alignSelf: 'flex-start' }}>
          Mitre ATT&CK // {finding.mitre_technique}
        </div>
      )}
      
      {(() => {
        const parts = (finding.ai_rationale || '').split('|||REEVAL|||');
        const original = parts[0] || 'No analysis available.';
        const reevals = parts.slice(1);
        
        return (
          <>
            <div className="conf-note" style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 18, padding: '10px 12px', background: 'var(--amber-dim)', border: '1px solid #4A3A15', borderRadius: 6 }}>
              {finding.severity} finding — {original.split('.')[0] + '.' || 'Detected suspicious behavior.'}
            </div>
            
            <p className="rationale" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: reevals.length > 0 ? 12 : 18, margin: 0, whiteSpace: 'pre-wrap' }}>
              {original}
            </p>

            {reevals.map((reeval, idx) => (
              <div key={idx} style={{ marginTop: 12, padding: '12px', background: 'rgba(157, 0, 255, 0.05)', border: '1px solid rgba(157, 0, 255, 0.2)', borderRadius: 6 }}>
                <p style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#B366FF', margin: '0 0 6px', fontWeight: 600 }}>🔄 Re-evaluation Analysis</p>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: '#e0e0e0', margin: 0, whiteSpace: 'pre-wrap' }}>{reeval}</p>
              </div>
            ))}
          </>
        );
      })()}
      
      <div className="review-actions" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, marginTop: 18 }}>
        <textarea 
          placeholder="Notice an issue with the AI's logic? Enter feedback here to force a re-evaluation..." 
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={finding.status === 'approved'}
          style={{ width: '100%', minHeight: 80, background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12, resize: 'vertical', outline: 'none', fontFamily: 'var(--sans)', opacity: finding.status === 'approved' ? 0.5 : 1 }}
        />
        <button onClick={handleSubmitFeedback} disabled={submitting || !feedback.trim() || finding.status === 'approved'} className="btn" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500, padding: '8px 0', width: '100%', borderRadius: 6, border: '1px solid var(--red-glow)', background: 'var(--red-dim)', color: '#D6A6FF', cursor: (submitting || !feedback.trim() || finding.status === 'approved') ? 'not-allowed' : 'pointer', opacity: (submitting || !feedback.trim() || finding.status === 'approved') ? 0.5 : 1 }}>
          Submit to Engine for Re-evaluation
        </button>
      </div>
      
      <div className="review-actions" style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button onClick={handleApprove} disabled={finding.status === 'approved'} className="btn btn-confirm" style={{ flex: 1, fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, padding: '9px 0', borderRadius: 6, border: '1px solid var(--border)', background: finding.status === 'approved' ? 'rgba(76, 175, 80, 0.1)' : 'var(--bg-raised)', color: finding.status === 'approved' ? '#4CAF50' : 'var(--text-secondary)', cursor: finding.status === 'approved' ? 'not-allowed' : 'pointer' }}>
          {finding.status === 'approved' ? 'Approved' : 'Approve Finding'}
        </button>
      </div>
    </div>
  );
}
