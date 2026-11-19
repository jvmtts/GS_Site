import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialEditorialCatalog } from '../src/data/editorialSeeds.js';
import { toSlug, putEditorialRecord, deleteEditorialRecord, normalizeEditorialCatalog } from '../src/lib/editorialCatalog.js';
import { createLocalEditorialRepository, EDITORIAL_STORAGE_KEY } from '../src/repositories/localEditorialRepository.js';
import { resolveRoute } from '../src/lib/routes.js';
import { guides } from '../src/data/content.js';

const guideIds = guides.map((guide) => guide.id);
const newTag = { id: 'tag-nova', name: 'Controle social', slug: 'controle-social', description: 'Participação pública' };
const newLesson = {
  id: 'lesson-nova', title: 'Lição de teste', slug: 'licao-de-teste',
  description: 'Descrição editorial', body: 'Texto didático de teste',
  topicId: 'direitos', guideId: null, tagIds: ['tag-nova'], status: 'published',
};
const newQuiz = {
  id: 'quiz-novo', title: 'Quiz de teste', lessonId: 'lesson-nova', status: 'published',
  questions: [{ id: 'pergunta-1', question: 'Qual opção é válida?', answers: ['Correta', 'Incorreta'],
    correct: 0, explanation: 'Explicação necessária.', misconception: 'A segunda não corresponde.' }],
};

test('catálogo inicial deriva exatamente as 14 lições e 84 perguntas já existentes, sem inventar tags', () => {
  const catalog = createInitialEditorialCatalog();
  assert.equal(catalog.lessons.length, guides.length);
  assert.equal(catalog.quizzes.length, guides.length);
  assert.equal(catalog.quizzes.reduce((count, quiz) => count + quiz.questions.length, 0), 84);
  assert.deepEqual(catalog.tags, []);
  assert.equal(resolveRoute('/licoes/orcamento-publico', catalog).kind, 'lesson');
});

test('cadastro de tag, vínculo à lição e quiz alteram as rotas públicas locais', () => {
  let catalog = createInitialEditorialCatalog();
  catalog = putEditorialRecord(catalog, 'tags', newTag, guideIds).catalog;
  catalog = putEditorialRecord(catalog, 'lessons', newLesson, guideIds).catalog;
  catalog = putEditorialRecord(catalog, 'quizzes', newQuiz, guideIds).catalog;
  assert.equal(resolveRoute('/licoes/licao-de-teste', catalog).lesson.title, newLesson.title);
  assert.equal(resolveRoute('/licoes/licao-de-teste/quiz', catalog).quiz.questions.length, 1);
  assert.deepEqual(catalog.lessons.at(-1).tagIds, ['tag-nova']);
});

test('rascunhos não geram rotas públicas e a publicação ativa a página', () => {
  let catalog = createInitialEditorialCatalog();
  catalog = putEditorialRecord(catalog, 'tags', newTag, guideIds).catalog;
  catalog = putEditorialRecord(catalog, 'lessons', { ...newLesson, status: 'draft' }, guideIds).catalog;
  assert.equal(resolveRoute('/licoes/licao-de-teste', catalog).kind, 'not-found');
  catalog = putEditorialRecord(catalog, 'lessons', newLesson, guideIds, newLesson.id).catalog;
  assert.equal(resolveRoute('/licoes/licao-de-teste', catalog).kind, 'lesson');
});

test('edição e exclusão mantêm integridade das relações entre tags, lições e quizzes', () => {
  let catalog = createInitialEditorialCatalog();
  catalog = putEditorialRecord(catalog, 'tags', newTag, guideIds).catalog;
  catalog = putEditorialRecord(catalog, 'lessons', newLesson, guideIds).catalog;
  catalog = putEditorialRecord(catalog, 'quizzes', newQuiz, guideIds).catalog;
  catalog = putEditorialRecord(catalog, 'lessons', { ...newLesson, title: 'Lição revisada' }, guideIds, newLesson.id).catalog;
  assert.equal(catalog.lessons.at(-1).title, 'Lição revisada');
  catalog = deleteEditorialRecord(catalog, 'tags', newTag.id);
  assert.deepEqual(catalog.lessons.at(-1).tagIds, []);
  catalog = deleteEditorialRecord(catalog, 'lessons', newLesson.id);
  assert.equal(catalog.quizzes.find((quiz) => quiz.id === newQuiz.id), undefined);
  assert.equal(resolveRoute('/licoes/licao-de-teste', catalog).kind, 'not-found');
});

test('não admite slugs, relações e respostas inválidos nem quizzes duplicados para a mesma lição', () => {
  let catalog = createInitialEditorialCatalog();
  assert.throws(() => putEditorialRecord(catalog, 'lessons', { ...newLesson, tagIds: [] , slug: catalog.lessons[0].slug }, guideIds), /Já existe uma lição/);
  assert.throws(() => putEditorialRecord(catalog, 'lessons', { ...newLesson, tagIds: ['tag-inexistente'] }, guideIds), /tags vinculadas/);
  catalog = putEditorialRecord(catalog, 'lessons', { ...newLesson, tagIds: [] }, guideIds).catalog;
  catalog = putEditorialRecord(catalog, 'quizzes', newQuiz, guideIds).catalog;
  assert.throws(() => putEditorialRecord(catalog, 'quizzes', { ...newQuiz, id: 'quiz-duplicado' }, guideIds), /já possui um quiz/);
  assert.throws(() => putEditorialRecord(catalog, 'quizzes', { ...newQuiz, questions: [{ ...newQuiz.questions[0], correct: 4 }] }, guideIds, newQuiz.id), /resposta correta/);
});

test('persistência local carrega e salva sem afetar o catálogo-base, validando valores armazenados', () => {
  const db = new Map();
  const storage = { getItem: (key) => db.get(key) ?? null, setItem: (key, value) => db.set(key, value), removeItem: (key) => db.delete(key) };
  const repository = createLocalEditorialRepository(storage);
  const original = repository.load();
  const altered = putEditorialRecord(original, 'tags', newTag, guideIds).catalog;
  repository.save(altered);
  assert.equal(repository.load().tags[0].name, 'Controle social');
  db.set(EDITORIAL_STORAGE_KEY, '{broken-json');
  assert.equal(repository.load().tags.length, 0);
  db.set(EDITORIAL_STORAGE_KEY, JSON.stringify({ ...altered, lessons: [{ nonsense: true }] }));
  assert.equal(repository.load().lessons.length, guides.length);
  assert.equal(normalizeEditorialCatalog(altered, original).tags.length, 1);
  repository.clear();
  assert.equal(repository.load().tags.length, 0);
});

test('identificadores de tag são normalizados para URLs e não confundem categorias editoriais', () => {
  assert.equal(toSlug('Orçamento & Transparência'), 'orcamento-transparencia');
  assert.equal(createInitialEditorialCatalog().tags.length, 0);
});
