import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeQuizResult, normalizeDisplayName } from '../src/lib/learningProgress.js';

test('registra a primeira revisão com total e pontuação reais', () => {
  assert.deepEqual(mergeQuizResult({}, 'executivo', 4, 6, '2026-11-17T00:00:00Z'), {
    executivo: { best: 4, latest: 4, total: 6, attempts: 1, lastCompletedAt: '2026-11-17T00:00:00Z' },
  });
});

test('mantém melhor resultado e número de tentativas ao repetir', () => {
  const first = mergeQuizResult({}, 'executivo', 5, 6, 'data1');
  const second = mergeQuizResult(first, 'executivo', 3, 6, 'data2');
  assert.equal(second.executivo.best, 5);
  assert.equal(second.executivo.latest, 3);
  assert.equal(second.executivo.attempts, 2);
});

test('não compara pontuações de quizzes de tamanhos diferentes', () => {
  const first = mergeQuizResult({}, 'executivo', 3, 3, 'data1');
  const second = mergeQuizResult(first, 'executivo', 2, 6, 'data2');
  assert.equal(second.executivo.best, 2);
  assert.equal(second.executivo.total, 6);
});

test('recusa pontuações inválidas e normaliza o apelido local', () => {
  const original = { a: { best: 1 } };
  assert.equal(mergeQuizResult(original, 'a', 11, 6, 'data'), original);
  assert.equal(normalizeDisplayName('  Ana   Silva  '), 'Ana Silva');
  assert.equal(normalizeDisplayName('Z'.repeat(100)).length, 40);
});
