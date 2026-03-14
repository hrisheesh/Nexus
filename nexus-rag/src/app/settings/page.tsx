'use client';

import { useState, useEffect } from 'react';
import { Save, Check, Key, Brain, Sliders, Eye, EyeOff, Server } from 'lucide-react';
import { useTheme } from '@/components/providers';

type LLMProvider = 'openrouter' | 'nvidia';

const DEFAULT_MODEL = 'openrouter/auto';

const PROVIDERS: { id: LLMProvider; name: string; icon: React.ReactNode }[] = [
  { id: 'openrouter', name: 'OpenRouter', icon: <Brain size={16} /> },
  { id: 'nvidia', name: 'NVIDIA', icon: <Server size={16} /> },
];

const MODELS: Record<LLMProvider, { id: string; name: string }[]> = {
  openrouter: [
    { id: 'openrouter/auto', name: 'Auto (Best)' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
    { id: 'openai/gpt-4o', name: 'GPT-4o' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
    { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B' },
  ],
  nvidia: [
    { id: 'nvidia/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick' },
    { id: 'nvidia/llama-3-3-70b-instruct', name: 'Llama 3.3 70B' },
    { id: 'nvidia/nemotron-4-15b-instruct', name: 'Nemotron 4 15B' },
    { id: 'nvidia/flux-1-dev-fp8', name: 'Flux 1 Dev' },
  ],
};

const TABS = [
  { id: 'api', label: 'API' },
  { id: 'generation', label: 'Generation' },
  { id: 'search', label: 'Search' },
  { id: 'appearance', label: 'Appearance' },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [provider, setProvider] = useState<LLMProvider>('openrouter');
  const [formData, setFormData] = useState({
    openrouterApiKey: '',
    nvidiaApiKey: '',
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
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showNvidiaKey, setShowNvidiaKey] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('api');

  useEffect(() => {
    const stored = localStorage.getItem('nexus-rag-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state) {
          setProvider(parsed.state.provider || 'openrouter');
          setFormData(prev => ({
            ...prev,
            openrouterApiKey: parsed.state.openrouterApiKey || '',
            nvidiaApiKey: parsed.state.nvidiaApiKey || '',
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
    localStorage.setItem('nexus-rag-settings', JSON.stringify({ state: { ...formData, provider, theme } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    setFormData(prev => ({
      ...prev,
      selectedModel: MODELS[newProvider][0].id,
    }));
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
                    LLM Provider
                  </label>
                  <div className="flex gap-2">
                    {PROVIDERS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleProviderChange(p.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          provider === p.id
                            ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                            : 'bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                        }`}
                      >
                        {p.icon}
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {provider === 'openrouter' && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2">
                      OpenRouter API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showOpenRouterKey ? 'text' : 'password'}
                        value={formData.openrouterApiKey}
                        onChange={(e) => setFormData({ ...formData, openrouterApiKey: e.target.value })}
                        placeholder="sk-or-..."
                        className="w-full bg-[var(--md-sys-color-surface-variant)] border-none rounded-lg px-3 py-2.5 text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                      >
                        {showOpenRouterKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {provider === 'nvidia' && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2">
                      NVIDIA API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showNvidiaKey ? 'text' : 'password'}
                        value={formData.nvidiaApiKey}
                        onChange={(e) => setFormData({ ...formData, nvidiaApiKey: e.target.value })}
                        placeholder="nvapi-..."
                        className="w-full bg-[var(--md-sys-color-surface-variant)] border-none rounded-lg px-3 py-2.5 text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNvidiaKey(!showNvidiaKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                      >
                        {showNvidiaKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                      Get your API key from <a href="https://build.nvidia.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--md-sys-color-primary)] hover:underline">build.nvidia.com</a>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2">
                    Model
                  </label>
                  <select
                    value={formData.selectedModel}
                    onChange={(e) => setFormData({ ...formData, selectedModel: e.target.value })}
                    className="w-full bg-[var(--md-sys-color-surface-variant)] border-none rounded-lg px-3 py-2.5 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/30 transition-all"
                  >
                    {MODELS[provider].map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
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
