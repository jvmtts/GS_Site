import Admin from '../pages/Admin.jsx';
import Guide from '../pages/Guide.jsx';
import Home from '../pages/Home.jsx';
import Lesson from '../pages/Lesson.jsx';
import Lessons from '../pages/Lessons.jsx';
import NotFound from '../pages/NotFound.jsx';
import Quiz from '../pages/Quiz.jsx';
import Topics from '../pages/Topics.jsx';
import User from '../pages/User.jsx';
import { resolveRoute } from '../lib/routes.js';
import { useEditorialContent } from './EditorialContext.jsx';

const EMPTY_NOTES = Object.freeze({});

export default function RouteView({ path, portal, onOpenPreferences }) {
  const editorial = useEditorialContent();
  const route = resolveRoute(path, editorial.catalog);
  const {
    saved, history, profile, quizResults, readingProgress, readingNotes,
    toggleSavedGuide, recordQuizResult, recordSectionVisit, toggleGuideRead,
    saveReadingNote, clearHistory, clearReadingData, clearLocalData,
  } = portal;

  switch (route.kind) {
    case 'home':
      return <Home saved={saved} onToggle={toggleSavedGuide} />;
    case 'topics':
      return <Topics />;
    case 'guide':
      return (
        <Guide
          key={route.guide.slug}
          slug={route.guide.slug}
          saved={saved.includes(route.guide.id)}
          onToggle={toggleSavedGuide}
          readingEntry={readingProgress[route.guide.id]}
          onSectionVisited={recordSectionVisit}
          onMarkRead={toggleGuideRead}
          readingNotes={readingNotes[route.guide.id] ?? EMPTY_NOTES}
          onSaveNote={saveReadingNote}
          onOpenPreferences={onOpenPreferences}
        />
      );
    case 'lessons':
      return <Lessons results={quizResults} lessons={editorial.catalog.lessons} tags={editorial.catalog.tags} />;
    case 'lesson':
      return <Lesson key={route.lesson.id} lesson={route.lesson} quiz={route.quiz} tags={editorial.catalog.tags} />;
    case 'quiz':
      return <Quiz key={route.quiz.id} lesson={route.lesson} quiz={route.quiz} onComplete={recordQuizResult} />;
    case 'user':
      return (
        <User
          saved={saved}
          history={history}
          onToggle={toggleSavedGuide}
          profile={profile}
          results={quizResults}
          readingProgress={readingProgress}
          readingNotes={readingNotes}
          onClearHistory={clearHistory}
          onClearReading={clearReadingData}
          onMarkRead={toggleGuideRead}
          onClearAll={clearLocalData}
          onOpenPreferences={onOpenPreferences}
          lessons={editorial.catalog.lessons}
          quizzes={editorial.catalog.quizzes}
        />
      );
    case 'admin':
      return <Admin />;
    default:
      return <NotFound />;
  }
}
