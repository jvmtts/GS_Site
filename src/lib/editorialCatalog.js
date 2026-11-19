import { topics } from '../data/content.js';

export const EDITORIAL_TYPES = Object.freeze(['tags', 'lessons', 'quizzes']);
export const EDITORIAL_STATUSES = Object.freeze(['draft', 'published']);

export function toSlug(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
}

const text = (value) => String(value ?? '').trim();
const required = (value, label, limit) => {
  const result = text(value);
  if (!result) throw new Error(`Preencha ${label}.`);
  if (result.length > limit) throw new Error(`${label} deve ter no máximo ${limit} caracteres.`);
  return result;
};

export function validateEditorialRecord(type, input, catalog, previousId = null) {
  if (!EDITORIAL_TYPES.includes(type)) throw new Error('Tipo de conteúdo inválido.');
  const id = required(input.id, 'o identificador', 100);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('O identificador deve conter letras minúsculas, números e hífens.');
  if (catalog[type].some((record) => record.id === id && record.id !== previousId)) {
    throw new Error('Já existe um registro com este identificador.');
  }

  if (type === 'tags') {
    const name = required(input.name, 'o nome da tag', 80);
    const slug = required(input.slug, 'o identificador da tag', 100);
    if (toSlug(slug) !== slug) throw new Error('O identificador da tag deve conter letras minúsculas, números e hífens.');
    if (catalog.tags.some((tag) => tag.slug === slug && tag.id !== previousId)) {
      throw new Error('Já existe uma tag com este identificador.');
    }
    return { id, name, slug, description: text(input.description).slice(0, 500) };
  }

  if (type === 'lessons') {
    const title = required(input.title, 'o título da lição', 150);
    const slug = required(input.slug, 'o endereço da lição', 100);
    if (toSlug(slug) !== slug) throw new Error('O endereço deve conter letras minúsculas, números e hífens.');
    if (catalog.lessons.some((lesson) => lesson.slug === slug && lesson.id !== previousId)) {
      throw new Error('Já existe uma lição com este endereço.');
    }
    const topicId = required(input.topicId, 'o assunto', 60);
    if (!topics.some((topic) => topic.id === topicId)) throw new Error('Selecione um assunto existente.');
    const guideId = input.guideId || null;
    if (guideId && !catalog._guideIds?.includes(guideId)) {
      throw new Error('O guia vinculado não existe no acervo.');
    }
    const tagIds = [...new Set(Array.isArray(input.tagIds) ? input.tagIds : [])];
    if (tagIds.some((tagId) => !catalog.tags.some((tag) => tag.id === tagId))) {
      throw new Error('Uma das tags vinculadas não existe.');
    }
    const status = EDITORIAL_STATUSES.includes(input.status) ? input.status : 'draft';
    return {
      id, slug, title,
      description: required(input.description, 'a descrição da lição', 500),
      body: required(input.body, 'o texto da lição', 12000),
      topicId, guideId, tagIds, status,
    };
  }

  const lessonId = required(input.lessonId, 'a lição vinculada', 100);
  if (!catalog.lessons.some((lesson) => lesson.id === lessonId)) throw new Error('Selecione uma lição existente.');
  if (catalog.quizzes.some((quiz) => quiz.lessonId === lessonId && quiz.id !== previousId)) {
    throw new Error('Essa lição já possui um quiz. Edite o quiz existente.');
  }
  const questions = input.questions;
  if (!Array.isArray(questions) || questions.length === 0) throw new Error('Adicione pelo menos uma pergunta.');
  if (questions.length > 100) throw new Error('O quiz aceita no máximo 100 perguntas.');
  const questionIds = new Set();
  const validatedQuestions = questions.map((item, index) => {
    const question = required(item.question, `o enunciado da pergunta ${index + 1}`, 600);
    const questionId = required(item.id, `o identificador da pergunta ${index + 1}`, 100);
    if (questionIds.has(questionId)) throw new Error('Existem identificadores de perguntas duplicados.');
    questionIds.add(questionId);
    if (!Array.isArray(item.answers) || item.answers.length < 2 || item.answers.length > 5) {
      throw new Error(`A pergunta ${index + 1} precisa de 2 a 5 alternativas.`);
    }
    const answers = item.answers.map((answer) => required(answer, `uma alternativa da pergunta ${index + 1}`, 400));
    if (!Number.isInteger(item.correct) || item.correct < 0 || item.correct >= answers.length) {
      throw new Error(`Selecione a resposta correta da pergunta ${index + 1}.`);
    }
    return {
      id: questionId, question, answers, correct: item.correct,
      explanation: required(item.explanation, `a explicação da pergunta ${index + 1}`, 1200),
      misconception: text(item.misconception).slice(0, 1200),
    };
  });
  return {
    id,
    lessonId,
    title: required(input.title, 'o título do quiz', 150),
    status: EDITORIAL_STATUSES.includes(input.status) ? input.status : 'draft',
    questions: validatedQuestions,
  };
}

export function prepareEditorialCatalog(catalog, guideIds) {
  return { ...catalog, _guideIds: guideIds };
}

export function putEditorialRecord(catalog, type, input, guideIds, previousId = null) {
  if (previousId && !catalog[type].some((record) => record.id === previousId)) {
    throw new Error('O registro que você tentou editar não existe mais.');
  }
  const record = validateEditorialRecord(type, input, prepareEditorialCatalog(catalog, guideIds), previousId);
  if (previousId && record.id !== previousId) throw new Error('O identificador do registro não pode ser alterado.');
  const records = previousId
    ? catalog[type].map((current) => current.id === previousId ? record : current)
    : [...catalog[type], record];
  return { catalog: { ...catalog, [type]: records }, record };
}

export function deleteEditorialRecord(catalog, type, id) {
  if (!EDITORIAL_TYPES.includes(type)) throw new Error('Tipo de conteúdo inválido.');
  if (!catalog[type].some((item) => item.id === id)) throw new Error('O registro não existe mais.');
  const next = { ...catalog, [type]: catalog[type].filter((record) => record.id !== id) };
  if (type === 'tags') {
    next.lessons = catalog.lessons.map((lesson) => ({
      ...lesson, tagIds: lesson.tagIds.filter((tagId) => tagId !== id),
    }));
  }
  if (type === 'lessons') {
    next.quizzes = catalog.quizzes.filter((quiz) => quiz.lessonId !== id);
  }
  return next;
}

export function normalizeEditorialCatalog(candidate, fallback) {
  if (!candidate || candidate.version !== 1 ||
    !EDITORIAL_TYPES.every((type) => Array.isArray(candidate[type]))) return fallback;
  const all = [...candidate.tags, ...candidate.lessons, ...candidate.quizzes];
  if (all.some((entry) => !entry || typeof entry !== 'object' || Array.isArray(entry))) return fallback;
  const next = {
    version: 1,
    tags: candidate.tags,
    lessons: candidate.lessons,
    quizzes: candidate.quizzes,
  };
  try {
    for (const type of EDITORIAL_TYPES) {
      const ids = next[type].map((item) => item.id);
      if (new Set(ids).size !== ids.length) return fallback;
      next[type] = next[type].map((item) => validateEditorialRecord(
        type, item, prepareEditorialCatalog(next, fallback.lessons.map((lesson) => lesson.guideId).filter(Boolean)), item.id,
      ));
    }
    return next;
  } catch {
    return fallback;
  }
}
