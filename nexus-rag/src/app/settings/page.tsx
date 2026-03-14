'use client';

import { useState, useEffect } from 'react';
import { Save, Check, Key, Brain, Sliders, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/components/providers';

const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

const TABS = [
  { id: 'api', label: 'API' },
  { id: 'generation', label: 'Generation' },
  { id: 'search', label: 'Search' },
  { id: 'appearance', label: 'Appearance' },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    openrouterApiKey: '',
    selectedModel: DEFAULT_MODEL,
    temperature: 0.7,
    chunkSize: 512,
    chunkOverlap: 50,
    topK: 5,
    rerankTopK: 3,
    hybridSearchAlpha: 0.5,
    enableReranking: true,
    enableMemory: true,
    maxContextMessages: 10,
  });
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('api');

  useEffect(() => {
    const stored = localStorage.getItem('nexus-rag-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state) {
          setFormData(prev => ({
            ...prev,
            openrouterApiKey: parsed.state.openrouterApiKey || '',
            selectedModel: parsed.state.selectedModel || DEFAULT_MODEL,
            temperature: parsed.state.temperature ?? 0.7,
            chunkSize: parsed.state.chunkSize ?? 512,
            chunkOverlap: parsed.state.chunkOverlap ?? 50,
            topK: parsed.state.topK ?? 5,
            rerankTopK: parsed.state.rerankTopK ?? 3,
            hybridSearchAlpha: parsed.state.hybridSearchAlpha ?? 0.5,
            enableReranking: parsed.state.enableReranking ?? true,
            enableMemory: parsed.state.enableMemory ?? true,
            maxContextMessages: parsed.state.maxContextMessages ?? 10,
          }));
          if (parsed.state.theme) setTheme(parsed.state.theme);
        }
      } catch { /* ignore */ }
    }
  }, [setTheme]);

  const handleSave = () => {
    localStorage.setItem('nexus-rag-settings', JSON.stringify({ state: { ...formData, theme } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--md-sys-color-background)]">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 h-14 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--md-sys-color-surface-variant)] flex items-center justify-center">
          <Sliders size={16} className="text-[var(--md-sys-color-on-surface-variant)]" />
        </div>
        <h1 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-6">
          {/* Tabs */}
          <div className="flex gap-1 p-1 mb-6 bg-[var(--md-sys-color-surface-variant)] rounded-lg w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-sm'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-5 animate-enter">
            {activeTab === 'api' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={formData.openrouterApiKey}
                      onChange={(e) => setFormData({ ...formData, openrouterApiKey: e.target.value })}
                      placeholder="sk-or-..."
                      className="w-full bg-[var(--md-sys-color-surface-variant)] border-none rounded-lg px-3 py-2.5 text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2">
                    Model ID
                  </label>
                  <input
                    type="text"
                    value={formData.selectedModel}
                    onChange={(e) => setFormData({ ...formData, selectedModel: e.target.value })}
                    placeholder="anthropic/claude-3.5-sonnet"
                    className="w-full bg-[var(--md-sys-color-surface-variant)] border-none rounded-lg px-3 py-2.5 text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/30 transition-all"
                  />
                </div>
              </>
            )}

            {activeTab === 'generation' && (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Temperature</label>
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{formData.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-[var(--md-sys-color-primary)]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-[var(--md-sys-color-on-surface)]">Memory</p>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Remember conversation</p>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, enableMemory: !formData.enableMemory })}
                    className={`w-11 h-6 rounded-full transition-colors ${
                      formData.enableMemory ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-surface-variant)]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      formData.enableMemory ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {formData.enableMemory && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Context Messages</label>
                      <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{formData.maxContextMessages}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={formData.maxContextMessages}
                      onChange={(e) => setFormData({ ...formData, maxContextMessages: parseInt(e.target.value) })}
                      className="w-full accent-[var(--md-sys-color-primary)]"
                    />
                  </div>
                )}
              </>
            )}

            {activeTab === 'search' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2">Chunk Size</label>
                    <input
                      type="number"
                      value={formData.chunkSize}
                      onChange={(e) => setFormData({ ...formData, chunkSize: parseInt(e.target.value) })}
                      className="w-full bg-[var(--md-sys-color-surface-variant)] border-none rounded-lg px-3 py-2.5 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2">Overlap</label>
                    <input
                      type="number"
                      value={formData.chunkOverlap}
                      onChange={(e) => setFormData({ ...formData, chunkOverlap: parseInt(e.target.value) })}
                      className="w-full bg-[var(--md-sys-color-surface-variant)] border-none rounded-lg px-3 py-2.5 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2">Top K</label>
                    <input
                      type="number"
                      value={formData.topK}
                      onChange={(e) => setFormData({ ...formData, topK: parseInt(e.target.value) })}
                      className="w-full bg-[var(--md-sys-color-surface-variant)] border-none rounded-lg px-3 py-2.5 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2">Rerank K</label>
                    <input
                      type="number"
                      value={formData.rerankTopK}
                      onChange={(e) => setFormData({ ...formData, rerankTopK: parseInt(e.target.value) })}
                      className="w-full bg-[var(--md-sys-color-surface-variant)] border-none rounded-lg px-3 py-2.5 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/30"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Search Alpha</label>
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{formData.hybridSearchAlpha}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.hybridSearchAlpha}
                    onChange={(e) => setFormData({ ...formData, hybridSearchAlpha: parseFloat(e.target.value) })}
                    className="w-full accent-[var(--md-sys-color-primary)]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-[var(--md-sys-color-on-surface)]">Reranking</p>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, enableReranking: !formData.enableReranking })}
                    className={`w-11 h-6 rounded-full transition-colors ${
                      formData.enableReranking ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-surface-variant)]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      formData.enableReranking ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </>
            )}

            {activeTab === 'appearance' && (
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[var(--md-sys-color-on-surface)]">Theme</p>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Choose appearance</p>
                </div>
                <div className="flex gap-1 p-1 bg-[var(--md-sys-color-surface-variant)] rounded-lg">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        theme === t
                          ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-sm'
                          : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
