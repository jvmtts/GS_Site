import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import Link from '../components/ui/Link.jsx';
import PageHead from '../components/ui/PageHead.jsx';
import { topics } from '../data/content.js';

export default function Lessons({ results = {}, lessons = [], tags = [] }) {
  const [selectedTag, setSelectedTag] = useState('all');
  const published = lessons.filter((lesson) => lesson.status === 'published');
  const visible = published.filter((lesson) => selectedTag === 'all' || lesson.tagIds.includes(selectedTag));

  return (
    <div className="shell">
      <PageHead
        eyebrow="BIBLIOTECA COMPLEMENTAR"
        title="Lições."
        description="Um espaço opcional para revisar ideias apresentadas nos guias, sem rankings, etapas bloqueadas ou cobrança de frequência."
      />
      {tags.length > 0 && (
        <div className="cms-public-tags" role="group" aria-label="Filtrar lições por tag">
          <button type="button" aria-pressed={selectedTag === 'all'} onClick={() => setSelectedTag('all')}>Todas as lições</button>
          {tags.map((tag) => (
            <button type="button" key={tag.id} aria-pressed={selectedTag === tag.id}
              onClick={() => setSelectedTag(tag.id)}>{tag.name}</button>
          ))}
        </div>
      )}
      <div className="lesson-list">
        {visible.map((lesson, index) => (
          <Link to={`/licoes/${lesson.slug}`} key={lesson.id} className="lesson-list-item">
            <span className="lesson-num">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <span className="eyebrow">{(topics.find((topic) => topic.id === lesson.topicId)?.title ?? 'Lições').toUpperCase()}</span>
              <h2>{lesson.title}</h2>
              <p>{lesson.description}</p>
              <span className="lesson-meta">{results[lesson.id]
                ? `Revisada · melhor resultado: ${results[lesson.id].best}/${results[lesson.id].total}`
                : 'Ainda não revisada'}</span>
            </div>
            <Icon name="arrow" />
          </Link>
        ))}
        {visible.length === 0 && <p className="cms-empty">Nenhuma lição publicada corresponde a este filtro.</p>}
      </div>
    </div>
  );
}
