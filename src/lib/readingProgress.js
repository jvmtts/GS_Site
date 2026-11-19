
export function sectionIdsOf(guide) {
  return Array.isArray(guide?.sections)
    ? guide.sections.filter((section) => typeof section?.id === 'string').map(({ id }) => id)
    : [];
}

export function summarizeReading(guide, savedEntry) {
  const ids = sectionIdsOf(guide);
  const entry = savedEntry && typeof savedEntry === 'object' && !Array.isArray(savedEntry)
    ? savedEntry : {};
  const rawVisited = Array.isArray(entry.visited) ? entry.visited : [];
  const visited = ids.filter((id) => rawVisited.includes(id));
  const lastSectionId = ids.includes(entry.lastSectionId)
    ? entry.lastSectionId : (visited.at(-1) ?? null);
  const total = ids.length;
  const count = visited.length;
  const percent = total ? Math.round(count * 100 / total) : 0;
  return {
    visited, count, total, percent, lastSectionId,
    lastSectionTitle: guide?.sections?.find((section) => section.id === lastSectionId)?.title ?? null,
    started: count > 0,
    allVisited: total > 0 && count === total,
    markedRead: typeof entry.markedReadAt === 'string' && entry.markedReadAt.length > 0,
    lastReadAt: typeof entry.lastReadAt === 'string' ? entry.lastReadAt : null,
  };
}

export function visitReadingSection(current, guide, sectionId, when) {
  if (!guide?.id || !sectionIdsOf(guide).includes(sectionId)) return current;
  const base = current && typeof current === 'object' && !Array.isArray(current) ? current : {};
  const previous = base[guide.id] ?? {};
  const visited = summarizeReading(guide, previous).visited;
  const nextVisited = visited.includes(sectionId) ? visited : [...visited, sectionId];
  return {
    ...base,
    [guide.id]: {
      ...previous,
      visited: nextVisited,
      lastSectionId: sectionId,
      lastReadAt: when,
    },
  };
}

export function setGuideRead(current, guide, read, when) {
  if (!guide?.id) return current;
  const base = current && typeof current === 'object' && !Array.isArray(current) ? current : {};
  const previous = base[guide.id] ?? {};
  const summary = summarizeReading(guide, previous);
  if (!summary.allVisited && read) return current;
  if (!summary.started) return current;
  const { markedReadAt, ...withoutMark } = previous;
  return {
    ...base,
    [guide.id]: read ? { ...withoutMark, markedReadAt: when } : withoutMark,
  };
}

export function removeGuideReading(current, guideId) {
  if (!current || !Object.hasOwn(current, guideId)) return current;
  const { [guideId]: ignored, ...remaining } = current;
  return remaining;
}

export function listReadingActivity(guides, progress) {
  return guides.map((guide) => ({ guide, ...summarizeReading(guide, progress?.[guide.id]) }))
    .filter((item) => item.started)
    .sort((a, b) => (b.lastReadAt ?? '').localeCompare(a.lastReadAt ?? ''));
}

export function resumePath(guide, entry) {
  const summary = summarizeReading(guide, entry);
  return summary.lastSectionId
    ? `${guide.path}#${encodeURIComponent(summary.lastSectionId)}`
    : guide.path;
}
