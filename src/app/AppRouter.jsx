import { useCallback, useEffect, useState } from 'react';
import { getGuideBySlug } from '../data/content.js';
import DotMotion from '../components/DotMotion.jsx';
import Footer from '../components/layout/Footer.jsx';
import Header from '../components/layout/Header.jsx';
import PreferencesDialog from '../components/reader/PreferencesDialog.jsx';
import useAnimatedNavigation from '../hooks/useAnimatedNavigation.js';
import usePortalState from '../hooks/usePortalState.js';
import useReaderPreferences from '../hooks/useReaderPreferences.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import useEditorialCatalog from '../hooks/useEditorialCatalog.js';
import useApiUser from '../hooks/useApiUser.js';
import { EditorialContext } from './EditorialContext.jsx';
import { MOTION_TIMING } from '../lib/motionTiming.js';
import { NavigationContext } from './NavigationContext.jsx';
import RouteView from './RouteView.jsx';

function pageTitle(path, catalog) {
  const titles = {
    '/home': 'Portal',
    '/assuntos': 'Assuntos',
    '/licoes': 'Lições',
    '/user': 'Minhas leituras',
    '/admin': 'Painel editorial',
  };
  return titles[path] ?? catalog.lessons.find((lesson) => lesson.slug === path.split('/')[2])?.title ?? getGuideBySlug(path.split('/')[2])?.title ?? 'Ponto Público';
}

export default function AppRouter() {
  const reducedMotion = useReducedMotion();
  const [splashVisible, setSplashVisible] = useState(() => !reducedMotion);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const hideSplash = useCallback(() => setSplashVisible(false), []);
  const { path, navigate, transitionId, finishTransition } = useAnimatedNavigation(reducedMotion, hideSplash);
  const portal = usePortalState(path);
  const editorial = useEditorialCatalog();
  const account = useApiUser();
  const { preferences, changePreferences, resetPreferences } = useReaderPreferences(portal.profile?.readingMode);

  useEffect(() => {
    if (reducedMotion) {
      hideSplash();
      return undefined;
    }
    if (!splashVisible) return undefined;
    const timer = window.setTimeout(hideSplash, MOTION_TIMING.splash + MOTION_TIMING.fallbackGrace);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, splashVisible, hideSplash]);

  useEffect(() => {
    document.title = `${pageTitle(path, editorial.catalog)} — Ponto Público`;
  }, [path, editorial.catalog]);

  const clearAllLocalData = () => {
    portal.clearLocalData();
    resetPreferences();
  };

  return (
    <EditorialContext.Provider value={{ ...editorial, account }}>
      <NavigationContext.Provider value={navigate}>
        <div className="app-root">
        <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
        <Header path={path} saved={portal.saved} onOpenPreferences={() => setPreferencesOpen(true)} />
        <main id="main-content" tabIndex="-1">
          <RouteView path={path} portal={{ ...portal, clearLocalData: clearAllLocalData }}
            onOpenPreferences={() => setPreferencesOpen(true)} />
        </main>
        <Footer />
        <PreferencesDialog
          open={preferencesOpen}
          onClose={() => setPreferencesOpen(false)}
          preferences={preferences}
          changePreferences={changePreferences}
        />
        {splashVisible && !reducedMotion && <DotMotion type="splash" onComplete={hideSplash} />}
        {transitionId !== null && !reducedMotion && (
          <DotMotion
            key={transitionId}
            type="transition"
            onComplete={() => finishTransition(transitionId)}
          />
        )}
        </div>
      </NavigationContext.Provider>
    </EditorialContext.Provider>
  );
}
