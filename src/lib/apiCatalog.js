import { createInitialEditorialCatalog } from '../data/editorialSeeds.js';
import { toSlug } from './editorialCatalog.js';
import { lessonPreview } from './lessonHtml.js';

const initialCatalog = createInitialEditorialCatalog();

export function filterLessonsByTags(catalog, names = []) {
  const tagIds = new Set(catalog.tags.filter((tag) => names.includes(tag.name)).map((tag) => tag.id));
  return catalog.lessons.filter((lesson) => lesson.status === 'published'
    && (names.length === 0 || lesson.tagIds.some((id) => tagIds.has(id))));
}

export function mapApiCatalog(lessons, tags) {
  if (!Array.isArray(lessons) || !Array.isArray(tags)) {
    throw new Error('A API devolveu um catálogo inválido.');
  }
  const catalog = {
    version: 1,
    tags: tags.map((tag) => ({
      id: `api-tag-${tag.id}`, apiId: tag.id, name: tag.tag,
      slug: `${toSlug(tag.tag)}-${tag.id}`, description: '',
    })).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    lessons: [],
    quizzes: [],
  };

  for (const item of [...lessons].sort((a, b) => a.id - b.id)) {
    const original = initialCatalog.lessons.find((lesson) => lesson.title === item.title);
    const lesson = {
      id: original?.id ?? `api-lesson-${item.id}`,
      apiId: item.id,
      slug: original?.slug ?? `licao-${item.id}`,
      title: item.title,
      body: item.text,
      description: original?.description ?? lessonPreview(item.text),
      topicId: original?.topicId ?? null,
      guideId: original?.guideId ?? null,
      tagIds: item.tags.map((tag) => `api-tag-${tag.id}`),
      status: 'published',
    };
    catalog.lessons.push(lesson);
    if (!item.quizs.length) continue;
    const originalQuiz = initialCatalog.quizzes.find((quiz) => quiz.lessonId === original?.id);
    const questions = [...item.quizs].sort((a, b) => a.id - b.id).map((quiz) => {
      const answers = [...quiz.questionOutDtos].sort((a, b) => a.id - b.id);
      if (answers.length < 3 || answers.length > 5 || answers.filter((answer) => answer.isCorrect === true).length !== 1) {
        throw new Error(`A pergunta "${quiz.doubt}" possui alternativas inválidas na API.`);
      }
      const source = originalQuiz?.questions.find((question) => question.question === quiz.doubt);
      return {
        id: `api-question-${quiz.id}`, apiId: quiz.id,
        question: quiz.doubt,
        answers: answers.map((answer) => answer.text),
        correct: answers.findIndex((answer) => answer.isCorrect === true),
        explanation: source?.explanation ?? '',
        misconception: source?.misconception ?? '',
      };
    });
    catalog.quizzes.push({
      id: `quiz-${lesson.id}`, lessonId: lesson.id,
      title: `Revisão: ${lesson.title}`, status: 'published', questions,
    });
  }
  return catalog;
}

export function quizQuestionPayload(question) {
  const doubt = question.question.trim();
  if (!doubt || doubt.length > 255) throw new Error('O enunciado deve ter entre 1 e 255 caracteres.');
  if (question.answers.length < 3 || question.answers.length > 5) {
    throw new Error('Cada pergunta precisa de 3 a 5 alternativas.');
  }
  const answers = question.answers.map((answer) => answer.trim());
  if (answers.some((answer) => !answer || answer.length > 255)) {
    throw new Error('Cada alternativa deve ter entre 1 e 255 caracteres.');
  }
  if (new Set(answers.map((answer) => answer.toLocaleLowerCase('pt-BR'))).size !== answers.length) {
    throw new Error('As alternativas de uma pergunta precisam ser diferentes.');
  }
  if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct >= answers.length) {
    throw new Error('Selecione a alternativa correta.');
  }
  return { doubt, questions: answers.map((text, index) => ({ text, isCorrect: index === question.correct })) };
}
