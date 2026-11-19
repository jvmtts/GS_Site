import { useEffect, useMemo, useState } from 'react';
import { sectionIdsOf } from '../lib/readingProgress.js';

export default function useSectionReading(guide, onSectionVisited) {
  const ids = useMemo(() => sectionIdsOf(guide), [guide]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const guideId = guide?.id;

  useEffect(() => {
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!nodes.length) return undefined;
    let rafId = null;
    const update = () => {
      rafId = null;
      const top = Math.max(92, window.innerHeight * 0.17);
      const bottom = Math.max(top + 80, window.innerHeight * 0.70);
      const visible = nodes.find((node) => {
        const rect = node.getBoundingClientRect();
        return rect.top <= bottom && rect.bottom >= top;
      });
      setActiveSectionId(visible?.id ?? null);
    };
    const requestUpdate = () => {
      if (rafId === null) rafId = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [ids]);

  useEffect(() => {
    if (!activeSectionId || !guideId) return undefined;
    const timer = window.setTimeout(() => {
      onSectionVisited?.(guideId, activeSectionId);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [activeSectionId, guideId, onSectionVisited]);

  useEffect(() => {
    let id;
    try { id = decodeURIComponent(window.location.hash.replace(/^#/, '')); }
    catch { return undefined; }
    if (!ids.includes(id)) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'auto' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [ids]);

  return activeSectionId;
}
