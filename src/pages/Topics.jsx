import { useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import TopicVisual from '../components/editorial/TopicVisual.jsx';
import Link from '../components/ui/Link.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import PageHead from '../components/ui/PageHead.jsx';
import { guides, topics } from '../data/content.js';

export default function Topics() {
  const [filter, setFilter] = useState('todos');
  const visibleTopics = useMemo(
    () => topics.filter((topic) => filter === 'todos' || topic.id === filter),
    [filter],
  );

  return (
    <div className="shell topics-v14">
      <PageHead
        eyebrow="PORTAL / ASSUNTOS"
        title="Explore os temas da vida pública."
        description="Conheça instituições, direitos, orçamento e o funcionamento da cidade. Cada guia tem leitura própria e links para documentos oficiais."
      />
      <div className="topics-filter" role="group" aria-label="Filtrar assuntos">
        <button type="button" className={filter === 'todos' ? 'active' : ''}
          aria-pressed={filter === 'todos'} onClick={() => setFilter('todos')}>Todos os assuntos</button>
        {topics.map((topic) => (
          <button type="button" key={topic.id} className={filter === topic.id ? 'active' : ''}
            aria-pressed={filter === topic.id} onClick={() => setFilter(topic.id)}>
            {topic.title}
          </button>
        ))}
      </div>
      <div className="topics-grid">
        <div className="topic-features">
          {visibleTopics.map((topic) => {
            const available = guides.filter((guide) => guide.categoryId === topic.id);
            return (
              <section className="topic-feature" key={topic.id} id={topic.id} aria-labelledby={`topic-title-${topic.id}`}>
                <div className="topic-feature-top">
                  <TopicVisual topicId={topic.id} />
                  <div className="topic-feature-intro">
                    <div className="topic-feature-number">
                      <Icon name={topic.icon} size={22} />
                      <span>{available.length} guias disponíveis</span>
                    </div>
                    <h2 id={`topic-title-${topic.id}`}>{topic.title}</h2>
                    <p>{topic.text}</p>
                  </div>
                </div>
                <div className="topic-feature-guides">
                  {available.map((guide) => (
                    <Link to={guide.path} className="topic-feature-guide" key={guide.id}>
                      <div><strong>{guide.title}</strong><span>{guide.description}</span></div>
                      <Icon name="arrow" size={17} />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        <aside className="starter-panel topics-aside">
          <Icon name="book" size={26} />
          <span className="eyebrow">UM PONTO DE PARTIDA</span>
          <h2>Comece por aqui.</h2>
          <p>Uma sequência de leitura sugerida, não obrigatória. Todas as explicações continuam abertas.</p>
          <ol>
            {['constituicao', 'poderes', 'executivo', 'orcamento'].map((id) => {
              const guide = guides.find((item) => item.id === id);
              return <li key={id}><Link to={guide.path}>{guide.title}</Link></li>;
            })}
          </ol>
          <ButtonLink to="/guia/constituicao-federal">Ler a Constituição</ButtonLink>
          <p className="sidebar-disclaimer">Conteúdos independentes de orientação didática. Consulte sempre as fontes oficiais.</p>
        </aside>
      </div>
    </div>
  );
}
