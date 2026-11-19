import { useEffect, useState } from 'react';
import { normalizeLocalValue } from '../lib/localState.js';

export default function usePersistentState(key, initialValue) {
  const storageKey = `pp-${key}`;
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw === null ? initialValue : normalizeLocalValue(key, JSON.parse(raw), initialValue);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
    }
  }, [storageKey, value]);

  return [value, setValue];
}
