import Icon from '../components/Icon.jsx';
import Diagram from '../components/Diagram.jsx';
import TopicVisual from '../components/editorial/TopicVisual.jsx';
import Link from '../components/ui/Link.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import PageHead from '../components/ui/PageHead.jsx';
import { getGuideById, topics } from '../data/content.js';

export default function Lesson({ lesson, quiz, tags = [] }) {
  const guide = lesson.guideId ? getGuideById(lesson.guideId) : null;
  const category = topics.find((topic) => topic.id === lesson.topicId)?.title ?? 'Lições';
  const assignedTags = tags.filter((tag) => lesson.tagIds.includes(tag.id));

  return (
    <div className="shell narrow">
      <PageHead
        eyebrow={`LIÇÃO / ${category.toUpperCase()}`}
        title={`${lesson.title}.`}
        description={`${lesson.description} ${quiz ? `Você pode responder a ${quiz.questions.length} perguntas sem obrigação de acerto.` : ''}`}
      />
      <div className="lesson-content">
        <div className="lesson-text">
          {assignedTags.length > 0 && (
            <div className="cms-lesson-tags" aria-label="Tags da lição">
              {assignedTags.map((tag) => <span key={tag.id}>{tag.name}</span>)}
            </div>
          )}
          <span className="eyebrow">COMECE PELO CONCEITO</span>
          <h2>Informação para compreender. Exercício para lembrar.</h2>
          {lesson.body.split(/\n\n+/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {guide?.id === 'orcamento' && <Diagram />}
          {guide && (
            <div className="lesson-deep-dive">
              <span className="eyebrow">RELEMBRE O CAMINHO</span>
              {guide.sections.slice(0, 4).map((section, index) => (
                <section key={section.id}>
                  <span className="lesson-step">{String(index + 1).padStart(2, '0')}</span>
                  <div><h3>{section.title}</h3><p>{section.paragraphs[0]}</p></div>
                </section>
              ))}
            </div>
          )}
          <div className="lesson-summary">
            <h3>O que observar</h3>
            <ul>
              <li>Qual é a instituição ou o documento responsável?</li>
              <li>Qual é o contexto e o recorte da informação?</li>
              <li>Onde posso verificar a explicação original?</li>
            </ul>
          </div>
          <div className="lesson-bottom">
            {guide && <Link to={guide.path} className="tiny-link"><Icon name="back" size={17} /> Revisar guia e fontes</Link>}
            {quiz && <ButtonLink to={`/licoes/${lesson.slug}/quiz`}>Começar quiz</ButtonLink>}
          </div>
        </div>
        <div className="lesson-photo lesson-photo--documental">
          <TopicVisual topicId={lesson.topicId} />
        </div>
      </div>
    </div>
  );
}
