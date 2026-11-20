import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiClient } from '../src/repositories/apiClient.js';
import { createApiEditorialRepository } from '../src/repositories/apiEditorialRepository.js';
import { createApiUserRepository } from '../src/repositories/apiUserRepository.js';
import { filterLessonsByTags, mapApiCatalog, quizQuestionPayload } from '../src/lib/apiCatalog.js';
import { createInitialEditorialCatalog } from '../src/data/editorialSeeds.js';

const tags = [{ id: 2, tag: 'Cidadania' }];
const lessons = [{
  id: 10, title: 'Lição da API', text: 'Texto recebido do banco.', tags,
  quizs: [{ id: 40, doubt: 'Quem participa?', questionOutDtos: [
    { id: 43, text: 'Ninguém', isCorrect: false },
    { id: 41, text: 'A população', isCorrect: true },
    { id: 42, text: 'Somente uma pessoa', isCorrect: false },
  ] }],
}];

test('catálogo da API conserva relações e identifica a resposta mesmo com alternativas fora de ordem', () => {
  const catalog = mapApiCatalog(lessons, tags);
  assert.equal(catalog.lessons[0].apiId, 10);
  assert.equal(catalog.lessons[0].slug, 'licao-10');
  assert.deepEqual(catalog.lessons[0].tagIds, ['api-tag-2']);
  assert.equal(catalog.quizzes[0].lessonId, catalog.lessons[0].id);
  assert.equal(catalog.quizzes[0].questions[0].correct, 0);
  assert.equal(catalog.quizzes[0].questions[0].answers[0], 'A população');
  assert.throws(() => mapApiCatalog({}, tags), /inválido/);
});

test('importação conserva as rotas e os IDs já usados pelo histórico do acervo', () => {
  const original = createInitialEditorialCatalog().lessons[0];
  const catalog = mapApiCatalog([{ ...lessons[0], title: original.title, quizs: [] }], tags);
  assert.equal(catalog.lessons[0].id, original.id);
  assert.equal(catalog.lessons[0].slug, original.slug);
});

test('as 84 perguntas do acervo respeitam o formato e os limites da API', () => {
  const initial = createInitialEditorialCatalog();
  for (const quiz of initial.quizzes) {
    for (const question of quiz.questions) {
      const payload = quizQuestionPayload(question);
      assert.equal(payload.questions.filter((answer) => answer.isCorrect).length, 1);
    }
  }
  assert.throws(() => quizQuestionPayload({ question: 'Teste', answers: ['a', 'b'], correct: 0 }), /3 a 5/);
  assert.throws(() => quizQuestionPayload({ question: 'Teste', answers: ['a', 'A', 'b'], correct: 0 }), /diferentes/);
});

test('cliente reconhece JSON, mensagens de erro e o ID retornado pelo cadastro', async () => {
  let sent;
  const client = createApiClient('http://localhost:8080/', async (url, options) => {
    sent = { url, options };
    return new Response('Criado', { headers: { 'X-Resource-Id': '27' } });
  });
  assert.deepEqual(await client('/tag/create', { method: 'POST', body: '{"content":"Teste"}' }), { data: 'Criado', id: '27' });
  assert.equal(sent.url, 'http://localhost:8080/tag/create');
  assert.equal(sent.options.headers['Content-Type'], 'application/json');
  const failed = createApiClient('/api', async () => new Response('{"message":"Tag inválida"}', {
    status: 400, headers: { 'Content-Type': 'application/json' },
  }));
  await assert.rejects(failed('/tag/create'), /Tag inválida/);
  const offline = createApiClient('/api', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(offline('/lesson/getall'), /conectar à API/);
  const unavailable = createApiClient('/api', async () => new Response('', { status: 502 }));
  await assert.rejects(unavailable('/lesson/getall'), /API está indisponível/);
});

test('filtro usa os vínculos da API e combina tags sem duplicar lições', () => {
  const constitution = { id: 3, tag: 'Constituição' };
  const catalog = mapApiCatalog([
    ...lessons,
    { id: 11, title: 'Constituição', text: 'Texto', tags: [constitution], quizs: [] },
    { id: 12, title: 'Duas tags', text: 'Texto', tags: [...tags, constitution], quizs: [] },
    { id: 13, title: 'Sem tag', text: 'Texto', tags: [], quizs: [] },
  ], [...tags, constitution]);
  assert.deepEqual(filterLessonsByTags(catalog, ['Cidadania']).map((lesson) => lesson.apiId), [10, 12]);
  assert.deepEqual(filterLessonsByTags(catalog, ['Constituição']).map((lesson) => lesson.apiId), [11, 12]);
  assert.deepEqual(filterLessonsByTags(catalog, ['Cidadania', 'Constituição']).map((lesson) => lesson.apiId), [10, 11, 12]);
  assert.deepEqual(filterLessonsByTags(catalog, []).map((lesson) => lesson.apiId), [10, 11, 12, 13]);
});

test('tag sem correspondência retorna vazio e rascunhos ficam fora do filtro', () => {
  const catalog = mapApiCatalog(lessons, [...tags, { id: 9, tag: 'Sem lições' }]);
  assert.deepEqual(filterLessonsByTags(catalog, ['Sem lições']), []);
  assert.deepEqual(filterLessonsByTags(catalog, ['Inexistente']), []);
  catalog.lessons[0].status = 'draft';
  assert.deepEqual(filterLessonsByTags(catalog, ['Cidadania']), []);
  assert.deepEqual(filterLessonsByTags(catalog, []), []);
});

test('retirar tag mantém as outras tags e não chama exclusão global', async () => {
  const otherTag = { id: 3, tag: 'Direitos' };
  const catalog = mapApiCatalog([{ ...lessons[0], tags: [...tags, otherTag] }], [...tags, otherTag]);
  const calls = [];
  const repository = createApiEditorialRepository(async (path, options = {}) => {
    calls.push({ path, options });
    return { data: path.startsWith('/tag') ? [...tags, otherTag] : lessons };
  });
  await repository.remove('tags', 'api-tag-2', catalog);
  const write = calls.find((call) => call.options.method === 'PUT');
  assert.equal(write.path, '/lesson/put_tag/lessonId=10');
  assert.deepEqual(JSON.parse(write.options.body), [3]);
  assert(!calls.some((call) => call.options.method === 'DELETE'));
});

test('cadastro e inscrição de usuário utilizam os endpoints do backend', async () => {
  const calls = [];
  const repository = createApiUserRepository(async (path, options = {}) => {
    calls.push({ path, options });
    return { data: 'Criado', id: '6' };
  });
  assert.equal(await repository.create('Cadastro de teste', 'senha-simulada'), '6');
  await repository.subscribe(6, 10);
  assert.equal(calls[1].path, '/user/update/6/lesson/10');
  assert.equal(calls[1].options.method, 'PUT');
});

test('repetir a importação de uma pergunta não duplica alternativas que a API devolveu em outra ordem', async () => {
  const catalog = mapApiCatalog(lessons, tags);
  const calls = [];
  const repository = createApiEditorialRepository(async (path, options = {}) => {
    calls.push({ path, options });
    return { data: path.startsWith('/tag') ? tags : lessons };
  });
  await repository.save('quizzes', {
    lessonId: catalog.lessons[0].id,
    questions: [{ id: catalog.quizzes[0].questions[0].id, question: 'Quem participa?',
      answers: ['Ninguém', 'Somente uma pessoa', 'A população'], correct: 2 }],
  }, catalog.quizzes[0].id, catalog);
  assert(!calls.some((call) => call.options.method));
});
