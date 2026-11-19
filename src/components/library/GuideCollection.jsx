import Icon from '../Icon.jsx';
import ButtonLink from '../ui/ButtonLink.jsx';
import Link from '../ui/Link.jsx';

export default function GuideCollection({ type, guides, onRemove }) {
  const isSaved = type === 'salvos';
  if (guides.length === 0) {
    return (
      <div className="empty-state">
        <Icon name={isSaved ? 'bookmark' : 'clock'} size={30} />
        <h2>{isSaved ? 'Nenhum guia salvo por enquanto.' : 'Você ainda não abriu nenhum guia.'}</h2>
        <p>Os itens exibidos correspondem apenas à atividade registrada neste navegador.</p>
        <ButtonLink to="/assuntos">Explorar assuntos</ButtonLink>
      </div>
    );
  }

  return (
    <div className="history-list">
      {guides.map((guide) => (
        <div className="history-item" key={guide.id}>
          <Link to={guide.path}>{guide.title}<span>{guide.category}</span></Link>
          {isSaved && (
            <button type="button" className="small-quiet" onClick={() => onRemove(guide.id)}
              aria-label={`Remover ${guide.title} dos salvos`}>
              Remover
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
