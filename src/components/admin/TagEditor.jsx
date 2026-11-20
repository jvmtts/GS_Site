import { useState } from 'react';
import { toSlug } from '../../lib/editorialCatalog.js';
import { newEditorialId } from '../../lib/editorialIds.js';

export default function TagEditor({ item, onSave, onDelete, onCancel, lessonCount }) {
  const [name, setName] = useState(item?.name ?? '');
  const [slug, setSlug] = useState(item?.slug ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [slugEdited, setSlugEdited] = useState(Boolean(item));

  function submit(event) {
    event.preventDefault();
    onSave({ id: item?.id ?? newEditorialId('tag'), name, slug, description });
  }

  return (
    <form className="cms-form" onSubmit={submit}>
      <div className="cms-form-heading">
        <div><span className="eyebrow">TAXONOMIA</span><h2>{item ? 'Editar tag' : 'Nova tag'}</h2></div>
        {item && <span className="cms-secondary-meta">{lessonCount} lição(ões) vinculada(s)</span>}
      </div>
      <label htmlFor="cms-tag-name">Nome da tag <span aria-hidden="true">*</span></label>
      <input id="cms-tag-name" required readOnly={Boolean(item)} maxLength={80} value={name} onChange={(event) => {
        setName(event.target.value);
        if (!slugEdited) setSlug(toSlug(event.target.value));
      }} placeholder="Ex.: Controle social" />
      <label htmlFor="cms-tag-slug">Identificador da tag <span aria-hidden="true">*</span></label>
      <input id="cms-tag-slug" disabled maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*"
        value={slug} onChange={(event) => { setSlug(toSlug(event.target.value)); setSlugEdited(true); }}
        placeholder="controle-social" />
      <label htmlFor="cms-tag-description">Descrição</label>
      <textarea id="cms-tag-description" disabled maxLength={500} rows={3} value={description}
        onChange={(event) => setDescription(event.target.value)} />
      <div className="cms-form-actions">
        <button className="pp-button" type="submit" disabled={Boolean(item)}>{item ? 'Tag cadastrada' : 'Cadastrar tag'}</button>
        <button className="outline-button" type="button" onClick={onCancel}>Cancelar</button>
        {item && <button className="cms-danger" type="button" disabled={lessonCount === 0} onClick={onDelete}>Desvincular das lições</button>}
      </div>
    </form>
  );
}
