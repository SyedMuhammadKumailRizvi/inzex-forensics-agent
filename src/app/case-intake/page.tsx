import Link from 'next/link';

export default function CaseIntake() {
  return (
    <div className="app">
      <div className="brand-row" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44 }}>
        <div className="brand-mark" style={{ width: 26, height: 26, border: '1.5px solid var(--red)', borderRadius: 5, position: 'relative' }}></div>
        <div className="brand-name" style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: 2, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Inzex Forensics</div>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 600, margin: '0 0 6px' }}>Initialize DFIR Workspace</h1>
      <p className="subtitle" style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 40px' }}>
        Case details define the metadata for the Volatility 3 analysis run and final AI report.
      </p>

      <p className="section-label" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 16px', paddingTop: 0, borderTop: 'none' }}>Case details</p>
      <div className="field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="field" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Case number <span className="req" style={{ color: 'var(--red)' }}>*</span></label>
          <input type="text" placeholder="e.g. INZ-104" defaultValue="INZ-104" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }} />
        </div>
        <div className="field" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Date opened <span className="req" style={{ color: 'var(--red)' }}>*</span></label>
          <input type="date" defaultValue="2026-07-07" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }} />
        </div>
      </div>
      <div className="field" style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Case title <span className="req" style={{ color: 'var(--red)' }}>*</span></label>
        <input type="text" placeholder="Short descriptive title for this investigation" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }} />
      </div>
      <div className="field" style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Case summary</label>
        <textarea placeholder="Brief context — e.g. Suspected ransomware outbreak on DC-01, extracting memory via winpmem." style={{ resize: 'none', height: 76, width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }}></textarea>
      </div>

      <p className="section-label" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 16px', paddingTop: 8, borderTop: '1px solid var(--border-soft)' }}>Investigator</p>
      <div className="field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="field" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Consultant Name <span className="req" style={{ color: 'var(--red)' }}>*</span></label>
          <input type="text" placeholder="Full name" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }} />
        </div>
        <div className="field" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>MSP / Organization</label>
          <input type="text" placeholder="e.g. Acme Cyber Defense" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }} />
        </div>
      </div>
      <div className="field" style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Operating System Profile</label>
        <select style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%238B8B91\' stroke-width=\'1.5\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 13px center', width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }}>
          <option>Windows (Auto-detect version)</option>
          <option>Linux (Debian/Ubuntu)</option>
          <option>Linux (RHEL/CentOS)</option>
          <option>macOS</option>
        </select>
      </div>

      <p className="section-label" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 16px', paddingTop: 8, borderTop: '1px solid var(--border-soft)' }}>Evidence</p>
      <div className="field" style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Upload Memory Dump <span className="req" style={{ color: 'var(--red)' }}>*</span></label>
        <div className="upload-zone" style={{ border: '1.5px dashed var(--border)', borderRadius: 10, padding: '36px 20px', textAlign: 'center', background: 'var(--bg-surface)', marginTop: 6, cursor: 'pointer', transition: 'border-color .15s' }}>
          <div className="upload-icon" style={{ width: 36, height: 36, margin: '0 auto 14px', border: '1.5px solid var(--text-tertiary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}><path d="M8 11V3M8 3L5 6M8 3l3 3" stroke="#8B8B91" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.5 11v1.5A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V11" stroke="#8B8B91" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
          <div className="upload-title" style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Drop raw memory dump or click to browse</div>
          <div className="upload-hint" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Processed locally via Volatility 3 on AMD Hardware</div>
          <div className="upload-formats" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-tertiary)', marginTop: 10, letterSpacing: 0.5 }}>.RAW · .VMEM · .MEM · MAX 64GB</div>
        </div>
        <div className="file-chip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 7, padding: '10px 14px', marginTop: 10 }}>
          <div className="file-chip-left" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="file-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)' }}></div>
            <div>
              <div className="file-name" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-primary)' }}>win2019-dc01-suspect.raw</div>
              <div className="file-size" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>16.4 GB — Pending Volatility 3 Analysis</div>
            </div>
          </div>
          <div className="file-remove" style={{ fontSize: 11, color: 'var(--text-tertiary)', cursor: 'pointer' }}>remove</div>
        </div>
      </div>

      <div className="footer-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border-soft)' }}>
        <div className="footer-note" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Case ID <span style={{ color: 'var(--red)' }}>CASE-INZ-104</span> will be generated on submit</div>
        <Link href="/workspace" style={{ textDecoration: 'none' }}>
          <button className="btn-primary">Begin Analysis →</button>
        </Link>
      </div>

    </div>
  );
}
