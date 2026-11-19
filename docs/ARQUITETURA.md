# Arquitetura do Ponto Público — V1.8.0

A aplicação utiliza React 19, Vite 8, JavaScript e Tailwind CSS 4. A implementação atual é um front-end estático com armazenamento local; não há API nem banco integrados.

## Fluxos

- `src/App.jsx` inicia `src/app/AppRouter.jsx`, responsável por navegação, preferências, transições e provedores de dados.
- `src/app/RouteView.jsx` resolve páginas por `src/lib/routes.js`; guias consultam o acervo estático, e as rotas de lição/quiz consultam o catálogo editorial ativo.
- `src/app/EditorialContext.jsx` disponibiliza lições, quizzes, tags e operações CRUD sem conectar os formulários diretamente ao armazenamento.
- `src/hooks/useEditorialCatalog.js` aplica as regras puras de `src/lib/editorialCatalog.js` e persiste através do contrato atual de `src/repositories/localEditorialRepository.js`.
- `src/data/editorialSeeds.js` gera a versão inicial do catálogo (14 lições e 14 quizzes) dos arquivos `src/data/guides.js` e `src/data/questions.js`. Tags começam vazias.
- `src/pages/Admin.jsx` controla seleção e mensagens; `src/components/admin/{TagEditor,LessonEditor,QuizEditor,GuideInventory}.jsx` implementam formulários especializados e inspeção de guias.
- `src/pages/Lessons.jsx`, `src/pages/Lesson.jsx` e `src/pages/Quiz.jsx` exibem registros com status `published` no catálogo deste navegador. Guias (`src/pages/Guide.jsx`) continuam lendo dados fixos em `src/data/content.js`.
- `src/hooks/usePortalState.js` e `src/components/library` mantêm histórico, leitura, notas, favoritos e resultados sem depender do editor.

## Modelagem e relações

- `Tag` ↔ `Lesson`: relação muitos-para-muitos (`lesson.tagIds`), sem converter as cinco categorias fixas em tags.
- `Lesson` → `Topic`: `topicId` obrigatório.
- `Lesson` → `Guide`: `guideId` opcional; lições independentes não possuem seções de guia nem referência externa inventada.
- `Quiz` → `Lesson`: exatamente uma lição e, nesta versão, no máximo um quiz por lição.
- `Quiz` → `Question[]`: cada questão possui 2–5 alternativas, índice correto e explicação. Uma lição excluída remove seu quiz; uma tag excluída remove seus vínculos.
- `draft`/`published`: controle local de visibilidade. O backend futuro deve validar e autorizar qualquer publicação.

Os IDs são estáveis dentro do catálogo e os slugs são únicos dentro de suas entidades. As rotas `/home`, `/assuntos`, `/guia/:slug`, `/licoes`, `/licoes/:slug`, `/licoes/:slug/quiz`, `/user` e `/admin` permanecem reconhecidas.

## Persistência

`pp-editorial-catalog-v1` é a chave de `localStorage` da gestão editorial, com esquema JSON `{version:1,tags:[],lessons:[],quizzes:[]}`. `src/repositories/localEditorialRepository.js` contém `load`, `save` e `clear`, e normaliza entradas. O hook mantém estado atualizado em React. Exportação JSON está disponível no painel; importação não foi implementada.

As demais chaves (`pp-saved-guides`, `pp-history`, `pp-local-profile`, `pp-quiz-results`, `pp-reading-progress`, `pp-reader-preferences`, `pp-reading-notes` e `pp-editorial-notes`) pertencem à atividade do navegador e são descritas, com todos os arquivos de origem e consumo, em `docs/INVENTARIO_DADOS_E_MOCKS.md`. A chave legada `pp-admin-drafts-v2` só é removida em limpeza de dados. O botão de exclusão total do `/user` também restaura o catálogo editorial local.

## Separação para integração

As regras editoriais estão em `src/lib`, a persistência em `src/repositories`, o estado reativo em `src/hooks` e a apresentação em `src/components/admin`. Para API, adaptar o repositório e o hook para operações assíncronas, com carregamento, autorização, tratamento de falhas e estados de gravação. Não inserir requisições HTTP diretamente nos formulários. Consulte `docs/CONTRATO_INTEGRACAO_API.md` para o esquema e os pontos de substituição.

## CSS e marca

`src/index.css` importa tokens, interface, animações, responsividade, leitura e `src/styles/admin.css` ao final. O visual mantém cantos retos, fotografia documental, créditos de mídia, marca de 16 pontos e movimento reduzido. Arquivos de marca, favicons e imagens locais ficam em `public/`.

## Convenções

Componentes e páginas usam PascalCase, hooks prefixados por `use`, arquivos de domínio camelCase, CSS por escopo e nomes com significado. Os formulários preservam validação no client; toda validação de segurança deve ser repetida no servidor quando existir. Os dados de testes são fixtures, não seed de produção. Não há comentários no código-fonte.
