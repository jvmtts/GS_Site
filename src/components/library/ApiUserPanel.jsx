import { useEffect, useState } from 'react';
import Link from '../ui/Link.jsx';

export default function ApiUserPanel({ account, lessons }) {
  const [name, setName] = useState(account.user?.name ?? '');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setName(account.user?.name ?? '');
    setPassword('');
  }, [account.user?.id, account.user?.name]);

  async function act(operation, message) {
    setNotice('');
    try {
      await operation();
      setPassword('');
      setNotice(message);
    } catch {
      setNotice('');
    }
  }

  function submit(event) {
    event.preventDefault();
    if (account.user) act(() => account.update(name, '', false), 'Nome atualizado.');
    else act(() => account.create(name, password), 'Cadastro criado.');
  }

  return (
    <details className="local-data-details">
      <summary>Cadastro e inscrições</summary>
      <p>Este cadastro permite acompanhar inscrições. A API atual não possui login.</p>
      {account.loading ? <p role="status">Carregando cadastros…</p> : (
        <>
          <label htmlFor="api-user">Selecionar cadastro</label>
          <select id="api-user" value={account.user?.id ?? ''} disabled={account.saving}
            onChange={(event) => act(() => account.select(event.target.value), 'Cadastro selecionado.')}>
            <option value="">Novo cadastro</option>
            {account.users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
          <form className="cms-form" onSubmit={submit}>
            <fieldset disabled={account.saving}>
              <label htmlFor="api-user-name">Nome</label>
              <input id="api-user-name" required maxLength={80} value={name}
                onChange={(event) => setName(event.target.value)} autoComplete="nickname" />
              {!account.user && <>
                <label htmlFor="api-user-password">Senha do cadastro</label>
                <input id="api-user-password" type="password" required minLength={6} autoComplete="new-password"
                  value={password} onChange={(event) => setPassword(event.target.value)} />
              </>}
              <button className="outline-button" type="submit">{account.user ? 'Atualizar nome' : 'Criar cadastro'}</button>
            </fieldset>
          </form>
          {account.user && <>
            <label htmlFor="api-new-password">Nova senha</label>
            <input id="api-new-password" type="password" minLength={6} autoComplete="new-password"
              disabled={account.saving} value={password} onChange={(event) => setPassword(event.target.value)} />
            <button className="small-quiet" type="button" disabled={account.saving || password.length < 6}
              onClick={() => act(() => account.update(account.user.name, password, true), 'Senha atualizada.')}>
              Atualizar senha
            </button>
            <p>Inscrições de {account.user.name}</p>
            {lessons.filter((lesson) => account.user.lessonsIds.includes(lesson.apiId)).map((lesson) => (
              <p key={lesson.id}><Link to={`/licoes/${lesson.slug}`}>{lesson.title}</Link></p>
            ))}
            {account.user.lessonsIds.length === 0 && <p>Nenhuma inscrição registrada.</p>}
            <button className="small-quiet user-danger" type="button" disabled={account.saving} onClick={() => {
              if (window.confirm(`Excluir o cadastro de "${account.user.name}" e suas inscrições?`)) {
                act(account.remove, 'Cadastro excluído.');
              }
            }}>Excluir cadastro</button>
          </>}
        </>
      )}
      {account.error && <p className="cms-error" role="alert">{account.error}</p>}
      {notice && <p className="profile-notice" role="status">{notice}</p>}
    </details>
  );
}
