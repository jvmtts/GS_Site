import { useState } from 'react';
import { guides, topics } from '../../data/content.js';
import { toSlug } from '../../lib/editorialCatalog.js';
import { newEditorialId } from '../../lib/editorialIds.js';

export default function LessonEditor({ item, tags, onSave, onDelete, onCancel, hasQuiz }) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [slug, setSlug] = useState(item?.slug ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [body, setBody] = useState(item?.body ?? '');
  const [topicId, setTopicId] = useState(item?.topicId ?? '');
  const [guideId, setGuideId] = useState(item?.guideId ?? '');
  const [status, setStatus] = useState('published');
  const [tagIds, setTagIds] = useState(item?.tagIds ?? []);
  const [slugEdited, setSlugEdited] = useState(Boolean(item));

  function submit(event) {
    event.preventDefault();
    onSave({
      id: item?.id ?? newEditorialId('lesson'), title, slug, description, body,
      topicId, guideId: guideId || null, status, tagIds,
    });
  }

  return (
    <form className="cms-form" onSubmit={submit}>
      <div className="cms-form-heading">
        <div><span className="eyebrow">CONTEÚDO DIDÁTICO</span><h2>{item ? 'Editar lição' : 'Nova lição'}</h2></div>
        {item && <span className="cms-secondary-meta">{hasQuiz ? 'Quiz vinculado' : 'Sem quiz'}</span>}
      </div>
      <div className="cms-form-columns">
        <div className="cms-field">
          <label htmlFor="cms-lesson-title">Título <span aria-hidden="true">*</span></label>
          <input id="cms-lesson-title" required readOnly={Boolean(item)} maxLength={150} value={title} onChange={(event) => {
            setTitle(event.target.value);
            if (!slugEdited) setSlug(toSlug(event.target.value));
          }} />
        </div>
        <div className="cms-field">
          <label htmlFor="cms-lesson-slug">Endereço da lição <span aria-hidden="true">*</span></label>
          <input id="cms-lesson-slug" disabled pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100}
            value={slug} onChange={(event) => { setSlug(toSlug(event.target.value)); setSlugEdited(true); }} />
        </div>
      </div>
      <label htmlFor="cms-lesson-description">Descrição curta <span aria-hidden="true">*</span></label>
      <textarea id="cms-lesson-description" rows={3} disabled maxLength={500} value={description}
        onChange={(event) => setDescription(event.target.value)} />
      <label htmlFor="cms-lesson-body">Texto da lição (HTML) <span aria-hidden="true">*</span></label>
      <textarea id="cms-lesson-body" className="cms-body-input" required readOnly={Boolean(item)} maxLength={12000} rows={10}
        value={body} onChange={(event) => setBody(event.target.value)}
        placeholder="Ex.: <p>Uma explicação acessível.</p>" />
      <p className="cms-help">Use parágrafos, subtítulos, listas, negrito e links. Textos simples também são aceitos.</p>
      <div className="cms-form-columns">
        <div className="cms-field">
          <label htmlFor="cms-lesson-topic">Assunto <span aria-hidden="true">*</span></label>
          <select id="cms-lesson-topic" disabled value={topicId} onChange={(event) => setTopicId(event.target.value)}>
            <option value="">Sem assunto vinculado</option>
            {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
          </select>
        </div>
        <div className="cms-field">
          <label htmlFor="cms-lesson-guide">Guia relacionado</label>
          <select id="cms-lesson-guide" disabled value={guideId} onChange={(event) => setGuideId(event.target.value)}>
            <option value="">Sem guia relacionado</option>
            {guides.map((guide) => <option key={guide.id} value={guide.id}>{guide.title}</option>)}
          </select>
        </div>
      </div>
      <label htmlFor="cms-lesson-status">Visibilidade</label>
      <select id="cms-lesson-status" disabled value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="published">Visível no portal</option>
      </select>
      <p className="cms-help">A API atual permite cadastrar título e texto e alterar as tags. Os demais campos são preenchidos pelo acervo do site.</p>
      <fieldset className="cms-tag-fieldset">
        <legend>Tags associadas</legend>
        {tags.length === 0 ? <p>Cadastre uma tag na aba Tags para vinculá-la às lições.</p> : (
          <div className="cms-tag-checks">{tags.map((tag) => (
            <label key={tag.id}>
              <input type="checkbox" checked={tagIds.includes(tag.id)} onChange={(event) => setTagIds((current) =>
                event.target.checked ? [...current, tag.id] : current.filter((id) => id !== tag.id))} />
              {tag.name}
            </label>
          ))}</div>
        )}
      </fieldset>
      <div className="cms-form-actions">
        <button className="pp-button" type="submit">{item ? 'Salvar alterações' : 'Cadastrar lição'}</button>
        <button className="outline-button" type="button" onClick={onCancel}>Cancelar</button>
        {item && <button className="cms-danger" type="button" onClick={onDelete}>Excluir lição</button>}
      </div>
    </form>
  );
}
