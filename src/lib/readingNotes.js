
export function updateReadingNote(source, guideId, sectionId, value) {
  if (typeof guideId !== 'string' || typeof sectionId !== 'string') return source ?? {};
  const notes = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
  const text = String(value ?? '').trim().slice(0, 1500);
  const entries = { ...(notes[guideId] || {}) };
  if (text) entries[sectionId] = text;
  else delete entries[sectionId];
  const next = { ...notes };
  if (Object.keys(entries).length) next[guideId] = entries;
  else delete next[guideId];
  return next;
}
export function countNotes(source) {
  return Object.values(source || {}).reduce((sum, group) => sum + Object.keys(group || {}).length, 0);
}
