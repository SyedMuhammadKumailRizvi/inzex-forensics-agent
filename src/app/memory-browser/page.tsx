import Link from 'next/link';

export default function MemoryBrowser() {
  return (
    <div className="app">
      <div className="top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div className="breadcrumb" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1 }}>CASE-INZ-104 / <span style={{ color: 'var(--text-secondary)' }}>manual memory inspection</span></div>
        <div className="mode-toggle" style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
          <Link href="/workspace" style={{ textDecoration: 'none' }}>
            <button className="mode-btn" style={{ fontFamily: 'var(--sans)', fontSize: 12, padding: '7px 16px', background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>Human Review Workspace</button>
          </Link>
          <button className="mode-btn active" style={{ fontFamily: 'var(--sans)', fontSize: 12, padding: '7px 16px', background: 'var(--red-dim)', color: '#E9989E', border: 'none', cursor: 'pointer' }}>Process Browser</button>
        </div>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <input className="filter-input" type="text" placeholder="Filter — e.g. PID == 666, Process == svchost.exe" defaultValue="Process == svchost.exe" style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-primary)' }} />
        <div className="filter-chip flagged" style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '9px 14px', borderRadius: 7, border: '1px solid var(--red-glow)', color: '#D98A90', background: 'var(--red-dim)', whiteSpace: 'nowrap', cursor: 'pointer' }}>● 7 AI-flagged</div>
        <div className="filter-chip" style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '9px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-raised)', color: 'var(--text-secondary)', whiteSpace: 'nowrap', cursor: 'pointer' }}>128 Processes</div>
        <div className="filter-chip" style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '9px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-raised)', color: 'var(--text-secondary)', whiteSpace: 'nowrap', cursor: 'pointer' }}>Plugin: windows.pslist</div>
      </div>

      <div className="table-wrap" style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg-surface)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 12 }}>
          <thead>
            <tr>
              <th className="col-pid" style={{ width: 80, fontWeight: 700, textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>PID</th>
              <th style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>Process Name</th>
              <th className="col-ppid" style={{ width: 80, textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>PPID</th>
              <th className="col-offset" style={{ fontFamily: 'var(--mono)', width: 160, textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>Offset (V)</th>
              <th style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>Threads</th>
              <th style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>Handles</th>
              <th style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>Session</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }} className="col-pid">4</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>System</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }} className="col-ppid">0</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }} className="col-offset">0x000000000000</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>120</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>400</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>N/A</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }} className="col-pid">312</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>smss.exe</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }} className="col-ppid">4</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }} className="col-offset">0x0000020A1000</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>5</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>50</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>0</td>
            </tr>
            <tr className="flagged selected" style={{ background: 'rgba(179,37,47,0.06)', outline: '1px solid var(--red)', outlineOffset: -1 }}>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }} className="col-pid"><span className="badge-flag" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', marginRight: 8 }}></span>666</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>svchost.exe</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }} className="col-ppid">500</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }} className="col-offset">0x0000020B4C00</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>3</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>15</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>0</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }} className="col-pid">704</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>lsass.exe</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }} className="col-ppid">500</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }} className="col-offset">0x0000020A8000</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>10</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>250</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>0</td>
            </tr>
            <tr className="flagged" style={{ background: 'rgba(179,37,47,0.06)' }}>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }} className="col-pid"><span className="badge-flag" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', marginRight: 8 }}></span>1337</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>powershell.exe</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }} className="col-ppid">666</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }} className="col-offset">0x0000010A1000</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>1</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>45</td>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>1</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="detail-panel" style={{ marginTop: 16, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-surface)', padding: '18px 20px' }}>
        <p className="detail-title" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 14px' }}>Process 666 — detail</p>
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="detail-tree" style={{ fontFamily: 'var(--mono)', fontSize: 11.5, lineHeight: 2.1, color: 'var(--text-secondary)' }}>
            <div><span className="k" style={{ color: 'var(--text-tertiary)' }}>ImageFileName:</span> <span className="v" style={{ color: 'var(--text-primary)' }}>svchost.exe</span></div>
            <div><span className="k" style={{ color: 'var(--text-tertiary)' }}>Virtual Offset:</span> <span className="v" style={{ color: 'var(--text-primary)' }}>0x0000020B4C00</span></div>
            <div><span className="k" style={{ color: 'var(--text-tertiary)' }}>Parent PID:</span> <span className="v" style={{ color: 'var(--text-primary)' }}>500 (services.exe)</span></div>
            <div><span className="k" style={{ color: 'var(--text-tertiary)' }}>Create Time:</span> <span className="v" style={{ color: 'var(--text-primary)' }}>2026-07-06 14:22:05 UTC</span></div>
            <div className="flag-row" style={{ color: '#D98A90' }}><span className="k" style={{ color: 'var(--text-tertiary)' }}>Memory Protection:</span> <span className="v" style={{ color: 'var(--text-primary)' }}>PAGE_EXECUTE_READWRITE</span> — Anomalous for svchost</div>
            <div className="flag-row" style={{ color: '#D98A90' }}><span className="k" style={{ color: 'var(--text-tertiary)' }}>AI Note:</span> Cited as evidence for T1055 Process Injection</div>
          </div>
          <div className="hex-dump" style={{ fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 1.9, color: 'var(--text-tertiary)', background: 'var(--bg-page)', border: '1px solid var(--border-soft)', borderRadius: 6, padding: '12px 14px', whiteSpace: 'pre', overflowX: 'auto' }}>
            0x0000020b4c00  4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00  <span className="hi" style={{ color: 'var(--red)' }}>MZ..............</span>
            <br />0x0000020b4c10  b8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00  <span className="hi" style={{ color: 'var(--red)' }}>........@.......</span>
            <br />0x0000020b4c20  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
            <br />0x0000020b4c30  00 00 00 00 00 00 00 00 00 00 00 00 f0 00 00 00  ................
          </div>
        </div>
      </div>

      <div className="footer-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <div className="footer-note" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Right click any process to run `windows.memmap` or extract PE image.</div>
        <Link href="/workspace" style={{ textDecoration: 'none' }}>
          <button className="btn-outline">← Back to AI Review</button>
        </Link>
      </div>

    </div>
  );
}
