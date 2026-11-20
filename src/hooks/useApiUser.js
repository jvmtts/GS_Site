import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createApiUserRepository } from '../repositories/apiUserRepository.js';

const USER_KEY = 'pp-api-user-id';

function rememberUser(id) {
  try {
    if (id) window.localStorage.setItem(USER_KEY, String(id));
    else window.localStorage.removeItem(USER_KEY);
  } catch {
    return;
  }
}

export default function useApiUser() {
  const repository = useMemo(() => createApiUserRepository(), []);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);

  const reload = useCallback(async () => {
    const records = await repository.list();
    setUsers(records);
    return records;
  }, [repository]);

  useEffect(() => {
    let active = true;
    repository.list().then((records) => {
      if (!active) return;
      setUsers(records);
      let id;
      try {
        id = window.localStorage.getItem(USER_KEY);
      } catch {
        return;
      }
      const selected = records.find((item) => String(item.id) === id);
      if (selected) setUser(selected);
      else rememberUser(null);
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
      setError(failure.message);
      throw failure;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }, []);

  const select = useCallback((id) => change(async () => {
    const selected = id ? await repository.get(id) : null;
    setUser(selected);
    rememberUser(selected?.id);
  }), [repository, change]);

  const create = useCallback((name, password) => change(async () => {
    const id = await repository.create(name.trim(), password);
    const selected = await repository.get(id);
    setUser(selected);
    rememberUser(id);
    await reload();
  }), [repository, reload, change]);

  const update = useCallback((name, password, changePassword) => change(async () => {
    if (!user) throw new Error('Selecione um cadastro.');
    await repository.update(user.id, name.trim(), password, changePassword);
    setUser(await repository.get(user.id));
    await reload();
  }), [user, repository, reload, change]);

  const remove = useCallback(() => change(async () => {
    if (!user) throw new Error('Selecione um cadastro.');
    await repository.remove(user.id);
    setUser(null);
    rememberUser(null);
    await reload();
  }), [user, repository, reload, change]);

  const subscribe = useCallback((lessonId) => change(async () => {
    if (!user) throw new Error('Selecione um cadastro em Meu espaço para se inscrever.');
    if (user.lessonsIds.includes(lessonId)) return;
    await repository.subscribe(user.id, lessonId);
    setUser(await repository.get(user.id));
  }), [user, repository, change]);

  return { users, user, loading, saving, error, select, create, update, remove, subscribe, reload };
}
