export interface Document {
  _id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md' | 'docx' | 'csv';
  size: number;
  uploadedAt: Date;
  lastRefreshed: Date;
  version: number;
  metadata: {
    title?: string;
    author?: string;
    date?: Date;
    custom: Record<string, unknown>;
  };
  accessRoles: string[];
  indexName: string;
  status: 'processing' | 'ready' | 'error';
}

export interface Chunk {
  _id: string;
  documentId: string;
  content: string;
  embedding: number[];
  metadata: {
    index: number;
    page?: number;
    section?: string;
    headings?: string[];
  };
  vectorId: string;
}

export interface ChatSession {
  _id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  context: string[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources: Source[];
  createdAt: Date;
  tokens: number;
  latency: number;
}

export interface Source {
  documentId: string;
  documentName: string;
  chunkId: string;
  content: string;
  score: number;
  page?: number;
}

export interface SearchResult {
  content: string;
  score: number;
  documentId: string;
  documentName: string;
  chunkId: string;
  metadata: Record<string, unknown>;
}

export interface Settings {
  openrouterApiKey: string;
  selectedModel: string;
  temperature: number;
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  rerankTopK: number;
  hybridSearchAlpha: number;
  enableReranking: boolean;
  enableMemory: boolean;
  maxContextMessages: number;
  theme: 'light' | 'dark' | 'system';
}

export interface AppState {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}
