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

    // Extension to language resolution
    let detectedLang = null;
    if (lowerName.endsWith('.py') || lowerName.endsWith('.pyw')) {
      detectedLang = 'python';
    } else if (lowerName.endsWith('.js') || lowerName.endsWith('.jsx') || lowerName.endsWith('.mjs') || lowerName.endsWith('.cjs')) {
      detectedLang = 'javascript';
    } else if (lowerName.endsWith('.ts') || lowerName.endsWith('.tsx') || lowerName.endsWith('.mts') || lowerName.endsWith('.cts')) {
      detectedLang = 'typescript';
    } else if (lowerName.endsWith('.java')) {
      detectedLang = 'java';
    } else if (lowerName.endsWith('.cpp') || lowerName.endsWith('.cc') || lowerName.endsWith('.cxx') || lowerName.endsWith('.hpp') || lowerName.endsWith('.hh') || lowerName.endsWith('.hxx')) {
      detectedLang = 'cpp';
    } else if (lowerName.endsWith('.c') || lowerName.endsWith('.h')) {
      detectedLang = 'c';
    } else if (lowerName.endsWith('.go')) {
      detectedLang = 'go';
    }

    // Extension validation
    if (!detectedLang) {
      const msg = `Unsupported file "${name}". CodeGuard supports Python, JavaScript, TypeScript, Java, C, C++, and Go files.`;
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
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {currentFilename ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            backgroundColor: '#EDE8F8',
            border: '1px solid #D8CFEA',
            borderRadius: '9999px',
            fontSize: '0.825rem',
            fontFamily: 'var(--font-mono)',
            color: '#1A1626',
            width: 'fit-content',
          }}
        >
          <FileCode size={15} style={{ color: '#5E4F98' }} />
          <span style={{ fontWeight: 600 }}>{currentFilename}</span>
          <button
            type="button"
            onClick={onClearFile}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#88809E',
              display: 'flex',
              alignItems: 'center',
              padding: '0 2px',
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
            border: `1.5px dashed ${isDragging ? '#5E4F98' : '#D8CFEA'}`,
            backgroundColor: isDragging ? '#F4EFFC' : '#FFFFFF',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            boxShadow: '0 2px 8px rgba(35, 25, 60, 0.03)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#EDE8F8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5E4F98',
            }}
          >
            <UploadCloud size={18} />
          </div>
          <span style={{ fontSize: '0.875rem', color: '#58516B' }}>
            <strong style={{ color: '#1A1626' }}>Click to upload a source file</strong> or drag and drop (.py, .js, .ts, .java, .c, .cpp, .go &bull; max 100 KB)
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".py,.pyw,.js,.jsx,.ts,.tsx,.java,.c,.h,.cpp,.cc,.hpp,.go"
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
            padding: '0.65rem 1rem',
            backgroundColor: '#FFF5F5',
            border: '1px solid #FEB2B2',
            borderRadius: '10px',
            fontSize: '0.85rem',
            color: '#C53030',
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{localError}</span>
        </div>
      )}
    </div>
  );
}
