'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { EvidenceLog } from '@/components/workspace/evidence-log';
import { AIFinding } from '@/components/workspace/ai-finding';
import { ManualBrowser } from '@/components/workspace/manual-browser';
import { Case, Finding, Evidence } from '@/types/database';

export default function Workspace({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [activeTab, setActiveTab] = useState<'ai-review' | 'manual-browser'>('ai-review');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const supabase = createClient();
    
    // Fetch Case
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

    // Fetch Findings
    const { data: findingsRows } = await supabase
      .from('findings')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });
      
    if (findingsRows) {
      setFindings(findingsRows as Finding[]);
      
      // Update selected finding to preserve state
      setSelectedFinding(prev => {
        if (!prev) return findingsRows.length > 0 ? findingsRows[0] as Finding : null;
        const updated = findingsRows.find(f => f.id === prev.id);
        return updated ? (updated as Finding) : prev;
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Setup polling if any finding is rechecking
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
    // Re-bind the SVG thread drawing when findings render
    function drawThread() {
      const ws = document.getElementById('workspace');
      const selected = document.querySelector('.stage-card.selected');
      const hits = document.querySelectorAll('.evidence-log .log-line');
      if (!selected || hits.length === 0 || !ws) return;
      
      const wsRect = ws.getBoundingClientRect();
      const sRect = selected.getBoundingClientRect();
      const startX = sRect.right - wsRect.left;
      const startY = sRect.top - wsRect.top + sRect.height / 2;
      
      const target = hits[0]; // Pointing to first hit
      const tRect = target.getBoundingClientRect();
      const endX = tRect.left - wsRect.left;
      const endY = tRect.top - wsRect.top + 20; // adjust point slightly down
      
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app print-friendly">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 20mm; size: auto; }
          body { background: white !important; color: #111 !important; font-family: sans-serif; }
          .app { padding: 0 !important; max-width: 100% !important; background: white !important; }
          .hide-on-print { display: none !important; }
          .print-only { display: block !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .print-only { display: none; }
      `}} />
      <div className="case-header hide-on-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 28 }}>
        <div>
          <div className="case-label" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Inzex Forensics — {caseData.lead_investigator || 'Unknown Analyst'}
          </div>
          <div className="case-id" style={{ fontFamily: 'var(--mono)', fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 1 }}>
            CASE: <span style={{ color: 'var(--red)' }}>{caseData.case_designation}</span>
          </div>
        </div>
        <div className="case-meta" style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
          <div className="meta-item" style={{ textAlign: 'right' }}>
            <div className="meta-label" style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Memory Source</div>
            <div className="meta-value" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
              {evidence?.file_name || 'Pending...'}
            </div>
          </div>
          <div className="meta-item" style={{ textAlign: 'right' }}>
            <div className="meta-label" style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Backend processing</div>
            <div className="meta-value" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-secondary)' }}>Volatility 3 (AMD Accelerated)</div>
          </div>
          <div className="status-pill" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', padding: '6px 14px', borderRadius: 3, background: 'var(--red-dim)', color: '#D6A6FF', border: '1px solid var(--red-glow)' }}>
            {findings.length} AI Findings
          </div>
        </div>
      </div>

      <div className="top-row hide-on-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ flex: 1 }}></div>
        <div className="mode-toggle" style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
          <button 
            onClick={() => setActiveTab('ai-review')}
            className={`mode-btn ${activeTab === 'ai-review' ? 'active' : ''}`} 
            style={{ fontFamily: 'var(--sans)', fontSize: 12, padding: '7px 16px', background: activeTab === 'ai-review' ? 'var(--red-dim)' : 'var(--bg-surface)', color: activeTab === 'ai-review' ? '#D6A6FF' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
          >
            Human Review Workspace
          </button>
          <button 
            onClick={() => setActiveTab('manual-browser')}
            className={`mode-btn ${activeTab === 'manual-browser' ? 'active' : ''}`} 
            style={{ fontFamily: 'var(--sans)', fontSize: 12, padding: '7px 16px', background: activeTab === 'manual-browser' ? 'var(--red-dim)' : 'var(--bg-surface)', color: activeTab === 'manual-browser' ? '#D6A6FF' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
          >
            Process Browser
          </button>
        </div>
      </div>

      <div className="hide-on-print">
        {activeTab === 'ai-review' ? (
          <div className="workspace" id="workspace" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: 20 }}>
            <svg id="thread-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
              <path id="thread-path" d="" style={{ fill: 'none', stroke: 'var(--red)', strokeWidth: 1.5, strokeDasharray: '6 4', opacity: 0.85 }} />
            </svg>

          <div className="panel" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column' }}>
            <p className="panel-title" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 3px' }}>Forensic Analysis Stages</p>
            <p className="panel-sub" style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Volatility 3 Plugins executed</p>

            {findings.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 13, padding: 12 }}>Waiting for Unicorn Engine analysis to complete...</p>
            ) : (
              findings.map((f, i) => (
                <div 
                  key={f.id}
                  className={`stage-card ${selectedFinding?.id === f.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFinding(f)}
                  style={{ border: `1px solid ${selectedFinding?.id === f.id ? 'var(--red)' : 'var(--border)'}`, borderRadius: 8, padding: '12px 14px', marginBottom: 10, cursor: 'pointer', transition: 'border-color .15s', background: selectedFinding?.id === f.id ? 'var(--red-dim)' : 'var(--bg-raised)' }}
                >
                  <div className="stage-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className="stage-num" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: selectedFinding?.id === f.id ? '#C58AFF' : 'var(--text-tertiary)' }}>{f.plugin_name}</span>
                  </div>
                  <p className="stage-name" style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>{f.mitre_technique || 'Analysis'}</p>
                  <div className="stage-conf-row" style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
                    <span className={`confidence-dot ${f.severity === 'Critical' ? 'dot-high' : 'dot-medium'}`} style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6, background: f.severity === 'Critical' ? 'var(--red)' : 'var(--amber)' }}></span>
                    {f.severity} severity
                  </div>
                </div>
              ))
            )}
          </div>

          <EvidenceLog finding={selectedFinding} />
          <AIFinding finding={selectedFinding} onUpdate={fetchData} />

          </div>
        ) : (
          <ManualBrowser findings={findings} />
        )}
      </div>

      <div className="footer-bar hide-on-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
        <button className="btn-primary" onClick={handlePrint}>Export PDF Report</button>
      </div>

      {/* --- PRINT ONLY REPORT --- */}
      <div className="print-only" style={{ color: 'black' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Inzex Forensics Incident Report</h1>
          <p style={{ fontSize: '14px', margin: 0, color: '#444' }}>Case Designation: <strong>{caseData.case_designation}</strong></p>
          <p style={{ fontSize: '14px', margin: '5px 0 0 0', color: '#444' }}>Lead Investigator: {caseData.lead_investigator || 'Unknown Analyst'}</p>
          <p style={{ fontSize: '14px', margin: '5px 0 0 0', color: '#444' }}>Generated: {new Date().toLocaleString()}</p>
        </div>

        <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>Executive Summary</h2>
        <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' }}>
          This report details the automated memory forensics analysis conducted on <strong>{evidence?.file_name}</strong>. 
          A total of <strong>{findings.length}</strong> findings were identified by the AI inference engine.
        </p>

        <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>Detailed Findings</h2>
        {findings.map((f) => (
          <div key={f.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '20px', pageBreakInside: 'avoid' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{f.mitre_technique || 'Analysis Finding'}</span>
              <span style={{ fontWeight: 'bold', color: f.severity === 'Critical' ? '#d32f2f' : '#f57c00' }}>{f.severity} Severity</span>
            </div>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0', fontFamily: 'monospace' }}>Plugin: {f.plugin_name}</p>
            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
              <strong>AI Rationale:</strong>
              <p style={{ marginTop: '5px' }}>{f.ai_rationale}</p>
            </div>
            {f.human_feedback && (
              <div style={{ fontSize: '13px', lineHeight: '1.5', marginTop: '15px', padding: '10px', background: '#f5f5f5', borderLeft: '3px solid #666' }}>
                <strong>Analyst Feedback:</strong> {f.human_feedback}
              </div>
            )}
            <div style={{ fontSize: '13px', lineHeight: '1.5', marginTop: '15px', padding: '10px', background: '#f5f5f5', borderLeft: '3px solid #1976d2' }}>
                <strong>Status:</strong> {f.status.toUpperCase()}
            </div>
          </div>
        ))}

        <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
          <p>Generated securely via Inzex Forensics Unicorn Engine.</p>
        </div>
      </div>

    </div>
  );
}
