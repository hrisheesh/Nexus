'use client';

import { useState, useEffect } from 'react';
import { BarChart3, MessageSquare, FileText, Clock, Zap } from 'lucide-react';

interface AnalyticsData {
  totalQueries: number;
  totalTokens: number;
  avgLatency: number;
  documents: number;
  chunks: number;
  successRate: number;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const stats = data || {
    totalQueries: 0,
    totalTokens: 0,
    avgLatency: 0,
    documents: 0,
    chunks: 0,
    successRate: 0,
  };

  const hasData = stats.totalQueries > 0 || stats.documents > 0;

  const statCards = [
    { label: 'Queries', value: stats.totalQueries.toLocaleString(), icon: MessageSquare },
    { label: 'Tokens', value: (stats.totalTokens / 1000).toFixed(1) + 'K', icon: Zap },
    { label: 'Latency', value: stats.avgLatency + 's', icon: Clock },
    { label: 'Documents', value: stats.documents, icon: FileText },
  ];

  return (
    <div className="flex flex-col h-screen bg-[var(--md-sys-color-background)]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--md-sys-color-surface-variant)] flex items-center justify-center">
            <BarChart3 size={16} className="text-[var(--md-sys-color-on-surface-variant)]" />
          </div>
          <div>
            <h1 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">Analytics</h1>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Monitor your RAG application</p>
          </div>
        </div>
        <div className="flex gap-1 p-1 bg-[var(--md-sys-color-surface-variant)] rounded-lg">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === range
                  ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-sm'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-[var(--md-sys-color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !hasData ? (
            <div className="text-center py-20">
              <BarChart3 size={32} className="text-[var(--md-sys-color-on-surface-variant)] mx-auto mb-3 opacity-40" />
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">No analytics data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3">
                {statCards.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div 
                      key={stat.label}
                      className="p-4 border border-[var(--md-sys-color-outline-variant)] rounded-xl animate-enter"
                      style={{ animationDelay: `${idx * 0.03}s` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={14} className="text-[var(--md-sys-color-on-surface-variant)]" strokeWidth={1.5} />
                        <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase">{stat.label}</span>
                      </div>
                      <p className="text-xl font-medium text-[var(--md-sys-color-on-surface)]">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Knowledge Base */}
              <div className="p-4 border border-[var(--md-sys-color-outline-variant)] rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={14} className="text-[var(--md-sys-color-on-surface-variant)]" strokeWidth={1.5} />
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase">Knowledge Base</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-medium text-[var(--md-sys-color-on-surface)]">{stats.documents}</p>
                    <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">Documents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-medium text-[var(--md-sys-color-on-surface)]">{stats.chunks.toLocaleString()}</p>
                    <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">Chunks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-medium text-[var(--md-sys-color-on-surface)]">{stats.documents > 0 ? (stats.chunks / stats.documents).toFixed(0) : 0}</p>
                    <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">Avg/Doc</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-medium text-[var(--md-sys-color-on-surface)]">{stats.successRate}%</p>
                    <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">Success</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
