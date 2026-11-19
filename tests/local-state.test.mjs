import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLocalValue } from '../src/lib/localState.js';

test('salvos e histórico legados são preservados; valores incompatíveis são descartados', () => {
  assert.deepEqual(normalizeLocalValue('saved-guides', ['orcamento', 3, 'poderes'], []), ['orcamento', 'poderes']);
  assert.deepEqual(normalizeLocalValue('history', { broken: true }, []), []);
});

test('resultados de quiz válidos são preservados e entradas corrompidas ignoradas', () => {
  const intact = { total: 6, best: 5, latest: 4, attempts: 2, lastCompletedAt: '2026-11-17' };
  assert.deepEqual(normalizeLocalValue('quiz-results', { poderes: intact, bad: null }, {}), { poderes: intact });
});

test('progresso legível preserva seção e leitura manual, sem converter dados inválidos em avanço', () => {
  const normalized = normalizeLocalValue('reading-progress', {
    poderes: { visited: ['origem', null, 'competencias'], lastSectionId: 'competencias', markedReadAt: '2026-11-17' },
    falho: 'broken',
  }, {});
  assert.deepEqual(normalized.poderes.visited, ['origem', 'competencias']);
  assert.equal(normalized.poderes.markedReadAt, '2026-11-17');
  assert.equal(normalized.falho, undefined);
});

test('anotações incompatíveis não derrubam a tela nem apagam notas válidas', () => {
  const normalized = normalizeLocalValue('reading-notes', { poderes: { introducao: 'Guarde esta ideia', outra: null }, ruim: true }, {});
  assert.deepEqual(normalized, { poderes: { introducao: 'Guarde esta ideia' } });
});

test('preferências e perfil local retornam a formato conhecido quando necessário', () => {
  assert.deepEqual(normalizeLocalValue('local-profile', 3, { name: '', readingMode: 'normal' }), { name: '', readingMode: 'normal' });
  assert.deepEqual(normalizeLocalValue('local-profile', { name: 'Leitora', readingMode: 'large' }, {}), { name: 'Leitora', readingMode: 'large' });
  assert.equal(normalizeLocalValue('reader-preferences', null, null), null);
});

test('observações editoriais preservam apenas texto e limitam o tamanho', () => {
  const normalized = normalizeLocalValue('editorial-notes', {
    orcamento: 'Conferir referência',
    camara: 'a'.repeat(3000),
    invalida: { text: 'não permitido' },
  }, {});
  assert.equal(normalized.orcamento, 'Conferir referência');
  assert.equal(normalized.camara.length, 2000);
  assert.equal(normalized.invalida, undefined);
});
