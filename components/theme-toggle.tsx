'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from '@phosphor-icons/react';
import type { ThemeMode } from '@/lib/types';
import { THEME_MEDIA_QUERY, THEME_STORAGE_KEY, cn } from '@/lib/utils';

const THEME_SCRIPT = `
  const doc = document.documentElement;
  const theme = localStorage.getItem("${THEME_STORAGE_KEY}") ?? "light";

  if (theme === "system") {
    if (window.matchMedia("${THEME_MEDIA_QUERY}").matches) {
      doc.classList.add("dark");
    } else {
      doc.classList.add("light");
    }
  } else {
    doc.classList.add(theme);
  }
`
  .trim()
  .replace(/\n/g, '')
  .replace(/\s+/g, ' ');

function applyTheme(theme: ThemeMode) {
  const doc = document.documentElement;

  doc.classList.remove('dark', 'light');
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  if (theme === 'system') {
    if (window.matchMedia(THEME_MEDIA_QUERY).matches) {
      doc.classList.add('dark');
    } else {
      doc.classList.add('light');
    }
  } else {
    doc.classList.add(theme);
  }
}

interface ThemeToggleProps {
  className?: string;
}

export function ApplyThemeScript() {
  return <script id="theme-script">{THEME_SCRIPT}</script>;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) ?? 'light';
    setTheme(storedTheme);

    const effTheme =
      storedTheme === 'system'
        ? window.matchMedia(THEME_MEDIA_QUERY).matches
          ? 'dark'
          : 'light'
        : (storedTheme as 'light' | 'dark');

    setEffectiveTheme(effTheme);
  }, []);

  // Listen for storage changes (cross-tab or dispatched for same-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: Event) => {
      if (e instanceof StorageEvent && e.key === THEME_STORAGE_KEY) {
        const newStoredTheme = (e.newValue as ThemeMode) ?? 'light';
        if (newStoredTheme) {
          setTheme(newStoredTheme);
          const newEffTheme =
            newStoredTheme === 'system'
              ? window.matchMedia(THEME_MEDIA_QUERY).matches
                ? 'dark'
                : 'light'
              : (newStoredTheme as 'light' | 'dark');
          setEffectiveTheme(newEffTheme);
        }
      } else if (e instanceof CustomEvent && (e as CustomEvent).detail?.key === THEME_STORAGE_KEY) {
        const newStoredTheme = (e.detail.newValue as ThemeMode) ?? 'light';
        if (newStoredTheme) {
          setTheme(newStoredTheme);
          const newEffTheme =
            newStoredTheme === 'system'
              ? window.matchMedia(THEME_MEDIA_QUERY).matches
                ? 'dark'
                : 'light'
              : (newStoredTheme as 'light' | 'dark');
          setEffectiveTheme(newEffTheme);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage-custom', handleStorageChange); // For same-tab dispatch

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-custom', handleStorageChange);
    };
  }, []);

  function handleThemeChange(newStoredTheme: ThemeMode) {
    applyTheme(newStoredTheme);
    setTheme(newStoredTheme);

    const newEffTheme =
      newStoredTheme === 'system'
        ? window.matchMedia(THEME_MEDIA_QUERY).matches
          ? 'dark'
          : 'light'
        : (newStoredTheme as 'light' | 'dark');

    setEffectiveTheme(newEffTheme);

    // Dispatch custom event for same-tab sync (e.g., during navigation)
    window.dispatchEvent(
      new CustomEvent('storage-custom', {
        detail: { key: THEME_STORAGE_KEY, newValue: newStoredTheme },
      })
    );
  }

  const toggleTheme = () => {
    // Simple light/dark toggle; adjust if system is needed
    handleThemeChange(effectiveTheme === 'light' ? 'dark' : 'light');
  };

  const isDark = effectiveTheme === 'dark';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Sun
        size={16}
        weight="bold"
        className={cn(
          'transition-opacity duration-200 ease-in-out',
          isDark && 'text-muted-foreground opacity-50'
        )}
      />
      <div
        role="switch"
        aria-checked={isDark}
        onClick={toggleTheme}
        className={cn(
          'group bg-foreground focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
        )}
        aria-label="Toggle dark mode"
      >
        <span
          className={cn(
            'bg-background pointer-events-none absolute top-0.5 left-0.5 inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition-transform duration-200 ease-in-out'
          )}
          style={{
            transform: isDark ? 'translateX(1.25rem)' : 'translateX(0)',
          }}
        />
      </div>
      <Moon
        size={16}
        weight="bold"
        className={cn(
          'transition-opacity duration-200 ease-in-out',
          !isDark && 'text-muted-foreground opacity-50'
        )}
      />
    </div>
  );
}
