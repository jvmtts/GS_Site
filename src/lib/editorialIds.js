export function newEditorialId(prefix) {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  return `${prefix}-${id.toLowerCase()}`;
}
