'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, FileText, Settings, BarChart3, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from './providers';

const navItems = [
  { href: '/', icon: MessageSquare, label: 'Chat' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <div 
        className="flex items-center gap-1 px-1.5 py-1.5 rounded-full"
        style={{ 
          background: 'rgba(30, 30, 30, 0.8)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 px-4 py-2 rounded-full hover:bg-white/5 transition-all duration-200"
        >
          <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-[var(--apple-accent)] to-[var(--apple-accent-secondary)] flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--apple-text-primary)' }}>
            NexusRAG
          </span>
        </Link>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Nav Items */}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? ''
                  : 'hover:bg-white/5'
              }`}
              style={{ 
                color: isActive ? 'white' : 'var(--apple-text-secondary)',
                background: isActive ? 'var(--apple-accent)' : 'transparent'
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-full hover:bg-white/5 transition-all duration-200"
          style={{ color: 'var(--apple-text-secondary)' }}
        >
          {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </nav>
  );
}
