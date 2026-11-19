import test from 'node:test';
import assert from 'node:assert/strict';
import { guides } from '../src/data/content.js';
import { splitDestination } from '../src/lib/paths.js';
import { resolveRoute } from '../src/lib/routes.js';
import {
  listReadingActivity, removeGuideReading, resumePath, sectionIdsOf,
  setGuideRead, summarizeReading, visitReadingSection,
} from '../src/lib/readingProgress.js';

const guide = guides.find((item) => item.id === 'constituicao');
const other = guides.find((item) => item.id === 'executivo');
const sectionIds = sectionIdsOf(guide);

test('mantém os 14 guias e seções originais sem IDs duplicados dentro de um guia', () => {
  assert.equal(guides.length, 14);
  for (const item of guides) {
    assert.ok(sectionIdsOf(item).length >= 2, `${item.id} sem seções`);
    assert.equal(new Set(sectionIdsOf(item)).size, sectionIdsOf(item).length);
  }
});

test('abrir um guia não marca automaticamente seções como visitadas', () => {
  const initial = summarizeReading(guide, null);
  assert.equal(initial.started, false);
  assert.equal(initial.count, 0);
  assert.equal(initial.percent, 0);
  assert.equal(initial.markedRead, false);
  assert.equal(resumePath(guide, null), guide.path);
});

test('registra só seção válida e mantém ordem única de visitas', () => {
  let state = {};
  state = visitReadingSection(state, guide, sectionIds[0], '2026-11-17T10:00:00Z');
  state = visitReadingSection(state, guide, sectionIds[1], '2026-11-17T10:01:00Z');
  state = visitReadingSection(state, guide, sectionIds[1], '2026-11-17T10:02:00Z');
  assert.equal(state[guide.id].visited.length, 2);
  assert.equal(state[guide.id].lastSectionId, sectionIds[1]);
  assert.equal(state[guide.id].lastReadAt, '2026-11-17T10:02:00Z');
  const unchanged = visitReadingSection(state, guide, 'secao-inexistente', 'data');
  assert.equal(unchanged, state);
});

test('retomada aponta para a última seção realmente registrada', () => {
  const state = visitReadingSection({}, guide, sectionIds[2], 'data');
  const resume = resumePath(guide, state[guide.id]);
  assert.equal(resume, `${guide.path}#${sectionIds[2]}`);
  assert.equal(summarizeReading(guide, state[guide.id]).lastSectionTitle,
    guide.sections.find((section) => section.id === sectionIds[2]).title);
});

test('progresso não vira conclusão automática nem altera resultados dos quizzes', () => {
  let state = {};
  for (const sectionId of sectionIds) {
    state = visitReadingSection(state, guide, sectionId, 'data');
  }
  const completeVisited = summarizeReading(guide, state[guide.id]);
  assert.equal(completeVisited.allVisited, true);
  assert.equal(completeVisited.percent, 100);
  assert.equal(completeVisited.markedRead, false);
  assert.equal(Object.hasOwn(state, 'quizResults'), false);
});

test('marca como lido apenas após visitar todas as seções e admite desfazer', () => {
  const partial = visitReadingSection({}, guide, sectionIds[0], 'data');
  assert.equal(setGuideRead(partial, guide, true, 'data'), partial);
  let all = partial;
  for (const sectionId of sectionIds.slice(1)) {
    all = visitReadingSection(all, guide, sectionId, 'data');
  }
  const marked = setGuideRead(all, guide, true, '2026-11-17T10:00:00Z');
  assert.equal(summarizeReading(guide, marked[guide.id]).markedRead, true);
  const unmarked = setGuideRead(marked, guide, false, 'data');
  assert.equal(summarizeReading(guide, unmarked[guide.id]).markedRead, false);
  assert.equal(summarizeReading(guide, unmarked[guide.id]).count, sectionIds.length);
});

test('não inclui seções removidas ou artificiais no progresso', () => {
  const model = {
    visited: [sectionIds[0], 'forjada', sectionIds[0]],
    lastSectionId: 'forjada',
    lastReadAt: '2026-11-17',
  };
  const summary = summarizeReading(guide, model);
  assert.equal(summary.count, 1);
  assert.equal(summary.lastSectionId, sectionIds[0]);
  assert.ok(summary.percent > 0 && summary.percent < 100);
});

test('não apaga os registros de outros guias ao remover um progresso', () => {
  let state = visitReadingSection({}, guide, sectionIds[0], '2026-11-17T10:00:00Z');
  state = visitReadingSection(state, other, sectionIdsOf(other)[0], '2026-11-17T11:00:00Z');
  assert.equal(listReadingActivity(guides, state)[0].guide.id, other.id);
  const remaining = removeGuideReading(state, guide.id);
  assert.equal(Object.hasOwn(remaining, guide.id), false);
  assert.ok(remaining[other.id]);
});

test('tolera dados locais incompletos ou inválidos sem inventar progresso', () => {
  assert.equal(summarizeReading(guide, 'quebrado').count, 0);
  assert.equal(summarizeReading(guide, { visited: 'tudo', markedReadAt: 2 }).count, 0);
  assert.equal(listReadingActivity(guides, {}).length, 0);
});


test('links de retomada preservam rotas de guia válidas e fragmentos existentes', () => {
  for (const currentGuide of guides) {
    const firstSection = sectionIdsOf(currentGuide)[0];
    const progress = visitReadingSection({}, currentGuide, firstSection, '2026-11-17T12:00:00Z');
    const url = resumePath(currentGuide, progress[currentGuide.id]);
    const { pathname, fragment } = splitDestination(url);
    assert.equal(resolveRoute(pathname).kind, 'guide');
    assert.equal(fragment, firstSection);
  }
});
