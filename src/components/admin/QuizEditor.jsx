import { useState } from 'react';
import { newEditorialId } from '../../lib/editorialIds.js';

function emptyQuestion() {
  return {
    id: newEditorialId('question'),
    question: '', answers: ['', '', ''], correct: 0, explanation: '', misconception: '',
  };
}

export default function QuizEditor({ item, lessons, quizzes, onSave, onDelete, onCancel }) {
  const eligibleLessons = lessons.filter((lesson) => item?.lessonId === lesson.id || !quizzes.some((quiz) => quiz.lessonId === lesson.id));
  const [title, setTitle] = useState(item?.title ?? '');
  const [lessonId, setLessonId] = useState(item?.lessonId ?? '');
  const [status, setStatus] = useState(item?.status ?? 'draft');
  const [questions, setQuestions] = useState(item?.questions.map((question) => ({
    ...question, answers: [...question.answers],
  })) ?? [emptyQuestion()]);

  function changeQuestion(index, update) {
    setQuestions((current) => current.map((question, position) =>
      position === index ? { ...question, ...update } : question));
  }

  function changeAnswer(questionIndex, answerIndex, value) {
    setQuestions((current) => current.map((question, index) => index === questionIndex ? {
      ...question,
      answers: question.answers.map((answer, position) => position === answerIndex ? value : answer),
    } : question));
  }

  function submit(event) {
    event.preventDefault();
    onSave({ id: item?.id ?? newEditorialId('quiz'), title, lessonId, status, questions });
  }

  return (
    <form className="cms-form" onSubmit={submit}>
      <div className="cms-form-heading">
        <div><span className="eyebrow">EXERCÍCIOS</span><h2>{item ? 'Editar quiz' : 'Novo quiz'}</h2></div>
        <span className="cms-secondary-meta">{questions.length} pergunta(s)</span>
      </div>
      <label htmlFor="cms-quiz-title">Título do quiz <span aria-hidden="true">*</span></label>
      <input id="cms-quiz-title" required maxLength={150} value={title} onChange={(event) => setTitle(event.target.value)} />
      <div className="cms-form-columns">
        <div className="cms-field">
          <label htmlFor="cms-quiz-lesson">Lição vinculada <span aria-hidden="true">*</span></label>
          <select id="cms-quiz-lesson" required value={lessonId} onChange={(event) => setLessonId(event.target.value)}>
            <option value="">Selecione uma lição</option>
            {eligibleLessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
          </select>
          {eligibleLessons.length === 0 && <p className="cms-help">Todas as lições já possuem quiz. Cadastre uma nova lição para criar outro.</p>}
        </div>
        <div className="cms-field">
          <label htmlFor="cms-quiz-status">Visibilidade</label>
          <select id="cms-quiz-status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="draft">Rascunho — somente no painel</option>
            <option value="published">Visível localmente no portal</option>
          </select>
        </div>
      </div>
      <div className="cms-question-list">
        {questions.map((question, index) => (
          <fieldset key={question.id} className="cms-question">
            <legend>Pergunta {index + 1}</legend>
            <div className="cms-question-toolbar">
              <strong>Alternativas e explicação</strong>
              <button className="cms-danger" type="button" disabled={questions.length === 1}
                onClick={() => setQuestions((current) => current.filter((item) => item.id !== question.id))}>Remover pergunta</button>
            </div>
            <label htmlFor={`cms-question-${question.id}`}>Enunciado <span aria-hidden="true">*</span></label>
            <textarea id={`cms-question-${question.id}`} rows={2} required maxLength={600}
              value={question.question} onChange={(event) => changeQuestion(index, { question: event.target.value })} />
            {question.answers.map((answer, answerIndex) => (
              <div className="cms-answer-row" key={`${question.id}-${answerIndex}`}>
                <div className="cms-answer-input">
                  <label htmlFor={`cms-answer-${question.id}-${answerIndex}`}>Alternativa {answerIndex + 1}</label>
                  <input id={`cms-answer-${question.id}-${answerIndex}`} required maxLength={400} value={answer}
                    onChange={(event) => changeAnswer(index, answerIndex, event.target.value)} />
                </div>
                <label className="cms-correct-answer">
                  <input type="radio" name={`cms-correct-${question.id}`} checked={question.correct === answerIndex}
                    onChange={() => changeQuestion(index, { correct: answerIndex })} /> Correta
                </label>
                <button className="cms-answer-remove" type="button" aria-label={`Remover alternativa ${answerIndex + 1}`}
                  disabled={question.answers.length <= 2} onClick={() => changeQuestion(index, {
                    answers: question.answers.filter((_, position) => position !== answerIndex),
                    correct: question.correct === answerIndex ? 0 : question.correct > answerIndex ? question.correct - 1 : question.correct,
                  })}>Remover</button>
              </div>
            ))}
            <button className="cms-inline-button" type="button" disabled={question.answers.length >= 5}
              onClick={() => changeQuestion(index, { answers: [...question.answers, ''] })}>Adicionar alternativa</button>
            <label htmlFor={`cms-explanation-${question.id}`}>Explicação da resposta correta <span aria-hidden="true">*</span></label>
            <textarea id={`cms-explanation-${question.id}`} rows={3} required maxLength={1200}
              value={question.explanation} onChange={(event) => changeQuestion(index, { explanation: event.target.value })} />
            <label htmlFor={`cms-misconception-${question.id}`}>Por que uma alternativa incorreta não funciona</label>
            <textarea id={`cms-misconception-${question.id}`} rows={2} maxLength={1200}
              value={question.misconception} onChange={(event) => changeQuestion(index, { misconception: event.target.value })} />
          </fieldset>
        ))}
      </div>
      <button className="cms-inline-button" type="button" disabled={questions.length >= 100}
        onClick={() => setQuestions((current) => [...current, emptyQuestion()])}>Adicionar pergunta</button>
      <div className="cms-form-actions">
        <button className="pp-button" type="submit">{item ? 'Salvar alterações' : 'Cadastrar quiz'}</button>
        <button className="outline-button" type="button" onClick={onCancel}>Cancelar</button>
        {item && <button className="cms-danger" type="button" onClick={onDelete}>Excluir quiz</button>}
      </div>
    </form>
  );
}
