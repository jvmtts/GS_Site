import Icon from '../Icon.jsx';
import { ReadingProgressBar } from '../editorial/ReadingProgress.jsx';
import ButtonLink from '../ui/ButtonLink.jsx';
import Link from '../ui/Link.jsx';
import { resumePath } from '../../lib/readingProgress.js';

export default function ReadingList({ items, progress, onMarkRead }) {
  if (items.length === 0) {
    return (
      <div className="empty-state reading-empty">
        <Icon name="book" size={30} />
        <h2>Sua biblioteca começa com uma leitura.</h2>
        <p>Ao permanecer em uma seção de um guia, ela será registrada como visitada. Você poderá voltar exatamente a esse trecho.</p>
        <ButtonLink to="/assuntos">Explorar assuntos</ButtonLink>
      </div>
    );
  }

  return (
    <div className="reading-activity-list">
      <p className="reading-activity-intro">Seções visitadas, não notas ou etapas obrigatórias. A marcação “lido” é sempre manual.</p>
      {items.map(({ guide, count, total, percent, allVisited, markedRead, lastSectionTitle, lastSectionId }) => (
        <article className="reading-activity-item" key={guide.id}>
          <div className="reading-activity-heading">
            <span className="eyebrow">{guide.category}</span>
            {markedRead && <span className="reading-finished-label">✓ Marcado como lido</span>}
          </div>
          <h2><Link to={guide.path}>{guide.title}</Link></h2>
          <div className="reading-activity-count">
            <span>{count} de {total} seções visitadas</span>
            <strong>{percent}%</strong>
          </div>
          <ReadingProgressBar count={count} total={total} percent={percent} compact />
          <p className="reading-activity-place">
            {lastSectionId ? `Último trecho: ${lastSectionTitle}` : 'Sem seção registrada.'}
          </p>
          {allVisited && !markedRead && (
            <p className="reading-activity-complete">Todas as seções foram visitadas, mas o guia ainda não foi marcado como lido.</p>
          )}
          <div className="reading-activity-actions">
            <Link to={markedRead ? guide.path : resumePath(guide, progress[guide.id])} className="reading-activity-link">
              {markedRead ? 'Abrir guia' : 'Retomar leitura'} <span aria-hidden="true">↗</span>
            </Link>
            {allVisited && (
              <button type="button" className="reading-mark-button" onClick={() => onMarkRead(guide.id, !markedRead)}>
                {markedRead ? 'Desfazer marcação de lido' : 'Marcar como lido'}
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
