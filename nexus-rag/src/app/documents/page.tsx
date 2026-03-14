'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, Check, AlertCircle, X, File, Plus } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  sizeFormatted: string;
  uploadedAt: string;
  status: 'ready' | 'processing' | 'error';
  chunks: number;
  error?: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
}

const STORAGE_KEY = 'nexus-documents';
const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'md', 'csv', 'docx'];

function loadDocuments(): Document[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDocuments(docs: Document[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const queueRef = useRef<UploadProgress[]>([]);

  useEffect(() => {
    setDocuments(loadDocuments());
  }, []);

  useEffect(() => {
    queueRef.current = uploadQueue;
  }, [uploadQueue]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      uploadFiles(files);
    }
  }, []);

  const uploadFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ext && ALLOWED_EXTENSIONS.includes(ext);
    });

    if (validFiles.length === 0) return;

    const startIndex = queueRef.current.length;
    
    const newUploads: UploadProgress[] = validFiles.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadQueue(prev => [...prev, ...newUploads]);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const queueIndex = startIndex + i;

      try {
        console.log('📄 [UPLOAD] Starting upload:', file.name);
        console.log('📄 [UPLOAD] File size:', file.size, 'bytes');

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();

        console.log('✅ [UPLOAD] Upload complete!');
        console.log('📊 [UPLOAD] Document:', data.document);
        console.log('📊 [UPLOAD] Message:', data.message);

        setUploadQueue(prev => 
          prev.map((item, idx) => 
            idx === queueIndex ? { ...item, status: 'complete', progress: 100 } : item
          )
        );

        setDocuments(prev => {
          const updated = [data.document, ...prev];
          saveDocuments(updated);
          return updated;
        });

      } catch (error) {
        console.error('❌ [UPLOAD] Error:', error);
        setUploadQueue(prev => 
          prev.map((item, idx) => 
            idx === queueIndex ? { ...item, status: 'error', progress: 0 } : item
          )
        );
      }
    }

    setTimeout(() => {
      setUploadQueue(prev => prev.slice(validFiles.length));
    }, 3000);
  };

  const handleDelete = (id: string) => {
    const updated = documents.filter(doc => doc.id !== id);
    setDocuments(updated);
    saveDocuments(updated);
  };

  const removeFromQueue = (index: number) => {
    setUploadQueue(prev => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center px-6">
      {/* Page Header */}
      <div className="w-full max-w-[1200px] mb-10 animate-enter">
        <h1 className="text-[48px] font-semibold tracking-tight mb-3" style={{ color: 'var(--apple-text-primary)' }}>
          Documents
        </h1>
        <p className="text-[20px]" style={{ color: 'var(--apple-text-secondary)' }}>
          Upload and manage your knowledge base
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-[1200px] apple-card p-14 text-center transition-all duration-300 ${
          isDragging 
            ? 'scale-[1.02] border-[var(--apple-accent)]' 
            : 'hover:border-[var(--apple-text-tertiary)]'
        }`}
        style={{ borderColor: isDragging ? 'var(--apple-accent)' : 'var(--apple-border-light)' }}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.txt,.md,.csv,.docx"
        />
        
        <div className="flex flex-col items-center">
          <div 
            className="w-20 h-20 rounded-[24px] bg-[var(--apple-bg-tertiary)] flex items-center justify-center mb-6"
          >
            <Upload size={32} style={{ color: 'var(--apple-accent)' }} />
          </div>
          <label
            htmlFor="file-upload"
            className="apple-button apple-button-primary"
          >
            <Plus size={18} />
            <span>Upload Files</span>
          </label>
          <p className="text-[15px] mt-5" style={{ color: 'var(--apple-text-tertiary)' }}>
            PDF, Markdown, TXT, CSV, DOCX (max 50MB)
          </p>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="mt-6 space-y-3">
          {uploadQueue.map((upload, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-4 p-4 apple-card"
            >
              <div 
                className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                style={{ 
                  background: upload.status === 'error' ? 'rgba(255, 69, 58, 0.1)' : 
                             upload.status === 'complete' ? 'rgba(48, 209, 88, 0.1)' : 
                             'rgba(41, 151, 255, 0.1)' 
                }}
              >
                {upload.status === 'complete' ? (
                  <Check size={20} style={{ color: 'var(--apple-success)' }} />
                ) : upload.status === 'error' ? (
                  <AlertCircle size={20} style={{ color: 'var(--apple-error)' }} />
                ) : (
                  <File size={20} style={{ color: 'var(--apple-accent)' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium truncate" style={{ color: 'var(--apple-text-primary)' }}>{upload.fileName}</p>
                <div className="h-1.5 mt-3 rounded-full overflow-hidden" style={{ background: 'var(--apple-bg-tertiary)' }}>
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: upload.status === 'complete' ? '100%' : `${upload.progress}%`,
                      background: upload.status === 'error' ? 'var(--apple-error)' : 
                                 upload.status === 'complete' ? 'var(--apple-success)' : 
                                 'var(--apple-accent)'
                    }}
                  />
                </div>
              </div>
              <button 
                onClick={() => removeFromQueue(idx)} 
                className="p-2 rounded-[10px] hover:bg-[var(--apple-bg-tertiary)] transition-colors"
              >
                <X size={18} style={{ color: 'var(--apple-text-tertiary)' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Documents Grid */}
      {documents.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-[21px] font-semibold mb-6" style={{ color: 'var(--apple-text-primary)' }}>
            Your Documents ({documents.length})
          </h2>
          
          <div className="grid grid-cols-3 gap-5">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="apple-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                    style={{ background: 'rgba(41, 151, 255, 0.1)' }}
                  >
                    <FileText size={22} style={{ color: 'var(--apple-accent)' }} />
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(doc.id)} 
                    className="p-2 rounded-[10px] hover:bg-[var(--apple-error)/10] transition-colors"
                    style={{ color: 'var(--apple-text-tertiary)' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 className="text-[17px] font-medium truncate mb-2" style={{ color: 'var(--apple-text-primary)' }}>
                  {doc.name}
                </h3>
                
                <div className="flex items-center gap-3 mb-3">
                  <span 
                    className={`apple-badge ${
                      doc.status === 'ready' ? 'apple-badge-green' :
                      doc.status === 'processing' ? 'apple-badge-yellow' :
                      'apple-badge-red'
                    }`}
                  >
                    {doc.status === 'ready' && <Check size={10} />}
                    {doc.status === 'processing' && <span className="w-2 h-2 rounded-full bg-[var(--apple-warning)] animate-pulse" />}
                    {doc.status === 'error' && <AlertCircle size={10} />}
                    {doc.status}
                  </span>
                  <span className="text-[13px]" style={{ color: 'var(--apple-text-tertiary)' }}>
                    {doc.chunks} chunks
                  </span>
                </div>
                
                <p className="text-[13px]" style={{ color: 'var(--apple-text-tertiary)' }}>
                  {doc.sizeFormatted} • {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : uploadQueue.length === 0 ? (
        <div className="mt-20 text-center py-16 animate-enter">
          <div 
            className="w-24 h-24 rounded-[28px] bg-[var(--apple-bg-secondary)] flex items-center justify-center mx-auto mb-6"
          >
            <FileText size={36} style={{ color: 'var(--apple-text-tertiary)' }} />
          </div>
          <p className="text-[21px] font-medium mb-2" style={{ color: 'var(--apple-text-secondary)' }}>No documents yet</p>
          <p className="text-[15px]" style={{ color: 'var(--apple-text-tertiary)' }}>Upload files to build your knowledge base</p>
        </div>
      ) : null}
    </div>
  );
}
