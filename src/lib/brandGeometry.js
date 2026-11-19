
export const BRAND_ROWS = Object.freeze([1, 2, 3, 4, 3, 2, 1]);
export const BRAND_ORIGIN = Object.freeze({ x: 24, y: 20 });
export const BRAND_SPACING = 18.7;
export const BRAND_RADIUS = 6.7;
export const BRAND_CENTER = Object.freeze({ x: 52, y: 76.1 });

export const brandPoints = Object.freeze(
  BRAND_ROWS.flatMap((amount, row) =>
    Array.from({ length: amount }, (_, column) =>
      Object.freeze({
        x: Number((BRAND_ORIGIN.x + column * BRAND_SPACING).toFixed(1)),
        y: Number((BRAND_ORIGIN.y + row * BRAND_SPACING).toFixed(1)),
        key: `${row}-${column}`,
      })),
  ),
);
