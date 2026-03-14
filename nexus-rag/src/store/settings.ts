'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '@/types';

const defaultSettings: Settings = {
  openrouterApiKey: '',
  selectedModel: 'anthropic/claude-3.5-sonnet',
  temperature: 0.7,
  chunkSize: 512,
  chunkOverlap: 50,
  topK: 5,
  rerankTopK: 3,
  hybridSearchAlpha: 0.5,
  enableReranking: true,
  enableMemory: true,
  maxContextMessages: 10,
  theme: 'system',
};

interface AppState extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({ ...state, ...newSettings })),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'nexus-rag-settings',
    }
  )
);
