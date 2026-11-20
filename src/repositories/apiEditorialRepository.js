import { createApiClient } from './apiClient.js';
import { createInitialEditorialCatalog } from '../data/editorialSeeds.js';
import { mapApiCatalog, quizQuestionPayload } from '../lib/apiCatalog.js';
import { toLessonHtml } from '../lib/lessonText.js';

export function createApiEditorialRepository(request = createApiClient()) {
  async function load() {
    const [lessons, tags] = await Promise.all([request('/lesson/getall'), request('/tag/getall')]);
    return mapApiCatalog(lessons.data, tags.data);
  }

  function questionSignature(payload) {
    return JSON.stringify({
      doubt: payload.doubt,
      questions: [...payload.questions].sort((a, b) => a.text.localeCompare(b.text)),
    });
  }

  async function addQuestions(lesson, questions, catalog) {
    const payloads = questions.map(quizQuestionPayload);
    if (new Set(payloads.map((payload) => payload.doubt)).size !== payloads.length) {
      throw new Error('As perguntas do quiz precisam ter enunciados diferentes.');
    }
    const quiz = catalog.quizzes.find((item) => item.lessonId === lesson.id);
    for (const payload of payloads) {
      const existing = quiz?.questions.find((item) => item.question === payload.doubt);
      if (existing) {
        if (questionSignature(quizQuestionPayload(existing)) !== questionSignature(payload)) {
          throw new Error('Já existe uma pergunta com esse enunciado. A edição será disponibilizada em outra etapa.');
        }
        continue;
      }
      await request(`/lesson/${lesson.apiId}/quizzes`, { method: 'PUT', body: JSON.stringify(payload) });
    }
  }

  return {
    load,
    async save(type, input, previousId, catalog) {
      if (type === 'tags') {
        if (previousId) throw new Error('Para substituir uma tag, cadastre outra e altere os vínculos nas lições.');
        const content = input.name.trim();
        if (!content || content.length > 80) throw new Error('Informe um nome de tag com até 80 caracteres.');
        if (catalog.tags.some((tag) => tag.name.toLocaleLowerCase('pt-BR') === content.toLocaleLowerCase('pt-BR'))) {
          throw new Error('Já existe uma tag com esse nome.');
        }
        const response = await request('/tag/create', { method: 'POST', body: JSON.stringify({ content }) });
        const next = await load();
        const record = next.tags.find((tag) => String(tag.apiId) === response.id);
        if (!record) throw new Error('A tag foi criada, mas não foi possível atualizar o catálogo. Recarregue a página.');
        return { catalog: next, record };
      }

      if (type === 'lessons') {
        const tagIds = input.tagIds.map((id) => {
          const tag = catalog.tags.find((item) => item.id === id);
          if (!tag) throw new Error('Uma das tags selecionadas foi removida. Recarregue o catálogo.');
          return tag.apiId;
        });
        let lesson = catalog.lessons.find((item) => item.id === previousId);
        if (previousId) {
          if (!lesson) throw new Error('A lição não foi encontrada.');
          await request(`/lesson/put_tag/lessonId=${lesson.apiId}`, { method: 'PUT', body: JSON.stringify(tagIds) });
        } else {
          const title = input.title.trim();
          const text = toLessonHtml(input.body);
          if (!title || title.length > 150 || !input.body.trim() || text.length > 12000) {
            throw new Error('Preencha o título e o texto da lição dentro dos limites indicados.');
          }
          if (catalog.lessons.some((item) => item.title === title)) throw new Error('Já existe uma lição com esse título.');
          const response = await request('/lesson/create', {
            method: 'POST', body: JSON.stringify({ title, text, tagIds }),
          });
          const next = await load();
          lesson = next.lessons.find((item) => String(item.apiId) === response.id);
          if (!lesson) throw new Error('A lição foi criada, mas não foi possível atualizar o catálogo. Recarregue a página.');
          return { catalog: next, record: lesson };
        }
        const next = await load();
        return { catalog: next, record: next.lessons.find((item) => item.id === lesson.id) };
      }

      const lesson = catalog.lessons.find((item) => item.id === input.lessonId);
      if (!lesson) throw new Error('Selecione uma lição existente.');
      const current = await load();
      await addQuestions(lesson, input.questions, current);
      const previous = catalog.quizzes.find((item) => item.id === previousId);
      for (const question of previous?.questions ?? []) {
        if (!input.questions.some((item) => item.id === question.id)) {
          await request(`/quiz/delete/${question.apiId}`, { method: 'DELETE' });
        }
      }
      const next = await load();
      return { catalog: next, record: next.quizzes.find((item) => item.lessonId === lesson.id) };
    },
    async remove(type, id, catalog) {
      if (type === 'lessons') {
        const lesson = catalog.lessons.find((item) => item.id === id);
        if (!lesson) throw new Error('A lição não foi encontrada.');
        await request(`/lesson/delete/${lesson.apiId}`, { method: 'DELETE' });
      } else if (type === 'quizzes') {
        const quiz = catalog.quizzes.find((item) => item.id === id);
        if (!quiz) throw new Error('O quiz não foi encontrado.');
        for (const question of quiz.questions) {
          await request(`/quiz/delete/${question.apiId}`, { method: 'DELETE' });
        }
      } else {
        for (const lesson of catalog.lessons.filter((item) => item.tagIds.includes(id))) {
          const tagIds = lesson.tagIds.filter((tagId) => tagId !== id)
            .map((tagId) => catalog.tags.find((tag) => tag.id === tagId).apiId);
          await request(`/lesson/put_tag/lessonId=${lesson.apiId}`, { method: 'PUT', body: JSON.stringify(tagIds) });
        }
      }
      return load();
    },
    async importInitial() {
      const initial = createInitialEditorialCatalog();
      const catalog = await load();
      for (const source of initial.lessons) {
        let lesson = catalog.lessons.find((item) => item.title === source.title);
        if (!lesson) {
          const response = await request('/lesson/create', {
            method: 'POST', body: JSON.stringify({ title: source.title, text: source.body, tagIds: [] }),
          });
          if (!response.id) throw new Error('Lição criada. Recarregue o catálogo antes de continuar a importação.');
          lesson = { ...source, apiId: Number(response.id) };
          catalog.lessons.push(lesson);
        }
        const quiz = initial.quizzes.find((item) => item.lessonId === source.id);
        await addQuestions(lesson, quiz.questions, catalog);
      }
      return load();
    },
  };
}
