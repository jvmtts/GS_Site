import Icon from '../Icon.jsx';
import ButtonLink from '../ui/ButtonLink.jsx';
import Link from '../ui/Link.jsx';

export default function ReviewList({ lessons, quizzes = [], results }) {
  if (lessons.length === 0) {
    return (
      <div className="empty-state">
        <Icon name="cap" size={30} />
        <h2>Nenhuma revisão registrada.</h2>
        <p>Os quizzes são opcionais e independentes do progresso de leitura dos guias.</p>
        <ButtonLink to="/licoes">Explorar lições</ButtonLink>
      </div>
    );
  }

  return (
    <div className="history-list">
      {lessons.map((lesson) => (
        <div className="history-item" key={lesson.id}>
          <Link to={`/licoes/${lesson.slug}`}>
            {lesson.title}
            <span>{results[lesson.id].attempts} revisão(ões) · melhor resultado: {results[lesson.id].best}/{results[lesson.id].total}</span>
          </Link>
          {quizzes.some((quiz) => quiz.lessonId === lesson.id && quiz.status === 'published') && (
            <Link to={`/licoes/${lesson.slug}/quiz`} className="small-quiet">Revisar</Link>
          )}
        </div>
      ))}
    </div>
  );
}
