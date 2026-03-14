'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, User, Paperclip, ArrowUp, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    documentName: string;
    content: string;
  }>;
  isLoading?: boolean;
}

interface Settings {
  provider?: 'openrouter' | 'nvidia';
  openrouterApiKey?: string;
  nvidiaApiKey?: string;
  selectedModel?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getSettings = (): Settings => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('nexus-rag-settings');
      if (stored) {
        return JSON.parse(stored).state || {};
      }
    } catch {}
    return {};
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const settings = getSettings();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          provider: settings.provider || 'openrouter',
          model: settings.selectedModel,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id
          ? { ...msg, content: data.response || 'Sorry, I could not generate a response.', sources: data.sources, isLoading: false }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg =>
        msg.id === loadingMessage.id
          ? { ...msg, content: 'Something went wrong. Please try again.', isLoading: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center">
      {/* Hero Section */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 animate-enter">
          <div 
            className="w-32 h-32 rounded-[36px] bg-gradient-to-br from-[var(--apple-accent)] to-[var(--apple-accent-secondary)] flex items-center justify-center mb-10 shadow-2xl"
            style={{ boxShadow: '0 30px 60px rgba(41, 151, 255, 0.3)' }}
          >
            <Sparkles size={52} className="text-white" />
          </div>
          <h1 className="text-[56px] font-semibold tracking-tight mb-4" style={{ color: 'var(--apple-text-primary)' }}>
            NexusRAG
          </h1>
          <p className="text-[22px] text-center max-w-[700px]" style={{ color: 'var(--apple-text-secondary)' }}>
            Your intelligent AI assistant powered by advanced retrieval. 
            Upload documents and ask anything.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="w-full max-w-[900px] px-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex gap-5 mb-8 animate-enter"
          >
            {/* Avatar */}
            <div 
              className={`flex-shrink-0 w-11 h-11 rounded-[14px] flex items-center justify-center mt-1 ${
                message.role === 'user' 
                  ? 'bg-[var(--apple-bg-tertiary)]' 
                  : 'bg-gradient-to-br from-[var(--apple-accent)] to-[var(--apple-accent-secondary)]'
              }`}
            >
              {message.role === 'user' 
                ? <User size={18} style={{ color: 'var(--apple-text-secondary)' }} />
                : <Bot size={18} className="text-white" />
              }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-2">
              <div className="text-[18px] leading-relaxed" style={{ color: 'var(--apple-text-primary)' }}>
                {message.isLoading ? (
                  <div className="flex gap-1.5 py-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--apple-text-tertiary)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--apple-text-tertiary)', animation: 'pulse 1.5s ease-in-out 0.15s infinite' }} />
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--apple-text-tertiary)', animation: 'pulse 1.5s ease-in-out 0.3s infinite' }} />
                  </div>
                ) : (
                  message.content
                )}
              </div>

              {/* Sources */}
              {!message.isLoading && message.sources && message.sources.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {message.sources.map((source, idx) => (
                    <span 
                      key={idx}
                      className="apple-badge apple-badge-blue"
                    >
                      {source.documentName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="w-full max-w-[900px] px-6 pb-10">
        <form 
          onSubmit={handleSubmit}
          className="relative"
        >
          <div 
            className="flex items-end gap-3 p-3 rounded-[28px] border"
            style={{ 
              background: 'var(--apple-bg-secondary)',
              borderColor: 'var(--apple-border-light)',
            }}
          >
            <button
              type="button"
              className="p-3.5 rounded-full transition-colors"
              style={{ color: 'var(--apple-text-tertiary)' }}
            >
              <Paperclip size={21} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent resize-none min-h-[24px] max-h-[150px] py-3.5 text-[18px]"
              style={{ 
                color: 'var(--apple-text-primary)',
                outline: 'none'
              }}
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 flex items-center justify-center rounded-full transition-all disabled:opacity-40"
              style={{ 
                background: 'var(--apple-accent)',
                color: 'white',
                opacity: input.trim() && !isLoading ? 1 : 0.4
              }}
            >
              <ArrowUp size={20} strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-center text-[12px] mt-5" style={{ color: 'var(--apple-text-tertiary)' }}>
            AI can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </div>
  );
}
