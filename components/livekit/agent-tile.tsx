'use client';

import { useEffect, useState } from 'react';
import { Waveform } from 'ldrs/react';
import 'ldrs/react/Waveform.css';
import { type AgentState, type TrackReference } from '@livekit/components-react';
import type { ThemeMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { THEME_MEDIA_QUERY, THEME_STORAGE_KEY } from '@/lib/utils';

interface AgentAudioTileProps {
  state: AgentState;
  audioTrack: TrackReference;
  className?: string;
}

export const AgentTile = ({
  className,
  ref,
}: React.ComponentProps<'div'> & AgentAudioTileProps) => {
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) ?? 'system';
    const effTheme =
      storedTheme === 'system'
        ? window.matchMedia(THEME_MEDIA_QUERY).matches
          ? 'dark'
          : 'light'
        : (storedTheme as 'light' | 'dark');
    setEffectiveTheme(effTheme);

    const handleStorageChange = (e: Event) => {
      let newStoredTheme: ThemeMode | null = null;
      if (e instanceof StorageEvent && e.key === THEME_STORAGE_KEY) {
        newStoredTheme = e.newValue as ThemeMode;
      } else if (e instanceof CustomEvent && (e as CustomEvent).detail?.key === THEME_STORAGE_KEY) {
        newStoredTheme = (e as CustomEvent).detail.newValue as ThemeMode;
      }

      if (newStoredTheme) {
        const newEffTheme =
          newStoredTheme === 'system'
            ? window.matchMedia(THEME_MEDIA_QUERY).matches
              ? 'dark'
              : 'light'
            : (newStoredTheme as 'light' | 'dark');
        setEffectiveTheme(newEffTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage-custom', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-custom', handleStorageChange);
    };
  }, []);

  const waveformColor = effectiveTheme === 'dark' ? 'white' : 'black';

  return (
    <div ref={ref} className={cn(className, 'flex items-center justify-center')}>
      <Waveform size={91} stroke={4} speed={1} color={waveformColor} />
    </div>
  );
};
