'use client';

import { useState, useEffect } from 'react';
import { BarChart3, MessageSquare, FileText, Clock, Zap, TrendingUp, Activity } from 'lucide-react';

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
    { label: 'Total Queries', value: stats.totalQueries.toLocaleString(), icon: MessageSquare, color: 'var(--apple-accent)', bg: 'rgba(41, 151, 255, 0.1)' },
    { label: 'Tokens Used', value: (stats.totalTokens / 1000).toFixed(1) + 'K', icon: Zap, color: 'var(--apple-accent-secondary)', bg: 'rgba(191, 90, 242, 0.1)' },
    { label: 'Avg Latency', value: stats.avgLatency + 's', icon: Clock, color: 'var(--apple-success)', bg: 'rgba(48, 209, 88, 0.1)' },
    { label: 'Documents', value: stats.documents, icon: FileText, color: 'var(--apple-warning)', bg: 'rgba(255, 214, 10, 0.1)' },
  ];

  const timeRanges = ['24h', '7d', '30d', '90d'];

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center px-6">
      {/* Page Header */}
      <div className="w-full max-w-[1200px] flex items-center justify-between mb-10 animate-enter">
        <div>
          <h1 className="text-[48px] font-semibold tracking-tight mb-3" style={{ color: 'var(--apple-text-primary)' }}>
            Analytics
          </h1>
          <p className="text-[20px]" style={{ color: 'var(--apple-text-secondary)' }}>
            Monitor your RAG application performance
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-1 p-1.5 rounded-full" style={{ background: 'var(--apple-bg-secondary)' }}>
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2.5 rounded-full text-[14px] font-medium transition-all ${
                timeRange === range
                  ? ''
                  : 'hover:bg-white/5'
              }`}
              style={{ 
                background: timeRange === range ? 'var(--apple-bg-primary)' : 'transparent',
                color: timeRange === range ? 'var(--apple-text-primary)' : 'var(--apple-text-secondary)',
                boxShadow: timeRange === range ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div 
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--apple-accent)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : !hasData ? (
        <div className="text-center py-32 animate-enter">
          <div 
            className="w-28 h-28 rounded-[32px] bg-[var(--apple-bg-secondary)] flex items-center justify-center mx-auto mb-6"
          >
            <Activity size={48} style={{ color: 'var(--apple-text-tertiary)' }} />
          </div>
          <p className="text-[21px] font-medium mb-2" style={{ color: 'var(--apple-text-secondary)' }}>No analytics data yet</p>
          <p className="text-[15px]" style={{ color: 'var(--apple-text-tertiary)' }}>Start chatting and uploading documents to see insights</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-5 mb-10">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.label}
                  className="apple-card p-7"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div 
                    className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-5"
                    style={{ background: stat.bg }}
                  >
                    <Icon size={24} style={{ color: stat.color }} />
                  </div>
                  <p className="text-[13px] font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--apple-text-tertiary)' }}>
                    {stat.label}
                  </p>
                  <p className="text-[36px] font-semibold tracking-tight" style={{ color: 'var(--apple-text-primary)' }}>
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Knowledge Base Card */}
          <div className="apple-card p-8">
            <div className="flex items-center gap-3 mb-8">
              <div 
                className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                style={{ background: 'rgba(41, 151, 255, 0.1)' }}
              >
                <BarChart3 size={20} style={{ color: 'var(--apple-accent)' }} />
              </div>
              <h2 className="text-[20px] font-semibold" style={{ color: 'var(--apple-text-primary)' }}>
                Knowledge Base
              </h2>
            </div>
            
            <div className="grid grid-cols-4 gap-8">
              <div className="text-center py-4">
                <p className="text-[42px] font-semibold" style={{ color: 'var(--apple-text-primary)' }}>{stats.documents}</p>
                <p className="text-[14px] mt-2" style={{ color: 'var(--apple-text-tertiary)' }}>Documents</p>
              </div>
              <div className="text-center py-4">
                <p className="text-[42px] font-semibold" style={{ color: 'var(--apple-text-primary)' }}>{stats.chunks.toLocaleString()}</p>
                <p className="text-[14px] mt-2" style={{ color: 'var(--apple-text-tertiary)' }}>Total Chunks</p>
              </div>
              <div className="text-center py-4">
                <p className="text-[42px] font-semibold" style={{ color: 'var(--apple-text-primary)' }}>
                  {stats.documents > 0 ? (stats.chunks / stats.documents).toFixed(0) : 0}
                </p>
                <p className="text-[14px] mt-2" style={{ color: 'var(--apple-text-tertiary)' }}>Avg Chunks/Doc</p>
              </div>
              <div className="text-center py-4">
                <p className="text-[42px] font-semibold" style={{ color: 'var(--apple-success)' }}>{stats.successRate}%</p>
                <p className="text-[14px] mt-2" style={{ color: 'var(--apple-text-tertiary)' }}>Success Rate</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
