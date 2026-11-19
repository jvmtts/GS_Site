import { useMemo, useState } from 'react';
import Link from '../ui/Link.jsx';
import { guides, topics } from '../../data/content.js';
import usePersistentState from '../../hooks/usePersistentState.js';

export default function GuideInventory() {
  const [search, setSearch] = useState('');
  const [topicId, setTopicId] = useState('all');
  const [selectedId, setSelectedId] = useState(guides[0]?.id ?? '');
  const [notes, setNotes] = usePersistentState('editorial-notes', {});
  const selected = guides.find((guide) => guide.id === selectedId);
  const visible = useMemo(() => guides.filter((guide) => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return (topicId === 'all' || guide.categoryId === topicId) &&
      (!term || `${guide.title} ${guide.description}`.toLocaleLowerCase('pt-BR').includes(term));
  }), [search, topicId]);

  return (
    <div className="cms-workspace">
      <section className="cms-list" aria-labelledby="cms-guides-title">
        <h2 id="cms-guides-title">Guias existentes</h2>
        <p>Os guias completos são gerenciados no acervo de código nesta etapa.</p>
        <label htmlFor="cms-guides-search" className="sr-only">Buscar guias</label>
        <input id="cms-guides-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar guia" />
        <label htmlFor="cms-guides-topic" className="sr-only">Filtrar guias por assunto</label>
        <select id="cms-guides-topic" value={topicId} onChange={(event) => setTopicId(event.target.value)}>
          <option value="all">Todos os assuntos</option>
          {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
        </select>
        <div className="cms-list-records">
          {visible.map((guide) => (
            <button type="button" aria-pressed={guide.id === selectedId} key={guide.id}
              onClick={() => setSelectedId(guide.id)}><strong>{guide.title}</strong><span>{guide.category}</span></button>
          ))}
          {visible.length === 0 && <p className="cms-empty">Nenhum guia encontrado.</p>}
        </div>
      </section>
      <section className="cms-editor" aria-label="Detalhes do guia">
        {selected ? <>
          <span className="eyebrow">ACERVO DE REFERÊNCIA</span>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
          <div className="admin-row"><span>Seções</span><strong>{selected.sections.length}</strong></div>
          <div className="admin-row"><span>Fontes oficiais</span><strong>{selected.sources.length}</strong></div>
          <Link to={selected.path} className="admin-guide-link">Abrir guia no portal</Link>
          <label htmlFor="cms-guide-note">Observações de revisão</label>
          <textarea id="cms-guide-note" rows={7} maxLength={2000} value={notes[selected.id] ?? ''}
            onChange={(event) => setNotes((current) => ({ ...current, [selected.id]: event.target.value }))} />
          <p className="cms-help">As observações ficam neste navegador e não modificam o texto do guia.</p>
        </> : <p className="cms-empty">Selecione um guia.</p>}
      </section>
    </div>
  );
}
