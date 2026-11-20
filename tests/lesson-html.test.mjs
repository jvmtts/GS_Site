import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { toLessonHtml } from '../src/lib/lessonText.js';

const window = new JSDOM('<!doctype html><html><body></body></html>').window;
globalThis.window = window;
globalThis.DOMParser = window.DOMParser;
const { sanitizeLessonHtml, lessonPreview } = await import('../src/lib/lessonHtml.js');
const { mapApiCatalog } = await import('../src/lib/apiCatalog.js');
const { createInitialEditorialCatalog } = await import('../src/data/editorialSeeds.js');

test('textos simples e acentos continuam legíveis, com parágrafos e quebras de linha', () => {
  const html = toLessonHtml('Texto com ação & participação.\nOutra linha.\n\n2 < 3 e 5 > 4.');
  assert.equal(html, '<p>Texto com ação &amp; participação.<br>Outra linha.</p>\n<p>2 &lt; 3 e 5 &gt; 4.</p>');
  assert.equal(toLessonHtml(html), html);
  assert.equal(toLessonHtml(null), '');
});

test('HTML mantém subtítulos, listas, negrito e links seguros', () => {
  const html = '<h3>Um tema</h3><p>Uma <strong>ideia</strong> e <em>ênfase</em>.</p><ul><li>Um item</li></ul><a href="https://www.fiap.com.br/">Fonte</a>';
  const clean = sanitizeLessonHtml(html);
  assert.match(clean, /<h3>Um tema<\/h3>/);
  assert.match(clean, /<strong>ideia<\/strong>/);
  assert.match(clean, /<li>Um item<\/li>/);
  assert.match(clean, /href="https:\/\/www.fiap.com.br\/"/);
});

test('scripts, eventos, estilos, frames e links executáveis são removidos', () => {
  const clean = sanitizeLessonHtml('<p style="position:fixed" onclick="alert(1)">Texto</p><script>alert(2)</script><iframe src="https://example.com"></iframe><img src=x onerror="alert(3)"><a href="jav&#x61;script:alert(4)">Link</a><svg onload="alert(5)"></svg>');
  const document = new window.DOMParser().parseFromString(clean, 'text/html');
  assert.equal(document.querySelectorAll('script, iframe, img, svg, [onclick], [onerror], [style]').length, 0);
  assert.equal(document.querySelector('a').hasAttribute('href'), false);
  assert.equal(document.querySelector('p').textContent, 'Texto');
});

test('resumos e cartões recebem texto legível, sem tags ou entidades aparentes', () => {
  assert.equal(lessonPreview('<h3>Tema</h3><p>Direitos &amp; deveres.</p><ul><li>Participação</li></ul>'), 'Tema Direitos & deveres. Participação');
  const catalog = mapApiCatalog([{ id: 99, title: 'Nova lição', text: '<p>Direitos &amp; deveres.</p>', tags: [], quizs: [] }], []);
  assert.equal(catalog.lessons[0].description, 'Direitos & deveres.');
  assert.equal(catalog.lessons[0].body, '<p>Direitos &amp; deveres.</p>');
});

test('as 14 lições do acervo são HTML e conservam todo o texto original', async () => {
  const { guides } = await import('../src/data/content.js');
  const catalog = createInitialEditorialCatalog();
  assert.equal(catalog.lessons.length, 14);
  for (const lesson of catalog.lessons) {
    assert.match(lesson.body, /^<p>/);
    const document = new window.DOMParser().parseFromString(lesson.body, 'text/html');
    assert.equal(document.body.textContent, guides.find((guide) => guide.id === lesson.id).lessonText);
  }
});
