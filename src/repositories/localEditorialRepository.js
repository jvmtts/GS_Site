import { createInitialEditorialCatalog } from '../data/editorialSeeds.js';
import { normalizeEditorialCatalog } from '../lib/editorialCatalog.js';

export const EDITORIAL_STORAGE_KEY = 'pp-editorial-catalog-v1';

export function createLocalEditorialRepository(storage) {
  return {
    load() {
      const initial = createInitialEditorialCatalog();
      try {
        const raw = storage?.getItem(EDITORIAL_STORAGE_KEY);
        return raw ? normalizeEditorialCatalog(JSON.parse(raw), initial) : initial;
      } catch {
        return initial;
      }
    },
    save(catalog) {
      if (!storage) throw new Error('O armazenamento local não está disponível neste navegador.');
      try {
        storage.setItem(EDITORIAL_STORAGE_KEY, JSON.stringify(catalog));
      } catch {
        throw new Error('Não foi possível salvar. Verifique se o navegador permite armazenamento local.');
      }
    },
    clear() {
      if (!storage) throw new Error('O armazenamento local não está disponível neste navegador.');
      storage.removeItem(EDITORIAL_STORAGE_KEY);
    },
  };
}
