'use client';

import { useState, useEffect } from 'react';
import { Save, Check, Brain, Eye, EyeOff, Server, Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from '@/components/providers';

type LLMProvider = 'openrouter' | 'nvidia';

const DEFAULT_MODEL = 'openrouter/auto';

const PROVIDERS: { id: LLMProvider; name: string; icon: React.ReactNode }[] = [
  { id: 'openrouter', name: 'OpenRouter', icon: <Brain size={20} /> },
  { id: 'nvidia', name: 'NVIDIA', icon: <Server size={20} /> },
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
  ],
  nvidia: [
    { id: 'nvidia/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick' },
    { id: 'nvidia/llama-3-3-70b-instruct', name: 'Llama 3.3 70B' },
    { id: 'nvidia/nemotron-4-15b-instruct', name: 'Nemotron 4 15B' },
  ],
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [provider, setProvider] = useState<LLMProvider>('openrouter');
  const [formData, setFormData] = useState({
    openrouterApiKey: '',
    nvidiaApiKey: '',
    selectedModel: DEFAULT_MODEL,
    temperature: 0.7,
    enableMemory: true,
  });
  const [saved, setSaved] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showNvidiaKey, setShowNvidiaKey] = useState(false);

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
            enableMemory: parsed.state.enableMemory ?? true,
          }));
          if (parsed.state.theme) setTheme(parsed.state.theme);
        }
      } catch { /* ignore */ }
    }
  }, [setTheme]);

  const handleSave = () => {
    localStorage.setItem('nexus-rag-settings', JSON.stringify({ state: { ...formData, provider, theme } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    setFormData(prev => ({
      ...prev,
      selectedModel: MODELS[newProvider][0].id,
    }));
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center px-6">
      {/* Page Header */}
      <div className="w-full max-w-[1000px] mb-10 animate-enter">
        <h1 className="text-[48px] font-semibold tracking-tight mb-3" style={{ color: 'var(--apple-text-primary)' }}>
          Settings
        </h1>
        <p className="text-[20px]" style={{ color: 'var(--apple-text-secondary)' }}>
          Configure your AI assistant
        </p>
      </div>

      <div className="w-full max-w-[1000px] grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* LLM Provider */}
          <div className="apple-card p-6">
            <h2 className="text-[17px] font-semibold mb-5" style={{ color: 'var(--apple-text-primary)' }}>
              AI Provider
            </h2>
            <div className="flex gap-3">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProviderChange(p.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-[14px] text-[15px] font-medium transition-all ${
                    provider === p.id
                      ? ''
                      : 'hover:bg-[var(--apple-bg-tertiary)]'
                  }`}
                  style={{ 
                    background: provider === p.id ? 'var(--apple-accent)' : 'var(--apple-bg-tertiary)',
                    color: provider === p.id ? 'white' : 'var(--apple-text-secondary)'
                  }}
                >
                  {p.icon}
                  {p.name}
                </button>
              ))}
            </div>

            {/* API Key Input */}
            <div className="mt-5">
              <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--apple-text-secondary)' }}>
                {provider === 'openrouter' ? 'OpenRouter API Key' : 'NVIDIA API Key'}
              </label>
              <div className="relative">
                <input
                  type={provider === 'openrouter' ? (showOpenRouterKey ? 'text' : 'password') : (showNvidiaKey ? 'text' : 'password')}
                  value={provider === 'openrouter' ? formData.openrouterApiKey : formData.nvidiaApiKey}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    [provider === 'openrouter' ? 'openrouterApiKey' : 'nvidiaApiKey']: e.target.value 
                  })}
                  placeholder={provider === 'openrouter' ? 'sk-or-...' : 'nvapi-...'}
                  className="apple-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => provider === 'openrouter' ? setShowOpenRouterKey(!showOpenRouterKey) : setShowNvidiaKey(!showNvidiaKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                >
                  {provider === 'openrouter' ? 
                    (showOpenRouterKey ? <EyeOff size={18} style={{ color: 'var(--apple-text-tertiary)' }} /> : <Eye size={18} style={{ color: 'var(--apple-text-tertiary)' }} />) :
                    (showNvidiaKey ? <EyeOff size={18} style={{ color: 'var(--apple-text-tertiary)' }} /> : <Eye size={18} style={{ color: 'var(--apple-text-tertiary)' }} />)
                  }
                </button>
              </div>
            </div>

            {/* Model Selection */}
            <div className="mt-5">
              <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--apple-text-secondary)' }}>
                Model
              </label>
              <select
                value={formData.selectedModel}
                onChange={(e) => setFormData({ ...formData, selectedModel: e.target.value })}
                className="apple-input"
              >
                {MODELS[provider].map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Theme */}
          <div className="apple-card p-6">
            <h2 className="text-[17px] font-semibold mb-5" style={{ color: 'var(--apple-text-primary)' }}>
              Appearance
            </h2>
            <div className="flex gap-3">
              {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
                { id: 'system', icon: Laptop, label: 'System' },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as 'light' | 'dark' | 'system')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-[14px] text-[15px] font-medium transition-all ${
                      theme === t.id
                        ? ''
                        : 'hover:bg-[var(--apple-bg-tertiary)]'
                    }`}
                    style={{ 
                      background: theme === t.id ? 'var(--apple-accent)' : 'var(--apple-bg-tertiary)',
                      color: theme === t.id ? 'white' : 'var(--apple-text-secondary)'
                    }}
                  >
                    <Icon size={18} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Chat Settings */}
          <div className="apple-card p-6">
            <h2 className="text-[17px] font-semibold mb-5" style={{ color: 'var(--apple-text-primary)' }}>
              Chat Settings
            </h2>
            
            {/* Temperature */}
            <div className="mb-6">
              <div className="flex justify-between mb-3">
                <label className="text-[13px] font-medium" style={{ color: 'var(--apple-text-secondary)' }}>Temperature</label>
                <span className="text-[13px]" style={{ color: 'var(--apple-text-tertiary)' }}>{formData.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full"
                style={{ accentColor: 'var(--apple-accent)' }}
              />
            </div>

            {/* Memory */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-[15px] font-medium" style={{ color: 'var(--apple-text-primary)' }}>Memory</p>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--apple-text-tertiary)' }}>Remember conversation</p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, enableMemory: !formData.enableMemory })}
                className="apple-button"
                style={{ 
                  background: formData.enableMemory ? 'var(--apple-accent)' : 'var(--apple-bg-tertiary)',
                  padding: '10px',
                  width: '50px',
                  borderRadius: '25px'
                }}
              >
                <div 
                  className="w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ 
                    transform: formData.enableMemory ? 'translateX(20px)' : 'translateX(0)',
                    marginLeft: formData.enableMemory ? '0' : '2px'
                  }} 
                />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full apple-button apple-button-primary"
          >
            {saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
