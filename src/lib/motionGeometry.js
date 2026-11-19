import { BRAND_CENTER, brandPoints } from './brandGeometry.js';

export function getDotOffsets(point, index) {
  const angle = index * 2.399963229728653 - 0.8;
  const scatterRadius = 13 + ((index * 13) % 9) * 5.5;

  const scatterX = BRAND_CENTER.x + Math.cos(angle) * scatterRadius - point.x;
  const scatterY = BRAND_CENTER.y + Math.sin(angle) * scatterRadius - point.y;
  const orbitX = BRAND_CENTER.x + (index % 4 - 1.5) * 22 - point.x;
  const orbitY = BRAND_CENTER.y + (Math.floor(index / 4) - 1.5) * 22 - point.y;

  return {
    '--scatter-x': `${scatterX.toFixed(2)}px`,
    '--scatter-y': `${scatterY.toFixed(2)}px`,
    '--orbit-x': `${orbitX.toFixed(2)}px`,
    '--orbit-y': `${orbitY.toFixed(2)}px`,
    '--dot-delay': `${(index % 4) * 17}ms`,
  };
}
