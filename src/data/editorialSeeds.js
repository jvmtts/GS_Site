import { guides, questionsByGuide } from './content.js';
import { toLessonHtml } from '../lib/lessonText.js';

export function createInitialEditorialCatalog() {
  return {
    version: 1,
    tags: [],
    lessons: guides.map((guide) => ({
      id: guide.id,
      slug: guide.slug,
      title: guide.lessonTitle,
      description: guide.lessonDescription,
      body: toLessonHtml(guide.lessonText),
      topicId: guide.categoryId,
      guideId: guide.id,
      tagIds: [],
      status: 'published',
    })),
    quizzes: guides.map((guide) => ({
      id: `quiz-${guide.id}`,
      lessonId: guide.id,
      title: `Revisão: ${guide.lessonTitle}`,
      status: 'published',
      questions: (questionsByGuide[guide.id] ?? []).map((item, index) => ({
        id: `${guide.id}-q${index + 1}`,
        question: item.question,
        answers: [...item.answers],
        correct: item.correct,
        explanation: item.explanation,
        misconception: item.misconception,
      })),
    })),
  };
}
