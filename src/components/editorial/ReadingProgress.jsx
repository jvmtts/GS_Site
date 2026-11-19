import { summarizeReading } from '../../lib/readingProgress.js';

export function ReadingProgressBar({ count, total, percent, compact = false }) {
  return (
    <div className={`reading-progress-meter${compact ? ' reading-progress-meter--compact' : ''}`}>
      <div className="reading-progress-track" role="progressbar" aria-label="Seções do guia visitadas"
        aria-valuenow={count} aria-valuemin={0} aria-valuemax={total} aria-valuetext={`${count} de ${total} seções visitadas`}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function ReadingProgress({ guide, entry, onMarkRead }) {
  const progress = summarizeReading(guide, entry);
  return (
    <section className="reading-progress-panel" aria-label="Seu progresso neste guia">
      <div className="reading-progress-top">
        <div>
          <span className="eyebrow">SUA LEITURA NESTE NAVEGADOR</span>
          <h2>{progress.markedRead ? 'Guia marcado como lido' :
            progress.started ? 'Continue no seu ritmo.' : 'Comece de onde quiser.'}</h2>
        </div>
        <strong className="reading-progress-fraction">{progress.count}<span> / {progress.total}</span></strong>
      </div>
      <ReadingProgressBar {...progress} />
      <div className="reading-progress-bottom">
        <p>{progress.count === 0 ? 'Nenhuma seção visitada ainda.' :
          progress.markedRead ? `${progress.count} de ${progress.total} visitadas · marcado como lido.` :
          progress.allVisited ? `100% das seções visitadas · ainda não marcado como lido.` :
          `${progress.count} de ${progress.total} seções visitadas.`} Isso não mede compreensão.</p>
        {progress.lastSectionId && !progress.markedRead && (
          <a className="reading-progress-resume" href={`#${progress.lastSectionId}`}>
            Retomar: {progress.lastSectionTitle} <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
      {progress.allVisited && (
        <div className="reading-progress-confirm">
          <p>Você passou por todas as seções do texto. Marcar como lido é uma escolha sua.</p>
          <button type="button" onClick={() => onMarkRead(guide.id, !progress.markedRead)}>
            {progress.markedRead ? 'Desfazer marcação' : 'Marcar guia como lido'}
          </button>
        </div>
      )}
    </section>
  );
}
