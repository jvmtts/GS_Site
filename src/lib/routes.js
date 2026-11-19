import { getGuideBySlug } from '../data/content.js';
import { createInitialEditorialCatalog } from '../data/editorialSeeds.js';

export function resolveRoute(path, catalog = createInitialEditorialCatalog()) {
  const roots = new Map([
    ['/home', 'home'],
    ['/assuntos', 'topics'],
    ['/licoes', 'lessons'],
    ['/user', 'user'],
    ['/admin', 'admin'],
  ]);
  if (roots.has(path)) return { kind: roots.get(path) };

  const match = /^\/(guia|licoes)\/([a-z0-9-]+)(\/quiz)?$/.exec(path);
  if (!match) return { kind: 'not-found' };
  const [, area, slug, quiz] = match;
  if (area === 'guia' && !quiz) {
    const guide = getGuideBySlug(slug);
    return guide ? { kind: 'guide', guide } : { kind: 'not-found' };
  }
  if (area === 'licoes') {
    const lesson = catalog.lessons.find((item) => item.slug === slug && item.status === 'published');
    if (!lesson) return { kind: 'not-found' };
    const linkedQuiz = catalog.quizzes.find((item) => item.lessonId === lesson.id && item.status === 'published');
    if (quiz && !linkedQuiz) return { kind: 'not-found' };
    return { kind: quiz ? 'quiz' : 'lesson', lesson, quiz: linkedQuiz ?? null };
  }
  return { kind: 'not-found' };
}

export function guidePath(guide) { return `/guia/${guide.slug}`; }
export function lessonPath(guide) { return `/licoes/${guide.slug}`; }
export function quizPath(guide) { return `/licoes/${guide.slug}/quiz`; }
