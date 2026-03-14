'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Trash2, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: 'ready' | 'processing' | 'error';
  chunks: number;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    handleUpload(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleUpload(files);
    }
  }, []);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);

    const newDocs: Document[] = files.map((file, i) => ({
      id: Date.now().toString() + i,
      name: file.name,
      type: file.name.split('.').pop()?.toLowerCase() || 'txt',
      size: file.size < 1024 * 1024 
        ? (file.size / 1024).toFixed(1) + ' KB'
        : (file.size / 1024 / 1024).toFixed(2) + ' MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'processing' as const,
      chunks: 0,
    }));

    setDocuments(prev => [...prev, ...newDocs]);

    setTimeout(() => {
      setDocuments(prev => prev.map(doc => 
        doc.status === 'processing' 
          ? { ...doc, status: 'ready', chunks: Math.floor(Math.random() * 50) + 10 }
          : doc
      ));
      setIsUploading(false);
    }, 1500);
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleRefresh = (id: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === id ? { ...doc, status: 'processing' } : doc
    ));
    
    setTimeout(() => {
      setDocuments(prev => prev.map(doc =>
        doc.id === id ? { ...doc, status: 'ready', chunks: Math.floor(Math.random() * 50) + 10 } : doc
      ));
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--md-sys-color-background)]">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 h-14 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--md-sys-color-surface-variant)] flex items-center justify-center">
          <FileText size={16} className="text-[var(--md-sys-color-on-surface-variant)]" />
        </div>
        <div>
          <h1 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">Documents</h1>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Upload and manage your knowledge base</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* Drop Zone */}
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
              accept=".pdf,.txt,.md,.docx,.csv"
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={24} className="text-[var(--md-sys-color-primary)] animate-spin" />
                <p className="text-sm text-[var(--md-sys-color-on-surface)]">Processing...</p>
              </div>
            ) : (
              <>
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Upload size={16} />
                  <span>Select Files</span>
                </label>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-3">
                  PDF, Markdown, TXT, DOCX, CSV
                </p>
              </>
            )}
          </div>

          {/* Documents List */}
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
                    <tr key={doc.id} className="border-b border-[var(--md-sys-color-outline-variant)] last:border-0 hover:bg-[var(--md-sys-color-surface)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-[var(--md-sys-color-on-surface-variant)]" />
                          <span className="text-sm text-[var(--md-sys-color-on-surface)] truncate max-w-[250px]">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--md-sys-color-on-surface-variant)]">{doc.size}</td>
                      <td className="px-4 py-3 text-sm text-[var(--md-sys-color-on-surface-variant)]">{doc.uploadedAt}</td>
                      <td className="px-4 py-3 text-sm text-[var(--md-sys-color-on-surface-variant)]">{doc.chunks}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          doc.status === 'ready'
                            ? 'text-green-700 bg-green-50 dark:bg-green-900/20'
                            : doc.status === 'processing'
                            ? 'text-amber-700 bg-amber-50 dark:bg-amber-900/20'
                            : 'text-red-700 bg-red-50 dark:bg-red-900/20'
                        }`}>
                          {doc.status === 'ready' && <Check size={10} />}
                          {doc.status === 'processing' && <RefreshCw size={10} className="animate-spin" />}
                          {doc.status === 'error' && <AlertCircle size={10} />}
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleRefresh(doc.id)}
                            className="p-1.5 rounded text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 rounded text-[var(--md-sys-color-on-surface-variant)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-8 text-center py-12">
              <FileText size={32} className="text-[var(--md-sys-color-on-surface-variant)] mx-auto mb-3 opacity-40" />
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">No documents yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
