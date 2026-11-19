import { useEffect, useMemo, useState } from 'react';
import { normalizePreferences, resolveTheme } from '../lib/readingPreferences.js';
import usePersistentState from './usePersistentState.js';

export default function useReaderPreferences(legacyReadingMode = 'normal') {
  const [stored, setStored] = usePersistentState('reader-preferences', null);
  const preferences = useMemo(() => normalizePreferences(stored, legacyReadingMode), [stored, legacyReadingMode]);
  const [prefersDark, setPrefersDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches);
  const theme = resolveTheme(preferences.theme, prefersDark);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setPrefersDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.readerSize = preferences.fontSize;
    root.dataset.readerSpacing = preferences.spacing;
    root.dataset.readerFocus = preferences.focus ? 'on' : 'off';
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#14171d' : '#ffffff');
  }, [theme, preferences]);

  return {
    preferences, theme,
    changePreferences: (patch) => setStored((current) => ({
      ...normalizePreferences(current, legacyReadingMode), ...patch,
    })),
    resetPreferences: () => setStored(null),
  };
}
