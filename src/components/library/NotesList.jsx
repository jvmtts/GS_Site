import Icon from '../Icon.jsx';
import ButtonLink from '../ui/ButtonLink.jsx';
import Link from '../ui/Link.jsx';
import { countNotes } from '../../lib/readingNotes.js';

export default function NotesList({ guides, notes }) {
  if (countNotes(notes) === 0) {
    return (
      <div className="empty-state">
        <Icon name="edit" size={30} />
        <h2>Sem anotações por enquanto.</h2>
        <p>Nos guias, use o recurso “Notas” para registrar ideias em cada seção. O conteúdo é privado e local.</p>
        <ButtonLink to="/assuntos">Encontrar um guia</ButtonLink>
      </div>
    );
  }

  return (
    <div className="history-list">
      {guides.flatMap((guide) => Object.entries(notes[guide.id] ?? {}).map(([sectionId, note]) => {
        const section = guide.sections.find((item) => item.id === sectionId);
        if (!section) return null;
        return (
          <div className="history-item note-history" key={`${guide.id}-${sectionId}`}>
            <Link to={`${guide.path}#reading-notes`}>
              {section.title}<span>{guide.title}</span><small>{note}</small>
            </Link>
            <Link to={`${guide.path}#reading-notes`} className="small-quiet">Editar</Link>
          </div>
        );
      }))}
    </div>
  );
}
