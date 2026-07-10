'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { EvidenceLog } from '@/components/workspace/evidence-log';
import { AIFinding } from '@/components/workspace/ai-finding';
import { ManualBrowser } from '@/components/workspace/manual-browser';
import { AIReport } from '@/components/workspace/ai-report';
import { Case, Finding, Evidence } from '@/types/database';

const PRINT_CSS = `
@media print {
  @page { margin: 15mm; size: A4; }
  body { background: #fff !important; color: #1a1a1a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .app { padding: 0 !important; max-width: 100% !important; background: #fff !important; }
  .hide-on-print { display: none !important; }
  .print-only { display: block !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
.print-only { display: none; }
`;

export default function Workspace({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [activeTab, setActiveTab] = useState<'ai-review' | 'manual-browser'>('ai-review');
  const [loading, setLoading] = useState(true);
  const [isReevaluating, setIsReevaluating] = useState(false);

  const fetchData = async () => {
    const supabase = createClient();
    
    const { data: caseRow } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();
      
    if (caseRow) setCaseData(caseRow as Case);

    const { data: evidenceRows } = await supabase
      .from('evidence')
      .select('*')
      .eq('case_id', caseId);
      
    if (evidenceRows && evidenceRows.length > 0) {
      setEvidence(evidenceRows[0] as Evidence);
    }

    const { data: findingsRows } = await supabase
      .from('findings')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });
      
    if (findingsRows) {
      setFindings(findingsRows as Finding[]);
      
      setSelectedFinding(prev => {
        if (!prev) return findingsRows.length > 0 ? findingsRows[0] as Finding : null;
        const updated = findingsRows.find(f => f.id === prev.id);
        return updated ? (updated as Finding) : prev;
      });

      // If nothing is rechecking, clear the reevaluating overlay
      const anyRechecking = findingsRows.some(f => f.status === 'rechecking');
      if (!anyRechecking) setIsReevaluating(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      setFindings(currentFindings => {
        const needsPolling = currentFindings.some(f => f.status === 'rechecking');
        if (needsPolling) fetchData();
        return currentFindings;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [caseId]);

  useEffect(() => {
    function drawThread() {
      const ws = document.getElementById('workspace');
      const selected = document.querySelector('.stage-card.selected');
      const hits = document.querySelectorAll('.evidence-log .log-line');
      if (!selected || hits.length === 0 || !ws) return;
      
      const wsRect = ws.getBoundingClientRect();
      const sRect = selected.getBoundingClientRect();
      const startX = sRect.right - wsRect.left;
      const startY = sRect.top - wsRect.top + sRect.height / 2;
      
      const target = hits[0];
      const tRect = target.getBoundingClientRect();
      const endX = tRect.left - wsRect.left;
      const endY = tRect.top - wsRect.top + 20;
      
      const midX = (startX + endX) / 2;
      const d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
      
      const path = document.getElementById('thread-path');
      if (path) path.setAttribute('d', d);
    }

    if (!loading) {
      setTimeout(drawThread, 100);
      window.addEventListener('resize', drawThread);
      return () => window.removeEventListener('resize', drawThread);
    }
  }, [loading, selectedFinding]);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)', padding: 40 }}>Loading workspace...</div>;
  }

  if (!caseData) {
    return <div style={{ color: 'var(--red)', padding: 40 }}>Case not found or access denied.</div>;
  }

  const handlePrint = () => window.print();

  return (
    <div className="app print-friendly">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {/* ── Full-page re-evaluation overlay ─────────────────── */}
      {isReevaluating && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,10,15,0.96)', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999,
        }}>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes pulse-bar { 0% { left: -50%; } 100% { left: 110%; } }
            @keyframes fadeInUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
          ` }} />
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.4s ease', maxWidth: 440 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--red-dim)', border: '1px solid var(--red-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: '#D6A6FF' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#D6A6FF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
              Re-evaluating with Gemma 4
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 28, lineHeight: 1.6 }}>
              Your feedback has been dispatched to the AMD ROCm inference engine. The finding will update automatically when complete.
            </p>
            <div style={{ width: '100%', height: 4, background: 'var(--bg-raised)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, height: '100%', width: '45%', background: 'linear-gradient(90deg, transparent, var(--red), transparent)', animation: 'pulse-bar 1.8s infinite ease-in-out' }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 12 }}>
              This typically takes 15–45 seconds
            </p>
          </div>
        </div>
      )}

      {/* ── Case header ─────────────────────────────────────── */}
      <div className="case-header hide-on-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Inzex Forensics — {caseData.lead_investigator || 'Unknown Analyst'}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 1 }}>
            CASE: <span style={{ color: 'var(--red)' }}>{caseData.case_designation}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Memory Source</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-secondary)' }}>{evidence?.file_name || 'Pending...'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Backend Processing</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-secondary)' }}>Volatility 3 (AMD Accelerated)</div>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', padding: '6px 14px', borderRadius: 3, background: 'var(--red-dim)', color: '#D6A6FF', border: '1px solid var(--red-glow)' }}>
            {findings.length} AI Findings
          </div>
        </div>
      </div>

      {/* ── Tab toggle ──────────────────────────────────────── */}
      <div className="hide-on-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
          {(['ai-review', 'manual-browser'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ fontFamily: 'var(--sans)', fontSize: 12, padding: '7px 16px', background: activeTab === tab ? 'var(--red-dim)' : 'var(--bg-surface)', color: activeTab === tab ? '#D6A6FF' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
            >
              {tab === 'ai-review' ? 'Human Review Workspace' : 'Process Browser'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main workspace ───────────────────────────────────── */}
      <div className="hide-on-print">
        {activeTab === 'ai-review' ? (
          <div className="workspace" id="workspace" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: 20 }}>
            <svg id="thread-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
              <path id="thread-path" d="" style={{ fill: 'none', stroke: 'var(--red)', strokeWidth: 1.5, strokeDasharray: '6 4', opacity: 0.85 }} />
            </svg>

            <div className="panel" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 3px' }}>Forensic Analysis Stages</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Volatility 3 Plugins executed</p>

              {findings.length === 0 ? (
                <p style={{ color: 'var(--text-tertiary)', fontSize: 13, padding: 12 }}>Waiting for Unicorn Engine analysis to complete...</p>
              ) : (
                findings.map(f => (
                  <div
                    key={f.id}
                    className={`stage-card ${selectedFinding?.id === f.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFinding(f)}
                    style={{ border: `1px solid ${selectedFinding?.id === f.id ? 'var(--red)' : 'var(--border)'}`, borderRadius: 8, padding: '12px 14px', marginBottom: 10, cursor: 'pointer', transition: 'border-color .15s', background: selectedFinding?.id === f.id ? 'var(--red-dim)' : 'var(--bg-raised)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: selectedFinding?.id === f.id ? '#C58AFF' : 'var(--text-tertiary)' }}>{f.plugin_name}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>{f.mitre_technique || 'Analysis'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6, background: f.severity === 'Critical' ? 'var(--red)' : 'var(--amber)' }} />
                      {f.severity} severity
                    </div>
                  </div>
                ))
              )}
            </div>

            <EvidenceLog finding={selectedFinding} />
            <AIFinding
              finding={selectedFinding}
              onUpdate={fetchData}
              onReevaluating={(val) => setIsReevaluating(val)}
            />
          </div>
        ) : (
          <ManualBrowser findings={findings} />
        )}
      </div>

      {/* ── AI Intelligence Report (always visible, below workspace) ── */}
      <div className="hide-on-print">
        <AIReport
          findings={findings}
          evidenceFileName={evidence?.file_name}
          caseDesignation={caseData.case_designation}
        />
      </div>

      {/* ── Footer bar ──────────────────────────────────────── */}
      <div className="hide-on-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 32 }}>
        <button className="btn-primary" onClick={handlePrint}>Export PDF Report</button>
      </div>

      {/* ─────────────────────────────────────────────────────
          PRINT-ONLY REPORT — Dark branded PDF
      ───────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────
          PRINT-ONLY REPORT — Professional White Corporate PDF
      ───────────────────────────────────────────────────── */}
      <div className="print-only" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#1a1a1a', lineHeight: 1.6 }}>

        {/* ── Report Cover Header ── */}
        <div style={{ borderBottom: '3px solid #9D00FF', paddingBottom: 24, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#9D00FF', margin: '0 0 6px 0', fontWeight: 600 }}>
                Inzex Forensics — Unicorn Engine
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 4px 0', color: '#111', textTransform: 'uppercase', letterSpacing: 1 }}>
                Memory Forensics Incident Report
              </h1>
              <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
                Confidential — For Authorized Personnel Only
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#888', lineHeight: 1.8 }}>
              <p style={{ margin: 0 }}>Generated: {new Date().toLocaleString()}</p>
              <p style={{ margin: 0 }}>Engine: Volatility 3 + Gemma 4</p>
              <p style={{ margin: 0 }}>Platform: AMD ROCm Accelerated</p>
            </div>
          </div>
        </div>

        {/* ── Case Metadata Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 28, padding: '16px 20px', background: '#f8f8fa', border: '1px solid #e5e5ea', borderRadius: 8 }}>
          {[
            ['Case Designation', caseData.case_designation],
            ['Memory Source', evidence?.file_name || 'N/A'],
            ['Lead Investigator', caseData.lead_investigator || 'Unknown'],
            ['Total Findings', String(findings.length)],
          ].map(([label, val]) => (
            <div key={label}>
              <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, color: '#999', margin: '0 0 4px 0', fontWeight: 600 }}>{label}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#222', margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>

        {/* ── Two-Column: Executive Summary + Key Findings ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          {/* Left: Executive Summary */}
          <div style={{ padding: '16px 20px', background: '#f8f8fa', border: '1px solid #e5e5ea', borderRadius: 8 }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#9D00FF', fontWeight: 700, margin: '0 0 10px 0', borderBottom: '1px solid #e5e5ea', paddingBottom: 8 }}>
              Executive Summary
            </p>
            <p style={{ fontSize: 12, color: '#444', lineHeight: 1.7, margin: 0 }}>
              Memory forensics analysis of <strong>{evidence?.file_name}</strong> identified <strong>{findings.length}</strong> finding{findings.length !== 1 ? 's' : ''} requiring analyst review.
              {findings.filter(f => f.severity === 'Critical').length > 0 && (
                <> <strong style={{ color: '#d32f2f' }}>{findings.filter(f => f.severity === 'Critical').length} critical-severity</strong> finding{findings.filter(f => f.severity === 'Critical').length !== 1 ? 's were' : ' was'} detected.</>
              )}
              {findings.length === 0 && ' No anomalies were detected — the memory image appears clean.'}
            </p>
          </div>

          {/* Right: Key Findings Bullet Points */}
          <div style={{ padding: '16px 20px', background: '#f8f8fa', border: '1px solid #e5e5ea', borderRadius: 8 }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#9D00FF', fontWeight: 700, margin: '0 0 10px 0', borderBottom: '1px solid #e5e5ea', paddingBottom: 8 }}>
              Key Findings at a Glance
            </p>
            {findings.length === 0 ? (
              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>No threats identified.</p>
            ) : (
              <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
                {findings.map((f, i) => (
                  <li key={i} style={{ fontSize: 12, color: '#444', lineHeight: 1.6, marginBottom: 4 }}>
                    <strong style={{ color: f.severity === 'Critical' ? '#d32f2f' : f.severity === 'High' ? '#e65100' : '#555' }}>
                      [{f.severity}]
                    </strong>{' '}
                    {f.mitre_technique || 'Memory anomaly'} — {f.plugin_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Detailed Findings ── */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#9D00FF', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '2px solid #9D00FF', paddingBottom: 8, display: 'inline-block' }}>
            Detailed Finding Analysis
          </p>
        </div>

        {findings.length === 0 ? (
          <div style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#166534', fontWeight: 600, margin: 0 }}>✓ No threats detected — Memory image is clean</p>
          </div>
        ) : (
          findings.map((f, idx) => {
            const sevColor = { Critical: '#d32f2f', High: '#e65100', Medium: '#f57c00', Low: '#2e7d32', Info: '#1976d2' }[f.severity || 'Info'] || '#666';
            return (
              <div key={f.id} style={{ border: '1px solid #e5e5ea', borderLeft: `4px solid ${sevColor}`, borderRadius: 8, padding: '18px 22px', marginBottom: 16, pageBreakInside: 'avoid', background: '#fff' }}>
                {/* Finding header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: 2, color: '#999', textTransform: 'uppercase', margin: '0 0 4px 0', fontWeight: 600 }}>
                      Finding {idx + 1} — {f.plugin_name}
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>
                      {f.mitre_technique || 'Memory Analysis Finding'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, color: '#fff', background: sevColor }}>
                      {f.severity}
                    </span>
                    {f.status === 'approved' && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, color: '#2e7d32', background: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                        ✓ Approved
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Rationale */}
                <div style={{ marginBottom: f.human_feedback ? 14 : 0 }}>
                  <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#999', fontWeight: 600, margin: '0 0 6px 0' }}>AI Analysis</p>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: '#333', margin: 0 }}>{f.ai_rationale || 'No analysis available.'}</p>
                </div>

                {/* Analyst Feedback */}
                {f.human_feedback && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#f8f8fa', borderLeft: '3px solid #9D00FF', borderRadius: '0 6px 6px 0' }}>
                    <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#999', fontWeight: 600, margin: '0 0 4px 0' }}>Analyst Feedback</p>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: '#555', margin: 0, fontStyle: 'italic' }}>"{f.human_feedback}"</p>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: '2px solid #e5e5ea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>
            Inzex Forensics — Unicorn Engine • AMD ROCm • Volatility 3 • Gemma 4
          </p>
          <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>
            Page 1 of 1 • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

    </div>
  );
}
