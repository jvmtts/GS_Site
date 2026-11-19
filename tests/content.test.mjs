import test from 'node:test';
import assert from 'node:assert/strict';
import { guides, topics, questionsByGuide, getGuideById, getGuideBySlug } from '../src/data/content.js';
import { topicImages } from '../src/data/topicImages.js';

const officialHosts = ['senado.leg.br', 'camara.leg.br', 'gov.br', 'planalto.gov.br', 'stf.jus.br', 'cnj.jus.br', 'ibge.gov.br'];
test('cinco categorias, pelo menos catorze guias, sem caminhos duplicados', () => {
  assert.equal(topics.length, 5);
  assert.ok(guides.length >= 14);
  assert.equal(new Set(guides.map(g => g.id)).size, guides.length);
  assert.equal(new Set(guides.map(g => g.path)).size, guides.length);
  assert.equal(new Set(guides.map(g => g.slug)).size, guides.length);
  for (const guide of guides) {
    assert.equal(guide.path, `/guia/${guide.slug}`);
    assert.equal(getGuideBySlug(guide.slug), guide);
    assert.equal(getGuideById(guide.id), guide);
    assert.ok(topics.some(t => t.id === guide.categoryId));
    assert.ok(guide.sections.length >= 3);
    assert.ok(new Set(guide.sections.map(s => s.id)).size === guide.sections.length);
    for (const section of guide.sections) {
      assert.ok(section.title.length > 5);
      assert.ok(section.paragraphs.length >= 1);
      assert.ok(section.paragraphs.every(p => p.length >= 50));
    }
  }
});

test('fontes possuem URL oficial de consulta e identificação', () => {
  for (const guide of guides) {
    assert.ok(guide.sources.length >= 2);
    for (const ref of guide.sources) {
      const uri = new URL(ref.url);
      assert.equal(uri.protocol, 'https:');
      assert.ok(officialHosts.some(host => uri.hostname === host || uri.hostname.endsWith(`.${host}`)), uri.hostname);
      assert.ok(ref.label.length >= 10 && ref.description.length >= 20);
    }
  }
});

test('quizzes para cada guia, opções coerentes e explicações de erro', () => {
  for (const guide of guides) {
    const questions = questionsByGuide[guide.id];
    assert.ok(questions.length >= 6);
    for (const q of questions) {
      assert.ok(q.question.endsWith('?'));
      assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.answers.length);
      assert.equal(q.answers.length, 3);
      assert.equal(new Set(q.answers).size, q.answers.length);
      assert.ok(q.explanation.length > 30);
      assert.ok(q.misconception.length > 30);
    }
  }
});

test('não há números inventados de indicadores nem dados dinâmicos', () => {
  for (const guide of guides) {
    assert.ok(!/(?:\b\d{1,3}[.,]\d{3}\b|\b\d+(?:\.\d+)?%\b)/.test(guide.deck));
  }
});


test('cada categoria tem pelo menos dois guias e fotografia com licença declarada', () => {
  for (const topic of topics) {
    assert.ok(guides.filter(g => g.categoryId === topic.id).length >= 2, topic.id);
    assert.ok(topicImages[topic.id], topic.id);
    const photo = topicImages[topic.id];
    assert.match(photo.source, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(photo.url, /^https:\/\//);
    assert.ok(photo.license && photo.credit && photo.alt);
  }
});

test('há lições sobre Constituição, três Poderes, Executivo e Judiciário', () => {
  for (const id of ['constituicao', 'poderes', 'executivo', 'legislativo', 'judiciario']) {
    const guide = guides.find(g => g.id === id);
    assert.ok(guide);
    assert.ok(guide.sections.length >= 4);
    assert.ok(questionsByGuide[guide.id].length >= 6);
  }
});
