'use client';
import React, { useRef } from 'react';

interface DropzoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function Dropzone({ onFileSelect, selectedFile }: DropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="field" style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>Upload Memory Dump <span className="req" style={{ color: 'var(--red)' }}>*</span></label>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        style={{ display: 'none' }} 
        accept=".raw,.vmem,.mem"
      />

      {!selectedFile ? (
        <div 
          className="upload-zone" 
          onClick={() => fileInputRef.current?.click()}
          style={{ border: '1.5px dashed var(--border)', borderRadius: 10, padding: '36px 20px', textAlign: 'center', background: 'var(--bg-surface)', marginTop: 6, cursor: 'pointer', transition: 'border-color .15s' }}
        >
          <div className="upload-icon" style={{ width: 36, height: 36, margin: '0 auto 14px', border: '1.5px solid var(--text-tertiary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}><path d="M8 11V3M8 3L5 6M8 3l3 3" stroke="#8B8B91" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.5 11v1.5A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V11" stroke="#8B8B91" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
          <div className="upload-title" style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Drop raw memory dump or click to browse</div>
          <div className="upload-hint" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Processed locally via Volatility 3 on AMD Hardware</div>
          <div className="upload-formats" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-tertiary)', marginTop: 10, letterSpacing: 0.5 }}>.RAW · .VMEM · .MEM · MAX 64GB</div>
        </div>
      ) : (
        <div className="file-chip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 7, padding: '10px 14px', marginTop: 10 }}>
          <div className="file-chip-left" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="file-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)' }}></div>
            <div>
              <div className="file-name" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-primary)' }}>{selectedFile.name}</div>
              <div className="file-size" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatSize(selectedFile.size)} — Ready for upload</div>
            </div>
          </div>
          <div className="file-remove" onClick={handleRemove} style={{ fontSize: 11, color: 'var(--text-tertiary)', cursor: 'pointer' }}>remove</div>
        </div>
      )}
    </div>
  );
}
