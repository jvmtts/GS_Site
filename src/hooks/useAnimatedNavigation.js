import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizePath, splitDestination } from '../lib/paths.js';
import { MOTION_TIMING } from '../lib/motionTiming.js';

export default function useAnimatedNavigation(reducedMotion, onNavigationStart) {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const [transitionId, setTransitionId] = useState(null);
  const shownPathRef = useRef(path);
  const pendingRef = useRef(null);
  const timersRef = useRef([]);
  const nextIdRef = useRef(0);
  const needsFocusRef = useRef(false);
  const fragmentRef = useRef('');

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const cancel = useCallback(() => {
    clearTimers();
    pendingRef.current = null;
    setTransitionId(null);
  }, [clearTimers]);

  const commit = useCallback((id) => {
    const pending = pendingRef.current;
    if (!pending || pending.id !== id || pending.swapped) return;

    pending.swapped = true;
    if (pending.mode === 'push') {
      window.history.pushState(null, '', pending.destination);
    }
    shownPathRef.current = pending.pathname;
    fragmentRef.current = pending.fragment;
    needsFocusRef.current = true;
    setPath(pending.pathname);
    if (!pending.fragment) window.scrollTo(0, 0);
  }, []);

  const finish = useCallback((id) => {
    if (pendingRef.current?.id !== id) return;
    commit(id);
    cancel();
  }, [cancel, commit]);

  const start = useCallback((destination, mode = 'push') => {
    const { pathname, fragment } = splitDestination(destination);
    const pending = pendingRef.current;

    if (mode === 'push' && pending?.destination === destination) return;

    if (pathname === shownPathRef.current && mode === 'push') {
      if (pending) cancel();
      if (fragment) {
        window.history.pushState(null, '', destination);
        document.getElementById(fragment)?.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
      }
      return;
    }

    if (mode === 'pop' && pathname === shownPathRef.current && !pending) {
      if (fragment) document.getElementById(fragment)?.scrollIntoView();
      return;
    }

    cancel();
    onNavigationStart?.();
    const id = ++nextIdRef.current;
    pendingRef.current = {
      id,
      destination,
      pathname,
      fragment,
      mode,
      swapped: false,
    };

    if (reducedMotion) {
      commit(id);
      cancel();
      return;
    }

    setTransitionId(id);
    timersRef.current.push(window.setTimeout(() => commit(id), MOTION_TIMING.swap));
    timersRef.current.push(window.setTimeout(
      () => finish(id),
      MOTION_TIMING.transition + MOTION_TIMING.fallbackGrace,
    ));
  }, [cancel, commit, finish, onNavigationStart, reducedMotion]);

  useEffect(() => {
    const handlePopState = () => start(
      `${window.location.pathname}${window.location.hash}`,
      'pop',
    );
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [start]);

  useEffect(() => {
    if (reducedMotion && pendingRef.current) finish(pendingRef.current.id);
  }, [reducedMotion, finish]);

  useEffect(() => {
    if (!needsFocusRef.current) return;
    needsFocusRef.current = false;
    const fragment = fragmentRef.current;
    fragmentRef.current = '';
    document.getElementById('main-content')?.focus({ preventScroll: true });
    if (fragment) document.getElementById(fragment)?.scrollIntoView({ behavior: 'auto' });
  }, [path]);

  useEffect(() => clearTimers, [clearTimers]);

  return { path, navigate: start, transitionId, finishTransition: finish };
}
