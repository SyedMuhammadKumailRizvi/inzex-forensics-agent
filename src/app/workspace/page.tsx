'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Workspace() {
  useEffect(() => {
    function drawThread() {
      const ws = document.getElementById('workspace');
      const selected = document.querySelector('.stage-card.selected');
      const hits = document.querySelectorAll('.log-line.hit');
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

    const cards = document.querySelectorAll('.stage-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        setTimeout(drawThread, 30);
      });
    });

    setTimeout(drawThread, 60);
    window.addEventListener('resize', drawThread);
    return () => window.removeEventListener('resize', drawThread);
  }, []);

  return (
    <div className="app">
      <div className="case-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 28 }}>
        <div>
          <div className="case-label" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Acme Cyber Defense — Inzex Forensics</div>
          <div className="case-id" style={{ fontFamily: 'var(--mono)', fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 1 }}>CASE // <span style={{ color: 'var(--red)' }}>INZ-104</span></div>
        </div>
        <div className="case-meta" style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
          <div className="meta-item" style={{ textAlign: 'right' }}>
            <div className="meta-label" style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Memory Source</div>
            <div className="meta-value" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-secondary)' }}>win2019-dc01-suspect.raw</div>
          </div>
          <div className="meta-item" style={{ textAlign: 'right' }}>
            <div className="meta-label" style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Backend processing</div>
            <div className="meta-value" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-secondary)' }}>Volatility 3 (AMD Accelerated)</div>
          </div>
          <div className="status-pill" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', padding: '6px 14px', borderRadius: 3, background: 'var(--red-dim)', color: '#E9989E', border: '1px solid var(--red-glow)' }}>7 AI Findings pending review</div>
        </div>
      </div>

      <div className="workspace" id="workspace" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: 20 }}>
        <svg id="thread-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
          <path id="thread-path" d="" style={{ fill: 'none', stroke: 'var(--red)', strokeWidth: 1.5, strokeDasharray: '6 4', opacity: 0.85 }} />
        </svg>

        <div className="panel" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column' }}>
          <p className="panel-title" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 3px' }}>Forensic Analysis Stages</p>
          <p className="panel-sub" style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Volatility 3 Plugins executed</p>

          <div className="stage-card" data-stage="1" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 10, cursor: 'pointer', transition: 'border-color .15s', background: 'var(--bg-raised)' }}>
            <div className="stage-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><span className="stage-num" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>windows.pslist</span></div>
            <p className="stage-name" style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>Process Listing</p>
            <p className="stage-technique" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Extracting active processes</p>
            <div className="stage-conf-row" style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}><span className="confidence-dot dot-medium" style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6, background: 'var(--amber)' }}></span>1 finding</div>
          </div>

          <div className="stage-card selected" data-stage="2" style={{ border: '1px solid var(--red)', borderRadius: 8, padding: '12px 14px', marginBottom: 10, cursor: 'pointer', transition: 'border-color .15s', background: 'var(--red-dim)' }}>
            <div className="stage-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><span className="stage-num" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#D98A90' }}>windows.malfind</span></div>
            <p className="stage-name" style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>Injected Code Detection</p>
            <p className="stage-technique" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>T1055 — Process Injection</p>
            <div className="stage-conf-row" style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}><span className="confidence-dot dot-high" style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6, background: 'var(--red)' }}></span>2 findings (Critical)</div>
          </div>

          <div className="stage-card" data-stage="3" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 10, cursor: 'pointer', transition: 'border-color .15s', background: 'var(--bg-raised)' }}>
            <div className="stage-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><span className="stage-num" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>windows.netstat</span></div>
            <p className="stage-name" style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>Network Connections</p>
            <p className="stage-technique" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>T1041 — Exfiltration Over C2</p>
            <div className="stage-conf-row" style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}><span className="confidence-dot dot-high" style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6, background: 'var(--red)' }}></span>4 findings</div>
          </div>

          <div className="stage-card" data-stage="4" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 10, cursor: 'pointer', transition: 'border-color .15s', background: 'var(--bg-raised)' }}>
            <div className="stage-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><span className="stage-num" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>windows.ssdt</span></div>
            <p className="stage-name" style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>System Service Hooks</p>
            <p className="stage-technique" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>T1014 — Rootkit</p>
            <div className="stage-conf-row" style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}><span className="confidence-dot dot-medium" style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6, background: 'var(--amber)' }}></span>0 findings</div>
          </div>
        </div>

        <div className="panel" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column' }}>
          <p className="panel-title" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 3px' }}>Raw Volatility 3 Output</p>
          <p className="panel-sub" style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Plugin: windows.malfind | Total findings: 2</p>
          <div className="evidence-log" style={{ fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.9, background: 'var(--bg-page)', border: '1px solid var(--border-soft)', borderRadius: 6, padding: '14px 16px', maxHeight: 480, overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
            <div className="log-line log-header" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-soft)', paddingBottom: 6, marginBottom: 6, fontWeight: 700, whiteSpace: 'pre', paddingLeft: 10, borderLeft: '2px solid transparent' }}>PID   Process         Start VPN         End VPN           Tag   Protection  CommitCharge</div>
            <div className="log-line" style={{ color: 'var(--text-tertiary)', whiteSpace: 'pre', padding: '2px 0 2px 10px', borderLeft: '2px solid transparent' }}><span className="ts" style={{ color: '#5C5C61' }}>4</span>     System          <span className="ts" style={{ color: '#5C5C61' }}>0x000000000000</span>    <span className="ts" style={{ color: '#5C5C61' }}>0x000000000000</span>    <span className="ts" style={{ color: '#5C5C61' }}>---</span>   <span className="ts" style={{ color: '#5C5C61' }}>PAGE_EXECUTE_READ</span>  0</div>
            <div className="log-line" style={{ color: 'var(--text-tertiary)', whiteSpace: 'pre', padding: '2px 0 2px 10px', borderLeft: '2px solid transparent' }}><span className="ts" style={{ color: '#5C5C61' }}>312</span>   smss.exe        <span className="ts" style={{ color: '#5C5C61' }}>0x000000000000</span>    <span className="ts" style={{ color: '#5C5C61' }}>0x000000000000</span>    <span className="ts" style={{ color: '#5C5C61' }}>---</span>   <span className="ts" style={{ color: '#5C5C61' }}>PAGE_EXECUTE_READ</span>  0</div>
            <div className="log-line" style={{ color: 'var(--text-tertiary)', whiteSpace: 'pre', padding: '2px 0 2px 10px', borderLeft: '2px solid transparent' }}><span className="ts" style={{ color: '#5C5C61' }}>420</span>   csrss.exe       <span className="ts" style={{ color: '#5C5C61' }}>0x000000000000</span>    <span className="ts" style={{ color: '#5C5C61' }}>0x000000000000</span>    <span className="ts" style={{ color: '#5C5C61' }}>---</span>   <span className="ts" style={{ color: '#5C5C61' }}>PAGE_EXECUTE_READ</span>  0</div>
            <div className="log-line hit" style={{ color: 'var(--text-primary)', whiteSpace: 'pre', padding: '2px 0 2px 10px', borderLeft: '2px solid var(--red)', background: 'rgba(179,37,47,0.08)' }}>
              <span className="ts" style={{ color: '#D98A90' }}>666</span>   svchost.exe     <span className="ts" style={{ color: '#D98A90' }}>0x0000020B4C00</span>    <span className="ts" style={{ color: '#D98A90' }}>0x0000020B4FFF</span>    <span className="ts" style={{ color: '#D98A90' }}>VadS</span>  <span className="ts" style={{ color: '#D98A90' }}>PAGE_EXECUTE_READWRITE</span> 1
              <br />        Hexdump:
              <br />        0x0000020b4c00  4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00   MZ..............
              <br />        0x0000020b4c10  b8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00   ........@.......
            </div>
            <div className="log-line" style={{ color: 'var(--text-tertiary)', whiteSpace: 'pre', padding: '2px 0 2px 10px', borderLeft: '2px solid transparent' }}><span className="ts" style={{ color: '#5C5C61' }}>704</span>   lsass.exe       <span className="ts" style={{ color: '#5C5C61' }}>0x000000000000</span>    <span className="ts" style={{ color: '#5C5C61' }}>0x000000000000</span>    <span className="ts" style={{ color: '#5C5C61' }}>---</span>   <span className="ts" style={{ color: '#5C5C61' }}>PAGE_EXECUTE_READ</span>  0</div>
            <div className="log-line hit" style={{ color: 'var(--text-primary)', whiteSpace: 'pre', padding: '2px 0 2px 10px', borderLeft: '2px solid var(--red)', background: 'rgba(179,37,47,0.08)' }}>
              <span className="ts" style={{ color: '#D98A90' }}>1337</span>  powershell.exe  <span className="ts" style={{ color: '#D98A90' }}>0x0000010A1000</span>    <span className="ts" style={{ color: '#D98A90' }}>0x0000010A2000</span>    <span className="ts" style={{ color: '#D98A90' }}>VadS</span>  <span className="ts" style={{ color: '#D98A90' }}>PAGE_EXECUTE_READWRITE</span> 1
              <br />        Hexdump:
              <br />        0x0000010a1000  fc 48 83 e4 f0 e8 c0 00 00 00 41 51 41 50 52 51   .H........AQAPRQ
              <br />        0x0000010a1010  56 48 31 d2 65 48 8b 52 60 48 8b 52 18 48 8b 52   VH1.eH.R`H.R.H.R
            </div>
          </div>
        </div>

        <div className="panel" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column' }}>
          <p className="panel-title" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 3px' }}>Gemma 3 AI Inference</p>
          <p className="panel-sub" style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Plugin: windows.malfind</p>
          
          <div className="finding-badge" style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', marginBottom: 12, background: '#251B33', color: '#A982ED', border: '1px solid #3B2A52' }}>Mitre ATT&CK // T1055 Process Injection</div>
          
          <div className="conf-score" style={{ fontFamily: 'var(--mono)', fontSize: 34, fontWeight: 700, color: 'var(--amber)', margin: '4px 0 2px' }}>94%</div>
          <div className="conf-note" style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 18, padding: '10px 12px', background: 'var(--amber-dim)', border: '1px solid #4A3A15', borderRadius: 6 }}>Critical finding — Process ID 666 (svchost.exe) contains a hidden executable memory segment with an injected PE file (MZ header detected).</div>
          <p className="rationale" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 18, margin: 0 }}>Gemma 3 Analysis: Valid svchost.exe instances should not have dynamically allocated PAGE_EXECUTE_READWRITE memory containing a PE header. This strongly indicates hollow process injection or shellcode execution attempting to masquerade as a legitimate Windows service.</p>
          
          <div className="review-actions" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, marginTop: 18 }}>
            <button className="btn btn-confirm" style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, padding: '9px 0', width: '100%', borderRadius: 6, border: '1px solid var(--red)', background: 'var(--red)', color: '#fff', cursor: 'pointer' }}>Approve / Add to Report</button>
            <button className="btn btn-dismiss" style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, padding: '9px 0', width: '100%', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Reject / Dismiss</button>
          </div>
          <textarea placeholder="Add analyst notes for the final DFIR report..." style={{ width: '100%', background: 'var(--bg-page)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 13, padding: '10px 12px', resize: 'none', height: 64 }}></textarea>
          <div className="analyst-row" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-soft)' }}>
            <div className="avatar" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--red-dim)', color: '#D98A90', fontFamily: 'var(--mono)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--red-glow)' }}>KR</div>
            <div className="analyst-name" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pending review by K. Rizvi</div>
          </div>
        </div>
      </div>

      <div className="footer-bar" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
        <Link href="/memory-browser" style={{ textDecoration: 'none' }}>
          <button className="btn-outline">Browse raw memory structures</button>
        </Link>
        <button className="btn-primary">Export JSON Report</button>
      </div>

    </div>
  );
}
