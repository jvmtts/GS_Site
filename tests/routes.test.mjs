import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoute, guidePath, lessonPath, quizPath } from '../src/lib/routes.js';
import { guides } from '../src/data/content.js';

test('quatro áreas do produto e assuntos têm resolução explícita', () => {
 for (const [path, kind] of [['/home','home'],['/licoes','lessons'],['/user','user'],['/admin','admin'],['/assuntos','topics']]) {
  assert.equal(resolveRoute(path).kind, kind, path);
 }
});
test('todos os guias e lições resolvem em URLs próprias', () => {
 for (const guide of guides) {
  assert.equal(resolveRoute(guidePath(guide)).kind,'guide');
  assert.equal(resolveRoute(lessonPath(guide)).kind,'lesson');
  assert.equal(resolveRoute(quizPath(guide)).kind,'quiz');
 }
});
test('rotas inventadas ou incompletas não se confundem com conteúdo', () => {
 for (const path of ['/guia/falso','/guia/orcamento-publico/quiz','/licoes/falso/quiz','/login','/admin/usuarios']) {
  assert.equal(resolveRoute(path).kind,'not-found',path);
 }
});
