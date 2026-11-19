import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BRAND_ROWS, BRAND_RADIUS, brandPoints } from '../src/lib/brandGeometry.js';
import { getDotOffsets } from '../src/lib/motionGeometry.js';
import { MOTION_TIMING } from '../src/lib/motionTiming.js';

const source = (name) => readFileSync(new URL(name, import.meta.url), 'utf8');

const expectedCoordinates = [
  [24, 20],
  [24, 38.7], [42.7, 38.7],
  [24, 57.4], [42.7, 57.4], [61.4, 57.4],
  [24, 76.1], [42.7, 76.1], [61.4, 76.1], [80.1, 76.1],
  [24, 94.8], [42.7, 94.8], [61.4, 94.8],
  [24, 113.5], [42.7, 113.5],
  [24, 132.2],
];

test('símbolo possui exatamente 16 círculos em 1-2-3-4-3-2-1', () => {
  assert.deepEqual(BRAND_ROWS, [1, 2, 3, 4, 3, 2, 1]);
  assert.equal(brandPoints.length, 16);
  assert.equal(BRAND_RADIUS, 6.7);
  assert.deepEqual(brandPoints.map(({ x, y }) => [x, y]), expectedCoordinates);
  assert.equal(new Set(brandPoints.map((point) => point.key)).size, 16);
});

test('coordenadas são as mesmas do SVG oficial, não aproximação', () => {
  const svg = source('../public/assets/simbolo.svg');
  const pairs = [...svg.matchAll(/<circle\s+cx="([0-9.]+)"\s+cy="([0-9.]+)"\s+r="([0-9.]+)"/g)];
  assert.equal(pairs.length, 16);
  assert.deepEqual(pairs.map((match) => [Number(match[1]), Number(match[2])]), expectedCoordinates);
  assert(pairs.every((match) => Number(match[3]) === BRAND_RADIUS));
});

test('todos os deslocamentos são finitos e retornam à mesma posição final', () => {
  const startLocations = new Set();
  brandPoints.forEach((point, index) => {
    const offsets = getDotOffsets(point, index);
    for (const key of ['--scatter-x', '--scatter-y', '--orbit-x', '--orbit-y']) {
      assert.match(offsets[key], /^-?\d+\.\d{2}px$/);
      assert(Number.isFinite(Number.parseFloat(offsets[key])));
    }
    const sx = point.x + Number.parseFloat(offsets['--scatter-x']);
    const sy = point.y + Number.parseFloat(offsets['--scatter-y']);
    startLocations.add(`${sx.toFixed(1)}:${sy.toFixed(1)}`);
  });
  assert.equal(startLocations.size, 16);
});

test('a troca ocorre sob a cortina opaca e não após a transição', () => {
  assert(MOTION_TIMING.swap > MOTION_TIMING.transition * 0.38);
  assert(MOTION_TIMING.swap < MOTION_TIMING.transition * 0.64);
  assert(MOTION_TIMING.transition < MOTION_TIMING.splash);
});

test('o wordmark do splash tem um único ponto azul, separado dos 16 do símbolo', () => {
  const svg = source('../public/assets/splash-wordmark.svg');
  assert.equal((svg.match(/<circle\s/g) || []).length, 1);
  assert.match(svg, /fill="#2447F5"/);
});

test('a animação admite saída por animationend e redução de movimento', () => {
  const jsx = source('../src/components/DotMotion.jsx');
  const css = source('../src/styles/motion.css');
  const navigation = source('../src/hooks/useAnimatedNavigation.js');
  assert.match(jsx, /event\.target === event\.currentTarget/);
  assert.match(jsx, /brandPoints\.map/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /transition-orbit/);
  assert.match(css, /transition-dot/);
  assert.match(navigation, /handlePopState/);
  assert.match(navigation, /fallbackGrace/);
});
