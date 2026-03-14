'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

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
        body: JSON.stringify({ message: userMessage.content }),
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
    <div className="flex flex-col h-screen bg-[var(--md-sys-color-background)]">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-14 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]">
        <Link 
          href="/" 
          className="lg:hidden p-2 -ml-2 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center">
          <Bot size={16} className="text-[var(--md-sys-color-on-primary-container)]" />
        </div>
        <div>
          <h1 className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">NexusRAG</h1>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">AI Assistant</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--md-sys-color-primary-container)] flex items-center justify-center mb-4">
                <Bot size={28} className="text-[var(--md-sys-color-on-primary-container)]" />
              </div>
              <h2 className="text-lg font-normal text-[var(--md-sys-color-on-surface)] mb-1">
                How can I help you today?
              </h2>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                Upload documents and ask me anything about them.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-enter ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-[var(--md-sys-color-primary)]' 
                    : 'bg-[var(--md-sys-color-primary-container)]'
                }`}>
                  {message.role === 'user' 
                    ? <User size={14} className="text-[var(--md-sys-color-on-primary)]" />
                    : <Bot size={14} className="text-[var(--md-sys-color-on-primary-container)]" />
                  }
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block text-sm leading-relaxed text-left ${
                    message.role === 'user'
                      ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] px-4 py-2.5 rounded-2xl rounded-br-md'
                      : 'text-[var(--md-sys-color-on-surface)]'
                  }`}>
                    {message.isLoading ? (
                      <div className="flex gap-1 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-on-surface-variant)] loading-dot" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-on-surface-variant)] loading-dot" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-on-surface-variant)] loading-dot" />
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>

                  {/* Sources */}
                  {!message.isLoading && message.sources && message.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.sources.map((source, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--md-sys-color-surface-variant)] text-xs text-[var(--md-sys-color-on-surface-variant)]"
                        >
                          <span className="w-1 h-1 rounded-full bg-[var(--md-sys-color-primary)]" />
                          {source.documentName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 bg-[var(--md-sys-color-surface)]">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative"
        >
          <div className="flex items-end gap-2 bg-[var(--md-sys-color-surface-variant)] rounded-[28px] px-2 py-1.5 focus-within:ring-2 focus-within:ring-[var(--md-sys-color-primary)]/30 transition-shadow">
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
              placeholder="Message..."
              className="flex-1 bg-transparent resize-none min-h-[24px] max-h-[120px] py-2 px-3 text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] outline-none"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex-shrink-0"
            >
              <Send size={16} strokeWidth={2} />
            </button>
          </div>
          <p className="text-center text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </div>
  );
}
