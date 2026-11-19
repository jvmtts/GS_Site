import { useMemo, useState } from 'react';
import PageHead from '../components/ui/PageHead.jsx';
import GuideInventory from '../components/admin/GuideInventory.jsx';
import LessonEditor from '../components/admin/LessonEditor.jsx';
import QuizEditor from '../components/admin/QuizEditor.jsx';
import TagEditor from '../components/admin/TagEditor.jsx';
import { useEditorialContent } from '../app/EditorialContext.jsx';
import { guides } from '../data/content.js';
import { createInitialEditorialCatalog } from '../data/editorialSeeds.js';

const sections = [
  { id: 'lessons', label: 'Lições', singular: 'lição' },
  { id: 'quizzes', label: 'Quizzes', singular: 'quiz' },
  { id: 'tags', label: 'Tags', singular: 'tag' },
  { id: 'guides', label: 'Guias', singular: 'guia' },
];

export default function Admin() {
  const { catalog, save, remove, reset } = useEditorialContent();
  const [section, setSection] = useState('lessons');
  const [selectedId, setSelectedId] = useState(catalog.lessons[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const currentSection = sections.find((item) => item.id === section);
  const records = section === 'guides' ? [] : catalog[section];
  const selected = records.find((item) => item.id === selectedId) ?? null;
  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return records.filter((record) => !term ||
      `${record.title ?? record.name} ${record.description ?? ''}`.toLocaleLowerCase('pt-BR').includes(term));
  }, [records, search]);
  const questionCount = catalog.quizzes.reduce((count, quiz) => count + quiz.questions.length, 0);

  function switchSection(next) {
    setSection(next);
    setSelectedId(next === 'guides' ? null : catalog[next][0]?.id ?? null);
    setCreating(false);
    setSearch('');
    setNotice('');
    setError('');
  }

  function persist(payload) {
    try {
      const saved = save(section, payload, creating ? null : selected.id);
      setCreating(false);
      setSelectedId(saved.id);
      setError('');
      setNotice(`${currentSection.singular === 'quiz' ? 'Quiz' : currentSection.singular === 'tag' ? 'Tag' : 'Lição'} salvo(a) neste navegador.`);
    } catch (failure) {
      setError(failure.message);
      setNotice('');
    }
  }

  function discard() {
    setCreating(false);
    setSelectedId(records[0]?.id ?? null);
    setError('');
  }

  function deleteSelected() {
    if (!selected) return;
    const related = section === 'lessons'
      ? ' O quiz vinculado também será excluído.'
      : section === 'tags' ? ' A tag será desvinculada das lições.' : '';
    if (!window.confirm(`Excluir ${currentSection.singular} "${selected.title ?? selected.name}"?${related} Esta operação afeta os dados deste navegador.`)) return;
    try {
      remove(section, selected.id);
      setSelectedId(records.find((item) => item.id !== selected.id)?.id ?? null);
      setError('');
      setNotice('Registro excluído do catálogo deste navegador.');
    } catch (failure) {
      setError(failure.message);
    }
  }

  function exportCatalog() {
    const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ponto-publico-catalogo-editorial.json';
    document.body.append(link);
    link.click();
    link.remove();
    window.requestAnimationFrame(() => URL.revokeObjectURL(url));
    setError('');
    setNotice('Exportação JSON solicitada ao navegador. Nenhum dado foi enviado a um servidor.');
  }

  function restoreCatalog() {
    if (!window.confirm('Restaurar as 14 lições e os 14 quizzes originais? Todas as edições, exclusões e tags locais serão perdidas.')) return;
    try {
      reset();
      setSection('lessons');
      setSelectedId(createInitialEditorialCatalog().lessons[0]?.id ?? null);
      setCreating(false);
      setSearch('');
      setError('');
      setNotice('Catálogo inicial restaurado neste navegador.');
    } catch (failure) {
      setError(failure.message);
    }
  }

  function editor() {
    if (!creating && !selected) return <div className="cms-empty-editor"><h2>Nenhum registro selecionado.</h2><p>Escolha um item da lista ou cadastre um novo.</p></div>;
    const props = { onSave: persist, onDelete: deleteSelected, onCancel: discard };
    if (section === 'tags') return <TagEditor key={creating ? 'new-tag' : selected.id} item={creating ? null : selected}
      lessonCount={catalog.lessons.filter((lesson) => lesson.tagIds.includes(selected?.id)).length} {...props} />;
    if (section === 'quizzes') return <QuizEditor key={creating ? 'new-quiz' : selected.id}
      item={creating ? null : selected} lessons={catalog.lessons} quizzes={catalog.quizzes} {...props} />;
    return <LessonEditor key={creating ? 'new-lesson' : selected.id} item={creating ? null : selected}
      tags={catalog.tags} hasQuiz={catalog.quizzes.some((quiz) => quiz.lessonId === selected?.id)} {...props} />;
  }

  return (
    <div className="shell admin-page cms-page">
      <PageHead
        eyebrow="GESTÃO EDITORIAL"
        title="Painel de conteúdo."
        description="Cadastre, revise e organize lições, quizzes e tags. As alterações ficam neste navegador e já aparecem nas páginas locais do portal."
      />
      <div className="cms-warning" role="note">
        <strong>Ambiente local, sem autenticação ou API.</strong>
        <span>Esta rota não protege dados por usuário e não publica mudanças em servidor. Antes de disponibilizá-la na internet, é necessário implementar controle de acesso e persistência remota.</span>
      </div>
      <div className="admin-stats" aria-label="Resumo do conteúdo">
        <div><strong>{guides.length}</strong><span>guias-base</span></div>
        <div><strong>{catalog.lessons.length}</strong><span>lições</span></div>
        <div><strong>{catalog.quizzes.length}</strong><span>quizzes</span></div>
        <div><strong>{questionCount}</strong><span>perguntas</span></div>
        <div><strong>{catalog.tags.length}</strong><span>tags</span></div>
      </div>
      <nav className="cms-nav" aria-label="Áreas de gestão de conteúdo">
        {sections.map((item) => (
          <button key={item.id} type="button" aria-pressed={section === item.id}
            onClick={() => switchSection(item.id)}>
            {item.label}<span>{item.id === 'guides' ? guides.length : catalog[item.id].length}</span>
          </button>
        ))}
      </nav>
      {notice && <p className="cms-notice" role="status">{notice}</p>}
      {error && <p className="cms-error" role="alert">{error}</p>}
      {section === 'guides' ? <GuideInventory /> : (
        <div className="cms-workspace">
          <section className="cms-list" aria-label={`Lista de ${currentSection.label.toLowerCase()}`}>
            <div className="cms-list-title">
              <h2>{currentSection.label}</h2>
              <button className="cms-create" type="button" onClick={() => {
                setCreating(true); setSelectedId(null); setError(''); setNotice('');
              }}>+ Novo</button>
            </div>
            <label htmlFor="cms-search" className="sr-only">Buscar {currentSection.label.toLowerCase()}</label>
            <input type="search" id="cms-search" value={search} onChange={(event) => setSearch(event.target.value)}
              placeholder={`Buscar ${currentSection.label.toLowerCase()}`} />
            <div className="cms-list-records">
              {visible.map((record) => (
                <button type="button" key={record.id} aria-pressed={!creating && record.id === selectedId}
                  onClick={() => { setSelectedId(record.id); setCreating(false); setError(''); setNotice(''); }}>
                  <strong>{record.title ?? record.name}</strong>
                  <span>{section === 'quizzes'
                    ? `${record.questions.length} pergunta(s) · ${catalog.lessons.find((lesson) => lesson.id === record.lessonId)?.title ?? 'Lição removida'}`
                    : section === 'lessons' ? (record.status === 'published' ? 'Visível no portal' : 'Rascunho') : record.slug}</span>
                </button>
              ))}
              {visible.length === 0 && <p className="cms-empty">Nenhum registro encontrado.</p>}
            </div>
          </section>
          <section className="cms-editor" aria-label={`Formulário de ${currentSection.singular}`}>
            {editor()}
          </section>
        </div>
      )}
      <div className="cms-maintenance" aria-label="Portabilidade do catálogo editorial">
        <div><h2>Portabilidade dos dados</h2><p>Exporte as edições em JSON para revisão e futura importação por uma API. Restaurar o catálogo desfaz todas as alterações editoriais locais.</p></div>
        <button type="button" className="outline-button" onClick={exportCatalog}>Exportar catálogo (JSON)</button>
        <button type="button" className="cms-danger" onClick={restoreCatalog}>Restaurar catálogo inicial</button>
      </div>
      <p className="cms-footnote">As alterações de lições, quizzes e tags permanecem no armazenamento local deste navegador. Os guias-base e as fontes oficiais continuam definidos no código, até a integração com o serviço de conteúdo.</p>
    </div>
  );
}
