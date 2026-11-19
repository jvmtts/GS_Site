import { useState } from 'react';
import { topicImages } from '../../data/topicImages.js';
import Icon from '../Icon.jsx';

export default function TopicVisual({ topicId, className = '' }) {
  const [failed, setFailed] = useState(false);
  const photo = topicImages[topicId];
  if (!photo) return null;

  return (
    <figure className={`topic-visual topic-visual--${topicId} ${className}`}>
      <div className="topic-visual-frame">
        {!failed ? (
          <img src={photo.url} alt={photo.alt} loading="lazy" decoding="async"
            onError={() => setFailed(true)} />
        ) : (
          <div className="topic-visual-fallback" role="img" aria-label="Ilustração geométrica do tema; imagem documental indisponível">
            <Icon name="layers" size={36} />
            <span>Imagem documental indisponível</span>
          </div>
        )}
      </div>
      <figcaption>
        <a href={photo.source} target="_blank" rel="noopener noreferrer">
          {photo.credit} · fonte da fotografia
        </a>
      </figcaption>
    </figure>
  );
}
