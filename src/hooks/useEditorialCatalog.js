import { useCallback, useMemo, useState } from 'react';
import { guides } from '../data/content.js';
import { createInitialEditorialCatalog } from '../data/editorialSeeds.js';
import { deleteEditorialRecord, putEditorialRecord } from '../lib/editorialCatalog.js';
import { createLocalEditorialRepository } from '../repositories/localEditorialRepository.js';

const guideIds = guides.map((guide) => guide.id);

export default function useEditorialCatalog() {
  const repository = useMemo(() => createLocalEditorialRepository(
    typeof window === 'undefined' ? null : window.localStorage,
  ), []);
  const [catalog, setCatalog] = useState(() => repository.load());

  const save = useCallback((type, input, previousId = null) => {
    const result = putEditorialRecord(catalog, type, input, guideIds, previousId);
    repository.save(result.catalog);
    setCatalog(result.catalog);
    return result.record;
  }, [catalog, repository]);

  const remove = useCallback((type, id) => {
    const next = deleteEditorialRecord(catalog, type, id);
    repository.save(next);
    setCatalog(next);
  }, [catalog, repository]);

  const reset = useCallback(() => {
    repository.clear();
    setCatalog(createInitialEditorialCatalog());
  }, [repository]);

  return useMemo(() => ({ catalog, save, remove, reset }), [catalog, save, remove, reset]);
}
