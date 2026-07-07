'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Dropzone } from '@/components/intake/dropzone';

export default function CaseIntake() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    case_number: 'INZ-' + Math.floor(Math.random() * 900 + 100),
    date_opened: new Date().toISOString().split('T')[0],
    title: '',
    summary: '',
    investigator_name: '',
    organization: '',
    os_profile: 'Windows (Auto-detect version)'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a memory dump file.');
      return;
    }
    if (!formData.case_number || !formData.title || !formData.investigator_name) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = new FormData();
    payload.append('file', file);
    payload.append('case_number', formData.case_number);
    payload.append('title', formData.title);
    payload.append('summary', formData.summary);
    payload.append('investigator_name', formData.investigator_name);
    payload.append('organization', formData.organization);
    payload.append('os_profile', formData.os_profile);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: payload
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      router.push(`/workspace/${data.caseId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="brand-row" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44 }}>
        <Image src="/logo.png" alt="Logo" width={28} height={28} style={{ filter: 'drop-shadow(0 0 8px rgba(157,0,255,0.4))' }} />
        <div className="brand-name" style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: 2, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Inzex Forensics</div>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 600, margin: '0 0 6px' }}>Initialize DFIR Workspace</h1>
      <p className="subtitle" style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 40px' }}>
        Case details define the metadata for the Volatility 3 analysis run and final AI report.
      </p>

      {error && (
        <div style={{ background: 'var(--red-dim)', color: '#fff', border: '1px solid var(--red)', padding: 14, borderRadius: 8, marginBottom: 24, fontSize: 13 }}>
          {error}
        </div>
      )}

      <p className="section-label" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 16px', paddingTop: 0, borderTop: 'none' }}>Case details</p>
      <div className="field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="field" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Case number <span className="req" style={{ color: 'var(--red)' }}>*</span></label>
          <input type="text" name="case_number" value={formData.case_number} onChange={handleChange} placeholder="e.g. INZ-104" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }} />
        </div>
        <div className="field" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Date opened <span className="req" style={{ color: 'var(--red)' }}>*</span></label>
          <input type="date" name="date_opened" value={formData.date_opened} onChange={handleChange} style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }} />
        </div>
      </div>
      <div className="field" style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Case title <span className="req" style={{ color: 'var(--red)' }}>*</span></label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Short descriptive title for this investigation" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }} />
      </div>
      <div className="field" style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Case summary</label>
        <textarea name="summary" value={formData.summary} onChange={handleChange} placeholder="Brief context — e.g. Suspected ransomware outbreak on DC-01, extracting memory via winpmem." style={{ resize: 'none', height: 76, width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }}></textarea>
      </div>

      <p className="section-label" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 16px', paddingTop: 8, borderTop: '1px solid var(--border-soft)' }}>Investigator</p>
      <div className="field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="field" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Consultant Name <span className="req" style={{ color: 'var(--red)' }}>*</span></label>
          <input type="text" name="investigator_name" value={formData.investigator_name} onChange={handleChange} placeholder="Full name" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }} />
        </div>
        <div className="field" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>MSP / Organization</label>
          <input type="text" name="organization" value={formData.organization} onChange={handleChange} placeholder="e.g. Acme Cyber Defense" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }} />
        </div>
      </div>
      <div className="field" style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Operating System Profile</label>
        <select name="os_profile" value={formData.os_profile} onChange={handleChange} style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%238B8B91\' stroke-width=\'1.5\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 13px center', width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 14, padding: '11px 13px' }}>
          <option>Windows (Auto-detect version)</option>
          <option>Linux (Debian/Ubuntu)</option>
          <option>Linux (RHEL/CentOS)</option>
          <option>macOS</option>
        </select>
      </div>

      <p className="section-label" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 16px', paddingTop: 8, borderTop: '1px solid var(--border-soft)' }}>Evidence</p>
      
      <Dropzone onFileSelect={setFile} selectedFile={file} />

      <div className="footer-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border-soft)' }}>
        <div className="footer-note" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Case ID <span style={{ color: 'var(--red)' }}>CASE-{formData.case_number}</span> will be generated on submit</div>
        
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Uploading Data...' : 'Begin Analysis →'}
        </button>
      </div>

    </div>
  );
}
