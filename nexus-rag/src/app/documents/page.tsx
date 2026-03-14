'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, Check, AlertCircle, X } from 'lucide-react';

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
    <div className="flex flex-col h-screen bg-[var(--md-sys-color-background)]">
      <header className="flex items-center gap-3 px-6 h-14 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--md-sys-color-surface-variant)] flex items-center justify-center">
          <FileText size={16} className="text-[var(--md-sys-color-on-surface-variant)]" />
        </div>
        <div>
          <h1 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">Documents</h1>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{documents.length} files</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              isDragging 
                ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/10' 
                : 'border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-outline)]'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.txt,.md,.csv,.docx"
            />
            
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Upload size={16} />
              <span>Select Files</span>
            </label>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-3">
              PDF, Markdown, TXT, CSV, DOCX (max 50MB)
            </p>
          </div>

          {uploadQueue.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadQueue.map((upload, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-[var(--md-sys-color-surface-variant)] rounded-lg">
                  <FileText size={16} className="text-[var(--md-sys-color-on-surface-variant)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--md-sys-color-on-surface)] truncate">{upload.fileName}</p>
                    <div className="h-1 mt-1 bg-[var(--md-sys-color-outline-variant)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          upload.status === 'error' ? 'bg-red-500' : upload.status === 'complete' ? 'bg-green-500' : 'bg-[var(--md-sys-color-primary)]'
                        }`}
                        style={{ width: upload.status === 'complete' ? '100%' : `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                  {upload.status === 'processing' && <Check size={14} className="animate-spin text-[var(--md-sys-color-primary)]" />}
                  {upload.status === 'complete' && <Check size={14} className="text-green-500" />}
                  {upload.status === 'error' && <AlertCircle size={14} className="text-red-500" />}
                  <button onClick={() => removeFromQueue(idx)} className="p-1">
                    <X size={14} className="text-[var(--md-sys-color-on-surface-variant)]" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {documents.length > 0 ? (
            <div className="mt-4 border border-[var(--md-sys-color-outline-variant)] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] w-20">Size</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] w-24">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] w-20">Chunks</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] w-24">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-[var(--md-sys-color-outline-variant)] last:border-0 hover:bg-[var(--md-sys-color-surface)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-[var(--md-sys-color-on-surface-variant)]" />
                          <span className="text-sm text-[var(--md-sys-color-on-surface)] truncate max-w-[250px]">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--md-sys-color-on-surface-variant)]">{doc.sizeFormatted}</td>
                      <td className="px-4 py-3 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--md-sys-color-on-surface-variant)]">{doc.chunks}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          doc.status === 'ready' ? 'text-green-700 bg-green-50 dark:bg-green-900/20' :
                          doc.status === 'processing' ? 'text-amber-700 bg-amber-50 dark:bg-amber-900/20' :
                          'text-red-700 bg-red-50 dark:bg-red-900/20'
                        }`}>
                          {doc.status === 'ready' && <Check size={10} />}
                          {doc.status === 'processing' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                          {doc.status === 'error' && <AlertCircle size={10} />}
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded text-[var(--md-sys-color-on-surface-variant)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : uploadQueue.length === 0 ? (
            <div className="mt-8 text-center py-12">
              <FileText size={32} className="text-[var(--md-sys-color-on-surface-variant)] mx-auto mb-3 opacity-40" />
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">No documents yet</p>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">Upload files to get started</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
