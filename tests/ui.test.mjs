import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MOTION_TIMING } from '../src/lib/motionTiming.js';

const src = (relative) => readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8');

test('transição interna mais breve mantém a troca na fase central', () => {
  assert.equal(MOTION_TIMING.transition, 560);
  assert.equal(MOTION_TIMING.swap, MOTION_TIMING.transition / 2);
  assert(MOTION_TIMING.transition < MOTION_TIMING.splash);
});

test('movimento conserva a geometria oficial e uma cortina reduzida nos dois temas', () => {
  const css = src('src/styles/motion.css');
  const theme = src('src/styles/theme.css');
  const jsx = src('src/components/DotMotion.jsx');
  assert.match(jsx, /brandPoints\.map/);
  assert.match(css, /background: rgb\(255 255 255 \/ 90%\)/);
  assert.match(theme, /background:\s*rgb\(20 23 29 \/ 90%\)/);
  assert.match(css, /width: 102px;\s*height: 149px/);
});

test('foco pode abrir o índice sem reativar a coluna lateral permanentemente', () => {
  const guide = src('src/pages/Guide.jsx');
  const styles = src('src/styles/reader-experience.css');
  assert.match(guide, /setIndexOpen\(true\)/);
  assert.match(guide, /setIndexOpen\(false\)/);
  assert.match(styles, /data-reader-focus="on"\] \.guide-grid--index-open \.article-index/);
});

test('100% de seções visitadas tem ação manual distinta de conclusão', () => {
  const readingList = src('src/components/library/ReadingList.jsx');
  const progress = src('src/components/editorial/ReadingProgress.jsx');
  assert.match(readingList, /Marcar como lido/);
  assert.match(readingList, /onMarkRead\(guide.id, !markedRead\)/);
  assert.match(progress, /ainda não marcado como lido/);
});

test('exclusão total inclui dados editoriais e navegação tolera fragmentos inválidos', () => {
  const state = src('src/hooks/usePortalState.js');
  const user = src('src/pages/User.jsx');
  const reading = src('src/hooks/useSectionReading.js');
  assert.match(state, /removeItem\('pp-admin-drafts-v2'\)/);
  assert.match(state, /removeItem\('pp-editorial-notes'\)/);
  assert.match(user, /alterações editoriais locais/);
  assert.match(reading, /catch \{ return undefined; \}/);
});


test('painel editorial possui áreas independentes para lições, quizzes, tags e guias', () => {
  const admin = src('src/pages/Admin.jsx');
  assert.match(admin, /<LessonEditor/);
  assert.match(admin, /<QuizEditor/);
  assert.match(admin, /<TagEditor/);
  assert.match(admin, /<GuideInventory/);
  assert.match(admin, /useEditorialContent/);
  assert.doesNotMatch(admin, /Modo DEMO|Restaurar exemplo/);
});

test('rodapé não anuncia uma área administrativa pública', () => {
  const footer = src('src/components/layout/Footer.jsx');
  assert.doesNotMatch(footer, /\/admin|demo|demonstração/);
});
