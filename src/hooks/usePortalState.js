import { useCallback, useEffect } from 'react';
import { getGuideById, getGuideBySlug } from '../data/content.js';
import { mergeQuizResult } from '../lib/learningProgress.js';
import { updateReadingNote } from '../lib/readingNotes.js';
import { setGuideRead, visitReadingSection } from '../lib/readingProgress.js';
import usePersistentState from './usePersistentState.js';

const EMPTY_PROFILE = { name: '', readingMode: 'normal' };

export default function usePortalState(path) {
  const [saved, setSaved] = usePersistentState('saved-guides', []);
  const [history, setHistory] = usePersistentState('history', []);
  const [profile, setProfile] = usePersistentState('local-profile', EMPTY_PROFILE);
  const [quizResults, setQuizResults] = usePersistentState('quiz-results', {});
  const [readingProgress, setReadingProgress] = usePersistentState('reading-progress', {});
  const [readingNotes, setReadingNotes] = usePersistentState('reading-notes', {});

  useEffect(() => {
    const guideSlug = path.match(/^\/guia\/([a-z0-9-]+)$/)?.[1];
    const guide = guideSlug ? getGuideBySlug(guideSlug) : null;
    if (!guide) return;
    setHistory((items) => [guide.id, ...items.filter((id) => id !== guide.id)].slice(0, 15));
  }, [path, setHistory]);

  const toggleSavedGuide = useCallback((id) => {
    setSaved((items) => items.includes(id)
      ? items.filter((item) => item !== id)
      : [...items, id]);
  }, [setSaved]);

  const recordQuizResult = useCallback((guideId, score, total) => {
    setQuizResults((results) => mergeQuizResult(results, guideId, score, total, new Date().toISOString()));
  }, [setQuizResults]);

  const recordSectionVisit = useCallback((guideId, sectionId) => {
    const guide = getGuideById(guideId);
    if (!guide) return;
    setReadingProgress((progress) => visitReadingSection(progress, guide, sectionId, new Date().toISOString()));
  }, [setReadingProgress]);

  const toggleGuideRead = useCallback((guideId, read) => {
    const guide = getGuideById(guideId);
    if (!guide) return;
    setReadingProgress((progress) => setGuideRead(progress, guide, read, new Date().toISOString()));
  }, [setReadingProgress]);

  const saveReadingNote = useCallback((guideId, sectionId, value) => {
    const guide = getGuideById(guideId);
    if (!guide?.sections.some((section) => section.id === sectionId)) return;
    setReadingNotes((notes) => updateReadingNote(notes, guideId, sectionId, value));
  }, [setReadingNotes]);

  const clearLocalData = useCallback(() => {
    setSaved([]);
    setHistory([]);
    setProfile(EMPTY_PROFILE);
    setQuizResults({});
    setReadingProgress({});
    setReadingNotes({});
    try {
      window.localStorage.removeItem('pp-admin-drafts-v2');
      window.localStorage.removeItem('pp-editorial-notes');
    } catch {
      return;
    }
  }, [setHistory, setProfile, setQuizResults, setReadingNotes, setReadingProgress, setSaved]);

  return {
    saved,
    history,
    profile,
    quizResults,
    readingProgress,
    readingNotes,
    toggleSavedGuide,
    recordQuizResult,
    recordSectionVisit,
    toggleGuideRead,
    saveReadingNote,
    clearHistory: () => setHistory([]),
    clearReadingData: () => setReadingProgress({}),
    clearLocalData,
  };
}
