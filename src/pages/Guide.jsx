import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import Diagram from '../components/Diagram.jsx';
import CivicExplainer from '../components/editorial/CivicExplainer.jsx';
import Link from '../components/ui/Link.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import SaveButton from '../components/ui/SaveButton.jsx';
import NotFound from './NotFound.jsx';
import { getGuideBySlug } from '../data/content.js';
import ReadingProgress from '../components/editorial/ReadingProgress.jsx';
import ReadingTools from '../components/reader/ReadingTools.jsx';
import useSectionReading from '../hooks/useSectionReading.js';
import { summarizeReading } from '../lib/readingProgress.js';

function OfficialReferences({ sources, compact = false }) {
  return sources.map((reference) => (
    <a
      key={reference.url}
      href={reference.url}
      target="_blank"
      rel="noopener noreferrer"
      className={compact ? undefined : 'inline-source'}
    >
      <span>
        <strong>{reference.label}</strong>
        {!compact && <small>{reference.description}</small>}
      </span>
      <Icon name="external" size={compact ? 15 : 18} />
    </a>
  ));
}

export default function Guide({ slug, saved, onToggle, readingEntry, onSectionVisited, onMarkRead,
  readingNotes, onSaveNote, onOpenPreferences }) {
  const guide = getGuideBySlug(slug);
  const [indexOpen, setIndexOpen] = useState(false);
  const activeSectionId = useSectionReading(guide, onSectionVisited);
  if (!guide) return <NotFound />;
  const reading = summarizeReading(guide, readingEntry);

  return (
    <div className="shell">
      <nav className="breadcrumbs" aria-label="Caminho de navegação">
        <Link to="/home">Portal</Link>
        <Icon name="arrow" size={13} />
        <Link to="/assuntos">Assuntos</Link>
        <Icon name="arrow" size={13} />
        <span aria-current="page">{guide.category}</span>
      </nav>

      <div className={`guide-grid${indexOpen ? ' guide-grid--index-open' : ''}`}>
        <nav className="article-index" id="guide-index" aria-label="Seções deste guia">
          <div className="guide-index-heading">
            <h3>Seções do guia</h3>
            <button type="button" className="focus-index-close" onClick={() => {
              setIndexOpen(false);
              document.getElementById('reading-index-toggle')?.focus();
            }}>Ocultar índice</button>
          </div>
          <p className="article-index-count">{reading.count} de {reading.total} visitadas</p>
          <div className="article-index-sections">
            {guide.sections.map(({ id, title }) => (
              <a href={`#${id}`} key={id}
                onClick={() => {
                  if (document.documentElement.dataset.readerFocus === 'on') setIndexOpen(false);
                }}
                className={activeSectionId === id ? 'is-current' : ''}
                aria-current={activeSectionId === id ? 'location' : undefined}>
                <span className={`section-marker ${reading.visited.includes(id) ? 'was-visited' : ''}`} aria-hidden="true">
                  {reading.visited.includes(id) ? '✓' : '○'}
                </span>
                <span>{title}{reading.visited.includes(id) && <span className="sr-only"> — seção visitada</span>}</span>
              </a>
            ))}
          </div>
          <a href="#fontes">Fontes oficiais</a>
        </nav>

        <article className="article-body">
          <span className="eyebrow">GUIA · {guide.category.toUpperCase()}</span>
          <h1>{guide.title}</h1>
          <p className="article-deck">{guide.deck}</p>
          <div className="article-meta">
            <span>Explicação independente</span>
            <span>Fontes oficiais consultadas · 17/11/2026</span>
            <span>Revisão editorial final pendente</span>
            <SaveButton saved={saved} onToggle={() => onToggle(guide.id)} />
          </div>

          <ReadingTools guide={guide} notes={readingNotes} onSaveNote={onSaveNote}
            onOpenPreferences={onOpenPreferences} saved={saved}
            onToggleSave={() => onToggle(guide.id)}
            onOpenIndex={() => {
              setIndexOpen(true);
              window.requestAnimationFrame(() => document.getElementById('guide-index')?.scrollIntoView({
                block: 'start', behavior: 'auto',
              }));
            }} />
          <ReadingProgress guide={guide} entry={readingEntry} onMarkRead={onMarkRead} />

          <div className="editorial-note" role="note">
            <Icon name="info" size={19} />
            <p>Este texto é uma síntese didática do Ponto Público, não um documento oficial ou orientação jurídica. Use os links de fonte para conferir regras e contextos.</p>
          </div>

          {['constituicao', 'poderes', 'executivo'].includes(guide.id) && (
            <CivicExplainer kind={guide.id} />
          )}

          {guide.sections.map((section) => (
            <section className="reading-block" id={section.id} key={section.id}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.diagram && <Diagram />}
            </section>
          ))}

          <section className="reading-block" id="fontes">
            <h2>Confira nas fontes oficiais</h2>
            <p>Os endereços abaixo permitem conferir textos e consultar registros das instituições responsáveis. Antes de utilizar a informação, observe vigência, data e competência territorial.</p>
            <OfficialReferences sources={guide.sources} />
          </section>

          <div className="next-learning">
            <Icon name="cap" size={27} />
            <div>
              <strong>Quer revisar o que aprendeu?</strong>
              <p>Uma lição opcional com perguntas que explicam acertos e erros.</p>
            </div>
            <ButtonLink to={`/licoes/${guide.slug}`}>Ir para a lição</ButtonLink>
          </div>
          <div className="other-guides-link">
            <Link to="/assuntos">Explorar outros assuntos <Icon name="arrow" size={16} /></Link>
          </div>
        </article>

        <aside className="guide-aside">
          <div className="source-box">
            <Icon name="layers" size={25} />
            <h3>Fontes oficiais</h3>
            <OfficialReferences sources={guide.sources} compact />
            <p>Links para documentos e serviços de instituições públicas. Sem vínculo de endosso ou parceria.</p>
          </div>
          <div className="aside-box">
            <span className="eyebrow">NESTE ASSUNTO</span>
            <strong>{guide.category}</strong>
            <p>Guia de leitura aberta, sem cadastro e sem pontuação.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
