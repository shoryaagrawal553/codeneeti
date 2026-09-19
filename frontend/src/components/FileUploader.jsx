import React, { useRef, useState } from 'react';
import { UploadCloud, FileCode, AlertCircle, X } from 'lucide-react';
import { MAX_CODE_BYTES } from '../types';

export default function FileUploader({ onFileLoaded, onError, currentFilename, onClearFile }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState(null);

  const processFile = (file) => {
    if (!file) return;

    setLocalError(null);

    const name = file.name;
    const lowerName = name.toLowerCase();
    const isPy = lowerName.endsWith('.py');
    const isJs = lowerName.endsWith('.js');

    // Extension validation
    if (!isPy && !isJs) {
      const msg = `Unsupported file "${name}". CodeGuard strictly supports .py and .js files.`;
      setLocalError(msg);
      if (onError) onError(msg);
      return;
    }

    // Size validation (100 KB = 102,400 bytes)
    if (file.size > MAX_CODE_BYTES) {
      const sizeKb = (file.size / 1024).toFixed(1);
      const msg = `File is too large (${sizeKb} KB). Maximum allowed size is 100 KB (102,400 bytes).`;
      setLocalError(msg);
      if (onError) onError(msg);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const detectedLang = isPy ? 'python' : 'javascript';
      onFileLoaded({
        code: content,
        filename: name,
        language: detectedLang,
      });
      setLocalError(null);
    };

    reader.onerror = () => {
      const msg = `Failed to read "${name}". Please try again or paste the code directly.`;
      setLocalError(msg);
      if (onError) onError(msg);
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // Reset value so re-selecting same file triggers change
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {currentFilename ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            backgroundColor: 'var(--primary-surface)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.825rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
          }}
        >
          <FileCode size={14} style={{ color: 'var(--primary)' }} />
          <span>{currentFilename}</span>
          <button
            type="button"
            onClick={onClearFile}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
            title="Detach file"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `1px dashed ${isDragging ? 'var(--primary)' : 'var(--border-medium)'}`,
            backgroundColor: isDragging ? 'var(--primary-surface)' : 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          className="card-interactive"
        >
          <UploadCloud size={18} style={{ color: isDragging ? 'var(--primary)' : 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Click to upload</strong> or drag &amp; drop (.py or .js, max 100 KB)
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".py,.js"
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />
        </div>
      )}

      {localError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--severity-critical-bg)',
            border: '1px solid var(--severity-critical-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--severity-critical)',
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{localError}</span>
        </div>
      )}
    </div>
  );
}
