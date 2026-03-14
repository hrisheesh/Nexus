'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, FileText, Settings, BarChart3, Moon, Sun } from 'lucide-react';
import { useTheme } from './providers';

const navItems = [
  { href: '/', icon: MessageSquare, label: 'Chat' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <aside className="w-16 h-screen flex flex-col items-center py-3 border-r border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-primary-container)] flex items-center justify-center mb-4">
        <BotIcon className="text-[var(--md-sys-color-on-primary-container)]" />
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              onMouseEnter={() => setHovered(item.href)}
              onMouseLeave={() => setHovered(null)}
              title={item.label}
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              {hovered === item.href && !isActive && (
                <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-[var(--md-sys-color-inverse-surface)] text-[var(--md-sys-color-inverse-on-surface)] text-xs whitespace-nowrap animate-enter">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-all duration-200"
        title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {resolvedTheme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
      </button>
    </aside>
  );
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 8V4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M2 14h2M20 14h2M15 13v2M9 13v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
