export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  sizeFormatted: string;
  uploadedAt: Date;
  lastRefreshed: Date;
  version: number;
  metadata: {
    title?: string;
    author?: string;
    pageCount?: number;
    format?: string;
  };
  accessRoles: string[];
  indexName: string;
  status: 'processing' | 'ready' | 'error';
  chunks: number;
  error?: string;
}

export interface UploadDocumentRequest {
  file: File;
  settings?: {
    chunkSize?: number;
    chunkOverlap?: number;
  };
}

export interface UploadDocumentResponse {
  document: Document;
  message: string;
}

export interface ListDocumentsResponse {
  documents: Document[];
  total: number;
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'md', 'markdown', 'csv', 'docx'];

export const FILE_TYPE_MAP: Record<string, string> = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'text/csv': 'csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export function validateFile(file: File): { valid: boolean; error?: string } {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: 50MB`,
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
