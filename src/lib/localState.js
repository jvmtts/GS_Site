
const isRecord = (item) => item !== null && typeof item === 'object' && !Array.isArray(item);
const isString = (item) => typeof item === 'string';

export function normalizeLocalValue(key, stored, fallback) {
  if (stored === null && fallback === null) return null;

  if (key === 'saved-guides' || key === 'history') {
    return Array.isArray(stored) ? stored.filter(isString).slice(0, 200) : fallback;
  }

  if (key === 'local-profile') {
    if (!isRecord(stored)) return fallback;
    return {
      name: isString(stored.name) ? stored.name.slice(0, 40) : '',
      readingMode: stored.readingMode === 'large' ? 'large' : 'normal',
    };
  }

  if (key === 'quiz-results') {
    if (!isRecord(stored)) return fallback;
    return Object.fromEntries(Object.entries(stored).filter(([, value]) =>
      isRecord(value) && Number.isInteger(value.best) && Number.isInteger(value.total)
      && Number.isInteger(value.attempts) && value.total > 0 && value.attempts >= 1
      && value.best >= 0 && value.best <= value.total));
  }

  if (key === 'reading-progress') {
    if (!isRecord(stored)) return fallback;
    return Object.fromEntries(Object.entries(stored)
      .filter(([, entry]) => isRecord(entry))
      .map(([id, entry]) => [id, {
        ...entry,
        visited: Array.isArray(entry.visited) ? entry.visited.filter(isString).slice(0, 200) : [],
        lastSectionId: isString(entry.lastSectionId) ? entry.lastSectionId : null,
        lastReadAt: isString(entry.lastReadAt) ? entry.lastReadAt : null,
        markedReadAt: isString(entry.markedReadAt) ? entry.markedReadAt : null,
      }]));
  }

  if (key === 'reading-notes') {
    if (!isRecord(stored)) return fallback;
    return Object.fromEntries(Object.entries(stored)
      .filter(([, value]) => isRecord(value))
      .map(([id, value]) => [id, Object.fromEntries(Object.entries(value)
        .filter(([, note]) => isString(note) && note.trim())
        .map(([sectionId, note]) => [sectionId, note.slice(0, 1500)]))]));
  }

  if (key === 'reader-preferences') return isRecord(stored) ? stored : fallback;

  if (key === 'editorial-notes') {
    if (!isRecord(stored)) return fallback;
    return Object.fromEntries(Object.entries(stored)
      .filter(([, value]) => isString(value))
      .map(([id, value]) => [id, value.slice(0, 2000)]));
  }

  return stored;
}
