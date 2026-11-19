import { useEffect, useState } from 'react';
import Icon from '../Icon.jsx';
import Link from '../ui/Link.jsx';

export default function ReadingTools({ guide, notes = {}, onSaveNote, onOpenPreferences, saved, onToggleSave,
  onOpenIndex }) {
  const [showNotes, setShowNotes] = useState(false);
  const [sectionId, setSectionId] = useState(guide.sections[0]?.id || '');
  const [draft, setDraft] = useState(notes[sectionId] || '');
  const [status, setStatus] = useState('');
  const notesCount = Object.keys(notes).length;
  useEffect(() => {
    if (window.location.hash !== '#reading-notes') return undefined;
    setShowNotes(true);
    const timeout = window.setTimeout(() => document.getElementById('reading-notes')?.scrollIntoView({ block: 'start' }), 80);
    return () => window.clearTimeout(timeout);
  }, []);
  return (
    <div className="reading-tools" aria-label="Recursos deste guia">
      <div className="reading-tools-row">
        <span className="reading-tools-heading">RECURSOS DE LEITURA</span>
        <button type="button" id="reading-index-toggle" className="reading-tool"
          aria-controls="guide-index" onClick={onOpenIndex}>
          <Icon name="book" size={17}/> Índice
        </button>
        <button type="button" className="reading-tool" onClick={onOpenPreferences}><Icon name="settings" size={17}/> Aparência</button>
        <button type="button" className="reading-tool" aria-expanded={showNotes} aria-controls="reading-notes"
          onClick={() => setShowNotes((current) => !current)}><Icon name="edit" size={17}/> Notas {notesCount > 0 && `(${notesCount})`}</button>
        <button type="button" className="reading-tool" aria-pressed={saved} onClick={onToggleSave}>
          <Icon name="bookmark" size={17}/> {saved ? 'Salvo' : 'Salvar'}</button>
      </div>
      {showNotes && (
        <section className="reading-notes" id="reading-notes" aria-label="Anotações pessoais deste guia">
          <div className="reading-notes-heading"><div><strong>Uma nota por seção</strong>
            <p>Seus comentários não são enviados ao Ponto Público.</p></div>
            <Link to="/user">Minhas leituras <Icon name="arrow" size={15}/></Link>
          </div>
          <label htmlFor="reader-section-note">Seção a comentar</label>
          <select id="reader-section-note" value={sectionId} onChange={(event) => {
              const nextSection = event.target.value;
              setSectionId(nextSection);
              setDraft(notes[nextSection] || '');
              setStatus('');
            }}>
            {guide.sections.map(({ id, title }) => <option key={id} value={id}>{title}</option>)}
          </select>
          <label htmlFor="reader-note-text">Sua anotação</label>
          <textarea id="reader-note-text" value={draft} maxLength={1500} rows={4}
            placeholder="O que gostaria de registrar sobre esta seção?"
            onChange={(event) => { setDraft(event.target.value); setStatus(''); }} />
          <div className="reading-notes-actions">
            <span>{draft.length}/1500 caracteres</span>
            <button className="pp-button" type="button" onClick={() => {
              onSaveNote(guide.id, sectionId, draft);
              setStatus(draft.trim() ? 'Nota salva neste navegador.' : 'Nota removida deste navegador.');
            }}>Salvar nota <Icon name="check" size={15}/></button>
          </div>
          {status && <p className="reading-notes-status" role="status">{status}</p>}
        </section>
      )}
    </div>
  );
}
