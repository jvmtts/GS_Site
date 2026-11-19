import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePreferences, resolveTheme, DEFAULT_PREFERENCES } from '../src/lib/readingPreferences.js';

test('tema sistema segue preferência do dispositivo', () => {
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
});
test('preferências só aceitam valores previstos', () => {
  const result = normalizePreferences({ theme: 'javascript:evil', fontSize: '1000px', spacing: '#fff', focus: 'true' });
  assert.deepEqual(result, DEFAULT_PREFERENCES);
});
test('preferência de leitura já salva é mantida sem reescrever dados', () => {
  assert.equal(normalizePreferences(null, 'large').fontSize, 'large');
  assert.equal(normalizePreferences({ theme: 'dark' }, 'large').fontSize, 'large');
});
