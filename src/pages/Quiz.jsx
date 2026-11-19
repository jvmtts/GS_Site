import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Link from '../components/ui/Link.jsx';
import { getGuideById, topics } from '../data/content.js';

export default function Quiz({ lesson, quiz, onComplete }) {
  const questions = quiz.questions;
  const guide = lesson.guideId ? getGuideById(lesson.guideId) : null;
  const topic = topics.find((item) => item.id === lesson.topicId);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const heading = useRef(null);

  useEffect(() => {
    if (index > 0 || finished) heading.current?.focus();
  }, [index, finished]);

  const question = questions[index];
  const answered = picked !== null;
  const correct = picked === question.correct;

  function choose(answerIndex) {
    if (answered) return;
    setPicked(answerIndex);
    if (answerIndex === question.correct) setScore((current) => current + 1);
  }

  function advance() {
    if (index === questions.length - 1) {
      setFinished(true);
      onComplete?.(lesson.id, score, questions.length);
    } else {
      setIndex((current) => current + 1);
      setPicked(null);
    }
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setFinished(false);
    setScore(0);
    heading.current?.focus();
  }

  return (
    <div className="shell quiz-page">
      <Link to={`/licoes/${lesson.slug}`} className="tiny-link">
        <Icon name="back" size={17} /> Voltar à lição
      </Link>
      {finished ? (
        <div className="quiz-finished">
          <Icon name="cap" size={40} />
          <span className="eyebrow">REVISÃO CONCLUÍDA</span>
          <h1 ref={heading} tabIndex="-1">Você respondeu {score} de {questions.length} perguntas corretamente.</h1>
          <p>O importante é compreender os conceitos. Você pode retomar as fontes e tentar novamente, sem perder pontos ou progresso.</p>
          <button className="pp-button" type="button" onClick={restart}>
            Recomeçar quiz <Icon name="arrow" size={18} />
          </button>
          {guide && <Link to={guide.path} className="outline-button">Revisar guia <Icon name="book" size={17} /></Link>}
        </div>
      ) : (
        <>
          <div className="quiz-top">
            <span className="eyebrow">LIÇÃO · {topic?.title.toUpperCase() ?? 'REVISÃO'}</span>
            <span>PERGUNTA {index + 1} DE {questions.length}</span>
          </div>
          <div className="quiz-bar" role="progressbar" aria-label="Progresso das questões" aria-valuenow={index + 1} aria-valuemin={0} aria-valuemax={questions.length}>
            <span style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
          </div>
          <h1 ref={heading} tabIndex="-1">{question.question}</h1>
          <p className="quiz-instruction">Escolha uma alternativa. A explicação aparecerá logo abaixo.</p>
          <div className="answers" role="group" aria-label="Alternativas">
            {question.answers.map((answer, answerIndex) => (
              <button
                key={answer}
                type="button"
                disabled={answered}
                className={[
                  'answer',
                  answered && answerIndex === question.correct ? 'correct' : '',
                  answered && answerIndex === picked && !correct ? 'wrong' : '',
                ].filter(Boolean).join(' ')}
                aria-pressed={picked === answerIndex}
                onClick={() => choose(answerIndex)}
              >
                <span className="answer-radio" aria-hidden="true">
                  {answered && answerIndex === question.correct && <Icon name="check" size={15} />}
                  {answered && answerIndex === picked && !correct && <Icon name="close" size={15} />}
                </span>
                {answer}
                {answered && answerIndex === question.correct && <span className="answer-state">Correta</span>}
                {answered && answerIndex === picked && !correct && <span className="answer-state">Sua escolha</span>}
              </button>
            ))}
          </div>
          {answered && (
            <div className={`feedback ${correct ? 'good' : 'bad'}`} role="status" aria-live="polite">
              <strong><Icon name={correct ? 'check' : 'info'} size={20} />
                {correct ? 'Correto — você identificou o conceito.' : 'Ainda não — veja a explicação.'}
              </strong>
              {!correct && <p><b>Resposta correta:</b> {question.answers[question.correct]}</p>}
              {!correct && question.misconception && <p><b>Por que a alternativa escolhida não funciona:</b> {question.misconception}</p>}
              <p>{question.explanation}</p>
              {guide && <Link to={guide.path} className="feedback-link">Revisar no guia <Icon name="arrow" size={15} /></Link>}
            </div>
          )}
          {answered && (
            <button className="pp-button quiz-next" type="button" onClick={advance}>
              {index === questions.length - 1 ? 'Concluir revisão' : 'Próxima pergunta'}
              <Icon name="arrow" size={17} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
