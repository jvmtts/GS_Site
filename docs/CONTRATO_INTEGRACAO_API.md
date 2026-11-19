# Contrato de integração editorial — base para o próximo desenvolvedor

## Limites atuais

A implementação V1.8.0 inclui **interface funcional** para cadastrar, editar e excluir tags, lições e quizzes. O repositório ativo (`src/repositories/localEditorialRepository.js`) usa apenas `localStorage`, não faz requisições HTTP e não autentica usuários. Os campos de status `draft` e `published` controlam **visibilidade somente neste navegador**: não há aprovação editorial nem publicação em servidor.

## Entidades observadas no código

| Entidade | Campos aplicados | Referências e invariantes |
| --- | --- | --- |
| `Tag` | `id`, `name`, `slug`, `description` | `id` estável; `slug` único e normalizado; exclusão remove seu `id` dos `lesson.tagIds` |
| `Lesson` | `id`, `slug`, `title`, `description`, `body`, `topicId`, `guideId`, `tagIds`, `status` | `id` e `slug` únicos; `topicId` deve existir nos 5 assuntos; `guideId` opcional aponta para guia-base; `tagIds` relaciona tags existentes; `status` é `draft` ou `published` |
| `Quiz` | `id`, `lessonId`, `title`, `status`, `questions[]` | Um quiz por lição na V1.8.0; quiz só é acessível na rota pública quando ele **e sua lição** estão publicados; exclusão de lição elimina quiz vinculado no repositório local |
| `Question` | `id`, `question`, `answers[]`, `correct`, `explanation`, `misconception` | ID único dentro do quiz; 2–5 respostas, índice `correct` inteiro começando em 0; explicação obrigatória; `misconception` opcional; 1–100 perguntas por quiz |
| `Topic` | `id`, `title`, `text`, `icon` | Vem de `src/data/content.js`, não há CRUD de assuntos nesta entrega |
| `Guide` | IDs/slug, título, descrição, seções e fontes, conteúdo adicional | Vem de `src/data/guides.js`; o painel de Guias só permite notas editoriais locais |

Exemplo de exportação produzida pelo botão **Exportar catálogo (JSON)** no `/admin`:

```json
{
  "version": 1,
  "tags": [{ "id": "tag-exemplo", "name": "Exemplo", "slug": "exemplo", "description": "" }],
  "lessons": [{
    "id": "lesson-exemplo", "slug": "licao-exemplo", "title": "Lição exemplo",
    "description": "Descrição breve", "body": "Texto da lição", "topicId": "direitos",
    "guideId": null, "tagIds": ["tag-exemplo"], "status": "draft"
  }],
  "quizzes": [{
    "id": "quiz-exemplo", "lessonId": "lesson-exemplo", "title": "Quiz exemplo",
    "status": "draft", "questions": [{
      "id": "question-exemplo", "question": "Pergunta de exemplo?",
      "answers": ["Alternativa A", "Alternativa B"], "correct": 0,
      "explanation": "Explicação de exemplo", "misconception": ""
    }]
  }]
}
```

Esse JSON é **exemplo de esquema na documentação**; esses registros não existem nos dados iniciais do projeto. O catálogo real começa com `tags: []`, 14 lições e 14 quizzes derivados dos guias e perguntas existentes.

## Locais de integração — pontos precisos

| Arquivo completo | Responsabilidade | Alteração esperada para API |
| --- | --- | --- |
| `GS_Site-main/src/data/editorialSeeds.js` | Inicialização a partir do acervo estático | Transformar em migração/seed de banco, não em fonte permanente do front-end |
| `GS_Site-main/src/lib/editorialCatalog.js` | Validação, unicidade, exclusão e integridade de vínculos | Manter regras compartilhadas ou replicá-las **no backend** com validação de payload e constraints no banco |
| `GS_Site-main/src/repositories/localEditorialRepository.js` | Ler, salvar e limpar snapshot local (`pp-editorial-catalog-v1`) | Substituir por módulo de requisições autenticadas e tratamento de códigos HTTP; não espalhar `fetch` por componentes |
| `GS_Site-main/src/hooks/useEditorialCatalog.js` | Fluxo de dados para interface e estado React | Usar `await` para carregar/cadastrar/editar/excluir, estados `loading/saving/error`, invalidação e cache; o contrato atual é síncrono |
| `GS_Site-main/src/app/EditorialContext.jsx` | Disponibiliza o catálogo e ações via contexto | Pode permanecer como interface entre componentes e camada de dados |
| `GS_Site-main/src/app/AppRouter.jsx`, `GS_Site-main/src/app/RouteView.jsx`, `GS_Site-main/src/lib/routes.js` | Compartilham catálogo com rotas e páginas | Manter resolução dinâmica para novos slugs e status; implementar carregamento assíncrono antes da resolução em produção |
| `GS_Site-main/src/pages/Admin.jsx` e `GS_Site-main/src/components/admin/*.jsx` | Formulários e controles de CRUD | Trocar callbacks locais por operações assíncronas do hook; manter validação e feedback de erro/sucesso |
| `GS_Site-main/src/pages/Lessons.jsx`, `GS_Site-main/src/pages/Lesson.jsx`, `GS_Site-main/src/pages/Quiz.jsx` | Exibição pública e execução de quizzes | Consumir apenas itens publicados do endpoint público; jamais confiar no campo `status` enviado pelo usuário como permissão de acesso |
| `GS_Site-main/src/hooks/usePortalState.js` | Progresso e resultados pessoais por ID | Separar sincronização de usuário de gestão editorial; score e histórico não devem permitir manipulação dos dados de autoria no servidor |

## Endpoints sugeridos, ainda não implementados

- `GET /api/v1/tags`, `POST /api/v1/tags`, `PATCH /api/v1/tags/:id`, `DELETE /api/v1/tags/:id`
- `GET /api/v1/lessons`, `GET /api/v1/lessons/:slug`, `POST /api/v1/lessons`, `PATCH /api/v1/lessons/:id`, `DELETE /api/v1/lessons/:id`
- `GET /api/v1/quizzes`, `GET /api/v1/quizzes/:id`, `POST /api/v1/quizzes`, `PATCH /api/v1/quizzes/:id`, `DELETE /api/v1/quizzes/:id`
- `GET /api/v1/topics`, `GET /api/v1/guides/:slug` para a etapa de migração do acervo fixo

Esses caminhos são **proposta de contrato**, não rotas ou serviços existentes na base. Recomenda-se transação no banco para exclusão de lição + quiz, integridade referencial, validação no servidor, autorização por perfil e separação entre leitura pública e escrita autenticada.

## Segurança, migração e publicação

Não disponibilizar a rota `/admin` como um painel administrativo real sem autenticação e autorização **no servidor**. O acesso direto à rota e o `localStorage` são públicos para o operador do navegador e não substituem proteção. Preferir gestão de mídia com validação de formatos e tamanhos, política de origem, CSRF quando relevante, logs de alteração e revisão editorial.

A importação futura deverá preservar IDs dos registros existentes, criar migração idempotente, recusar slugs duplicados, validar referências, manter rastreamento de alteração, e considerar que quizzes alterados em quantidade de questões devem preservar histórico de tentativas por versão ou registrar o total usado na tentativa. Não sobrescrever silenciosamente alterações locais: o botão de exportação permite ao desenvolvedor recuperar o catálogo atual antes de apontar para API.

O `localStorage` aceita apenas dados do mesmo navegador/origem. **Não foi implementado** backend, importação JSON, autenticação, sincronização multiusuário, upload de mídia, auditoria de ações ou migração remota nesta entrega.
