import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';

const root = process.cwd();
const failures = [];
const detail = [];
const srcRoot = join(root, 'src');

function assert(condition, label) {
  detail.push(`${condition ? 'OK' : 'FALHOU'} — ${label}`);
  if (!condition) failures.push(label);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

const sources = walk(srcRoot).filter((file) => /\.(jsx?|css)$/.test(file));
const relativeImports = [];
const publicAssets = [];

for (const file of sources) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/\bfrom\s+['"](\.[^'"]+)['"]/g)) {
    relativeImports.push({ file, target: match[1] });
  }
  for (const match of source.matchAll(/(?:src|href)="(\/(?:assets|favicon)\/[^"#]+)"/g)) {
    publicAssets.push(match[1]);
  }
  assert(!source.includes('components/Site.jsx') && !source.includes("from '../components/Site.jsx'"),
    `sem import transitório Site.jsx: ${file.replace(`${root}/`, '')}`);
}

for (const { file, target } of relativeImports) {
  const resolved = resolve(dirname(file), target);
  assert(existsSync(resolved) || existsSync(`${resolved}.jsx`) || existsSync(`${resolved}.js`),
    `import local: ${file.replace(`${root}/`, '')} → ${target}`);
}

for (const asset of new Set(publicAssets)) {
  assert(existsSync(join(root, 'public', asset.slice(1))), `asset referenciado: ${asset}`);
}

const rows = [1, 2, 3, 4, 3, 2, 1];
const names = ['icone-original', 'icone-preto-e-branco', 'icone-negativo',
  'logo-original', 'logo-preto-e-branco', 'logo-negativo'];
for (const name of names) {
  for (const format of ['svg', 'png', 'jpg']) {
    assert(existsSync(join(root, 'public', 'assets', 'logo', `${name}.${format}`)),
      `marca: ${name}.${format}`);
  }
  const svg = readFileSync(join(root, 'public', 'assets', 'logo', `${name}.svg`), 'utf8');
  const count = [...svg.matchAll(/<circle\b/g)].length;
  assert(count === (name.startsWith('icone') ? 16 : 17),
    `marca: ${name}, 16 círculos no símbolo${name.startsWith('logo') ? ' + ponto final' : ''}`);
}

for (const asset of ['favicon.svg', 'favicon.ico', 'favicon-16.png',
  'favicon-32.png', 'favicon-48.png', 'apple-touch-icon.png',
  'android-chrome-192x192.png', 'android-chrome-512x512.png', 'site.webmanifest']) {
  assert(existsSync(join(root, 'public', 'favicon', asset)), `favicon: ${asset}`);
}

const router = readFileSync(join(root, 'src', 'lib', 'routes.js'), 'utf8');
for (const route of ['/home', '/licoes', '/user', '/admin']) {
  assert(router.includes(`['${route}',`), `rota raiz declarada: ${route}`);
}

const geometry = readFileSync(join(root, 'src', 'lib', 'brandGeometry.js'), 'utf8');
assert(geometry.includes('[1, 2, 3, 4, 3, 2, 1]'), `geometria 16 pontos: ${rows.join('-')}`);
assert(!existsSync(join(root, 'src', 'components', 'Site.jsx')), 'módulo legado Site.jsx removido');

console.log(detail.join('\n'));
console.log(`\nResultado: ${detail.length - failures.length}/${detail.length} verificações estáticas.`);
if (failures.length) process.exitCode = 1;
