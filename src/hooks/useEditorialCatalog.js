import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createApiEditorialRepository } from '../repositories/apiEditorialRepository.js';
import { filterLessonsByTags } from '../lib/apiCatalog.js';

const EMPTY_CATALOG = { version: 1, tags: [], lessons: [], quizzes: [] };

export default function useEditorialCatalog() {
  const repository = useMemo(() => createApiEditorialRepository(), []);
  const [catalog, setCatalog] = useState(EMPTY_CATALOG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCatalog(await repository.load());
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    let active = true;
    repository.load().then((next) => {
      if (active) setCatalog(next);
    }).catch((failure) => {
      if (active) setError(failure.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [repository]);

  const change = useCallback(async (operation) => {
    if (busy.current) throw new Error('Aguarde a operação atual terminar.');
    busy.current = true;
    setSaving(true);
    setError('');
    try {
      return await operation();
    } catch (failure) {
      try {
        setCatalog(await repository.load());
      } catch {
        setError('Não foi possível atualizar o catálogo. Recarregue antes de repetir a operação.');
      }
      throw failure;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }, [repository]);

  const save = useCallback((type, input, previousId = null) => change(async () => {
    const result = await repository.save(type, input, previousId, catalog);
    setCatalog(result.catalog);
    return result.record;
  }), [catalog, repository, change]);

  const remove = useCallback((type, id) => change(async () => {
    setCatalog(await repository.remove(type, id, catalog));
  }), [catalog, repository, change]);

  const importInitial = useCallback(() => change(async () => {
    setCatalog(await repository.importInitial());
  }), [repository, change]);

  const searchTags = useCallback(async (names, signal) => {
    signal?.throwIfAborted();
    return filterLessonsByTags(catalog, names);
  }, [catalog]);

  return { catalog, loading, saving, error, reload, save, remove, importInitial, searchTags };
}
