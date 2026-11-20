import { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Link from '../components/ui/Link.jsx';
import PageHead from '../components/ui/PageHead.jsx';
import { topics } from '../data/content.js';
import { useEditorialContent } from '../app/EditorialContext.jsx';

export default function Lessons({ results = {}, lessons = [], tags = [] }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { searchTags } = useEditorialContent();
  useEffect(() => {
    const controller = new AbortController();
    if (selectedTags.length === 0) {
      setLoading(false);
      setError('');
      return () => controller.abort();
    }
    const names = tags.filter((tag) => selectedTags.includes(tag.id)).map((tag) => tag.name);
    setLoading(true);
    setError('');
    searchTags(names, controller.signal).then((items) => {
      if (!controller.signal.aborted) setFiltered(items);
    }).catch((failure) => {
      if (!controller.signal.aborted) {
        setFiltered([]);
        setError(failure.message);
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [selectedTags, tags, searchTags]);
  const published = lessons.filter((lesson) => lesson.status === 'published');
  const visible = selectedTags.length === 0 ? published : loading ? [] : filtered;

  return (
    <div className="shell">
      <PageHead
        eyebrow="BIBLIOTECA COMPLEMENTAR"
        title="Lições."
        description="Um espaço opcional para revisar ideias apresentadas nos guias, sem rankings, etapas bloqueadas ou cobrança de frequência."
      />
      {tags.length > 0 && (
        <div className="cms-public-tags" role="group" aria-label="Filtrar lições por tag">
          <button type="button" aria-pressed={selectedTags.length === 0} onClick={() => setSelectedTags([])}>Todas as lições</button>
          {tags.map((tag) => (
            <button type="button" key={tag.id} aria-pressed={selectedTags.includes(tag.id)}
              onClick={() => setSelectedTags((current) => current.includes(tag.id)
                ? current.filter((id) => id !== tag.id) : [...current, tag.id])}>{tag.name}</button>
          ))}
        </div>
      )}
      {loading && <p className="cms-empty" role="status">Buscando lições pelas tags…</p>}
      {error && <p className="cms-error" role="alert">{error}</p>}
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
        {!loading && !error && visible.length === 0 && <p className="cms-empty">Nenhuma lição publicada corresponde a este filtro.</p>}
      </div>
    </div>
  );
}
