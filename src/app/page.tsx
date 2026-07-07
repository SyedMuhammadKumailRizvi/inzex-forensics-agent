import Link from 'next/link';
import './globals.css';

export default function StartPage() {
  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <div className="brand-mark" style={{ width: 48, height: 48, borderWidth: 2, marginBottom: 20 }}></div>
      
      <h1 style={{ fontSize: '3rem', marginBottom: 16 }}>Inzex Forensics</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: 600, marginBottom: 48, lineHeight: 1.6 }}>
        Autonomous Digital Forensics & Incident Response Platform. 
        Leveraging Volatility 3 and Gemma 3 on AMD Hardware to parse raw memory dumps into actionable intelligence.
      </p>

      <div style={{ display: 'flex', gap: 24, marginBottom: 64 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '20px 32px', borderRadius: 8, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontFamily: 'var(--mono)' }}>AMD Hardware Status</div>
          <div style={{ color: '#E9989E', fontFamily: 'var(--mono)' }}>● Online / Accelerated</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '20px 32px', borderRadius: 8, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontFamily: 'var(--mono)' }}>Gemma 3 Inference</div>
          <div style={{ color: '#E9989E', fontFamily: 'var(--mono)' }}>● Ready</div>
        </div>
      </div>

      <Link href="/case-intake">
        <button className="btn-primary" style={{ padding: '16px 32px', fontSize: 16 }}>
          Initialize New Investigation →
        </button>
      </Link>
    </div>
  );
}
