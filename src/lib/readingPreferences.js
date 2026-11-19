
export const DEFAULT_PREFERENCES = Object.freeze({
  theme: 'system', fontSize: 'normal', spacing: 'comfortable', focus: false,
});

export function normalizePreferences(input, legacyReadingMode = 'normal') {
  const raw = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return {
    theme: ['system', 'light', 'dark'].includes(raw.theme) ? raw.theme : 'system',
    fontSize: ['normal', 'large'].includes(raw.fontSize)
      ? raw.fontSize : legacyReadingMode === 'large' ? 'large' : 'normal',
    spacing: ['standard', 'comfortable'].includes(raw.spacing) ? raw.spacing : 'comfortable',
    focus: raw.focus === true,
  };
}

export function resolveTheme(selection, prefersDark) {
  return selection === 'light' || selection === 'dark'
    ? selection : prefersDark ? 'dark' : 'light';
}
