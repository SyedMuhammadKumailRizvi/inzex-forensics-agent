import React from 'react';
import { Finding } from '@/types/database';

interface AIReportProps {
  findings: Finding[];
  evidenceFileName?: string;
  caseDesignation?: string;
}

const SEVERITY_COLOR: Record<string, string> = {
  Critical: '#FF4444',
  High: '#FF8C00',
  Medium: '#F5A623',
  Low: '#4CAF50',
  Info: '#64B5F6',
};

export function AIReport({ findings, evidenceFileName, caseDesignation }: AIReportProps) {
  if (findings.length === 0) return null;

  const criticalCount = findings.filter(f => f.severity === 'Critical').length;
  const highCount = findings.filter(f => f.severity === 'High').length;
  const approvedCount = findings.filter(f => f.status === 'approved').length;

  const summaryBullets = findings.map(f => {
    const sev = f.severity || 'Unknown';
    const mitre = f.mitre_technique || 'Unknown technique';
    const plugin = f.plugin_name;
    return `${sev} severity — ${mitre} detected via ${plugin}`;
  });

  return (
    <div
      id="ai-report-section"
      style={{
        marginTop: 36,
        borderTop: '1px solid var(--border)',
        paddingTop: 28,
      }}
    >
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 3, height: 28, background: 'var(--red)', borderRadius: 2, flexShrink: 0 }} />
        <div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: 0 }}>
            Gemma 4 — Full Incident Analysis
          </p>
          <h2 style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '3px 0 0 0', letterSpacing: 0.5 }}>
            AI Intelligence Report
          </h2>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          {criticalCount > 0 && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '4px 10px', borderRadius: 4, background: 'rgba(255,68,68,0.12)', color: '#FF4444', border: '1px solid rgba(255,68,68,0.3)' }}>
              {criticalCount} Critical
            </span>
          )}
          {highCount > 0 && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '4px 10px', borderRadius: 4, background: 'rgba(255,140,0,0.12)', color: '#FF8C00', border: '1px solid rgba(255,140,0,0.3)' }}>
              {highCount} High
            </span>
          )}
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '4px 10px', borderRadius: 4, background: 'rgba(76,175,80,0.12)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)' }}>
            {approvedCount}/{findings.length} Approved
          </span>
        </div>
      </div>

      {/* Executive Summary */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '18px 22px',
        marginBottom: 20,
      }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 14px 0' }}>
          Executive Summary
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 14px 0' }}>
          Memory forensics analysis of <strong style={{ color: 'var(--text-primary)' }}>{evidenceFileName || 'the submitted image'}</strong> for case <strong style={{ color: 'var(--text-primary)' }}>{caseDesignation}</strong> identified <strong style={{ color: 'var(--text-primary)' }}>{findings.length}</strong> finding{findings.length !== 1 ? 's' : ''} requiring analyst review.
        </p>
        <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {summaryBullets.map((bullet, i) => (
            <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {bullet}
            </li>
          ))}
        </ul>
      </div>

      {/* Per-finding detail cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {findings.map((f, idx) => {
          const sevColor = SEVERITY_COLOR[f.severity || 'Info'] || '#888';
          return (
            <div
              key={f.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${sevColor}`,
                borderRadius: 10,
                padding: '18px 22px',
                position: 'relative',
              }}
            >
              {/* Finding header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Finding {idx + 1}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 7px', borderRadius: 3, background: 'rgba(169, 130, 237, 0.1)', color: '#A982ED', border: '1px solid rgba(169,130,237,0.3)' }}>
                      {f.plugin_name}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {f.mitre_technique || 'Memory Analysis Finding'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '4px 10px', borderRadius: 4, background: `${sevColor}1A`, color: sevColor, border: `1px solid ${sevColor}4D` }}>
                    {f.severity || 'Unknown'}
                  </span>
                  {f.status === 'approved' && (
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 10px', borderRadius: 4, background: 'rgba(76,175,80,0.1)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      ✓ Approved
                    </span>
                  )}
                </div>
              </div>

              {/* AI Rationale */}
              <div style={{ marginBottom: f.human_feedback ? 14 : 0 }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 8px 0' }}>
                  AI Rationale
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
                  {f.ai_rationale || 'No rationale available.'}
                </p>
              </div>

              {/* Human Feedback (if any) */}
              {f.human_feedback && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 6px 0' }}>
                    Analyst Feedback
                  </p>
                  <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                    "{f.human_feedback}"
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
