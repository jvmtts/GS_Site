import test from 'node:test';
import assert from 'node:assert/strict';
import { updateReadingNote, countNotes } from '../src/lib/readingNotes.js';

test('notas não sobrescrevem outros guias nem suas seções', () => {
  const a = updateReadingNote({}, 'guia-a', 'secao-1', '  Primeiro comentário  ');
  const b = updateReadingNote(a, 'guia-b', 'secao-2', 'Segundo comentário');
  const c = updateReadingNote(b, 'guia-a', 'secao-3', 'Terceiro');
  assert.equal(c['guia-a']['secao-1'], 'Primeiro comentário');
  assert.equal(c['guia-b']['secao-2'], 'Segundo comentário');
  assert.equal(countNotes(c), 3);
  assert.equal(countNotes(a), 1);
});
test('nota vazia remove somente a seção correspondente', () => {
  const seed = { guia: { s1: 'Uma', s2: 'Outra' }, outro: { s1: 'Manter' } };
  const updated = updateReadingNote(seed, 'guia', 's1', '  ');
  assert.equal(updated.guia.s1, undefined);
  assert.equal(updated.guia.s2, 'Outra');
  assert.equal(updated.outro.s1, 'Manter');
  assert.equal(seed.guia.s1, 'Uma');
});
test('notas são limitadas a 1500 caracteres', () => {
  assert.equal(updateReadingNote({}, 'g', 's', 'x'.repeat(1700)).g.s.length, 1500);
});
