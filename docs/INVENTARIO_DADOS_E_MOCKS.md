# Inventário de dados, conteúdo estático e mocks — V1.8.0

## Escopo e critério

Inventário obtido por inspeção dos arquivos entregues em `GS_Site-main`, com rastreamento das importações, leituras de `localStorage` e referências das páginas. Os caminhos abaixo são **caminhos completos relativos à raiz do repositório `GS_Site-main/`**; esse prefixo deve ser conservado ao localizar os arquivos. O diretório absoluto no computador de cada desenvolvedor pode ser diferente.

Foi feita distinção entre quatro situações: **acervo editorial local** (conteúdo escrito e fixado no repositório, sem API), **conteúdo ilustrativo/configuração** (texto e listas estáticas, não representando dados governamentais), **dados persistidos no navegador** (gerados pelo usuário/editor, não fictícios) e **fixtures de testes** (dados deliberadamente inventados, usados apenas nos testes). Não foi encontrado serviço HTTP que carregue guias, quizzes, tags ou lições; as URLs externas identificadas em produção são referências oficiais e fotografias, não endpoints de uma API de conteúdo.

### A. Conteúdo editorial estático utilizado no site

| Origem completa | Dados identificados | Consumidores no código | Comportamento atual / recurso dependente | Substituição na integração |
| --- | --- | --- | --- | --- |
| `GS_Site-main/src/data/guides.js` | Array `guides`: **14 guias**, IDs e slugs, assunto, título, descrição, chamada, rota, número, seções com parágrafos, referências oficiais, além dos campos `lessonTitle`, `lessonDescription`, `lessonText` | `src/data/content.js`, `src/data/editorialSeeds.js` (via `content.js`); consumido por `src/pages/Home.jsx`, `Topics.jsx`, `Guide.jsx`, `User.jsx`, `src/components/layout/Header.jsx`, `src/components/admin/GuideInventory.jsx`, `LessonEditor.jsx`, `src/hooks/usePortalState.js`, `src/lib/routes.js` | Home, busca, assuntos, páginas de guia, leitura, histórico, favoritos, notas e links para fontes; também fornece os dados iniciais das lições | `GET /guides`, `GET /guides/:slug`, fontes e seções relacionadas. Preservar IDs/slug para históricos e links. Revisar textos e links oficiais antes de publicação |
| `GS_Site-main/src/data/questions.js` | Objeto `questionsByGuide`: **84 questões** em 14 conjuntos, com enunciados, alternativas, índice da resposta correta, explicação e correção de equívoco | Reexportado por `src/data/content.js`; convertido em quizzes editáveis em `src/data/editorialSeeds.js`; analisado em `tests/content.test.mjs` | Dados iniciais dos quizzes exibidos em `src/pages/Quiz.jsx` por meio do catálogo editorial; feedback pedagógico e pontuação | `GET /quizzes/:id/questions` ou questões embutidas em `GET /quizzes/:id`; manter explicações e ordem de alternativas |
| `GS_Site-main/src/data/content.js` | Array **5 assuntos** (`topics`) com IDs, títulos, descrições e chaves de ícones; consultas estáticas por `id` e `slug` dos guias | `src/pages/Topics.jsx`, `Lesson.jsx`, `Lessons.jsx`, `src/components/admin/LessonEditor.jsx`, `GuideInventory.jsx`, `src/lib/editorialCatalog.js`; também `Home.jsx`, `Guide.jsx`, `User.jsx`, `src/hooks/usePortalState.js` usam os guias reexportados | Filtragem por assunto, exibição das categorias, edição de lições e validação das relações | `GET /topics` ou tabela de assuntos; não confundir assunto (`topicId`) com tag (`tagIds`) |
| `GS_Site-main/src/data/topicImages.js` | Mapa de **5 fotografias** documentais com URL externa, URL de referência, crédito, licença e texto alternativo | `src/components/editorial/TopicVisual.jsx`, renderizado por `src/pages/Topics.jsx` e `src/pages/Lesson.jsx` | Imagens por assunto, créditos e alternativas quando falham; URL não contém dados governamentais em tempo real | `GET /media`/campos de mídia de assuntos; conservar fonte, autor, licença e alt; preferir arquivos hospedados localmente ou CDN licenciada |
| `GS_Site-main/src/data/editorialSeeds.js` | Conversão determinística dos 14 guias em **14 lições iniciais** e das 84 perguntas em **14 quizzes iniciais**; **tags começam vazias**, não foram inventadas | `src/repositories/localEditorialRepository.js`, `src/lib/routes.js`, `src/pages/Admin.jsx` (reposição da base), `tests/editorial-catalog.test.mjs` | Alimenta a primeira abertura do `/admin` e as páginas públicas de lições/quizzes até existir um catálogo salvo. Os IDs originais permanecem iguais aos dos guias quando vinculados | Usar registros importados no banco como migração inicial e retirar a inicialização em produção depois de fornecer dados reais por API; verificar se conteúdo editorial corresponde à versão aprovada |
| `GS_Site-main/src/components/Diagram.jsx` | 3 cartões de explicação **PPA/LDO/LOA** escritos diretamente no componente | `src/pages/Lesson.jsx` para lição vinculada ao guia `orcamento` | Diagrama didático, **não é dado de API nem valor orçamentário** | Opcional: transferir blocos didáticos estruturados para um CMS; não tratar como base financeira |
| `GS_Site-main/src/components/editorial/CivicExplainer.jsx` | `diagrams`: 3 conjuntos de cartões didáticos para `constituicao`, `poderes`, `executivo`, com referências a artigos e descrições | `src/pages/Guide.jsx` | Mapas editoriais embutidos nos guias; não são respostas dinâmicas de órgão oficial | Transformar em blocos de conteúdo associados ao guia, caso o backend edite componentes estruturados |
| `GS_Site-main/src/components/DocumentaryPhoto.jsx` | URL da fotografia do Congresso, página de origem, crédito, licença e fallback `/assets/congresso-tratado.webp` | `src/pages/Home.jsx` | Imagem da Home; caso a foto externa falhe, carrega asset local | API de mídia ou configuração editorial; conferir atribuição e direitos antes da hospedagem |
| `GS_Site-main/public/assets/congresso-tratado.webp` | Arquivo local de fallback da Home | `src/components/DocumentaryPhoto.jsx` | Imagem alternativa, **não é mock de dados** | Armazenamento de mídia/CDN se desejado |

### B. Curadoria e conteúdo estático embutido nas telas

Esses itens **não simulam dados de usuário nem indicadores oficiais**, mas devem ser identificados porque não são editáveis pelo painel atual.

| Arquivo completo | Valores fixos | Usado em / dependências | Ação na integração |
| --- | --- | --- | --- |
| `GS_Site-main/src/pages/Home.jsx` | `quickLinks` (3 ações), título/chamada do hero do orçamento, `orcamento` como destaque, seleção fixa de IDs `['orcamento','constituicao','poderes','executivo','transparencia']`, CTA e textos institucionais | Página `/home`; depende dos IDs presentes em `guides.js` | Se a curadoria for remota, criar campos de destaque e ordenação editorial; não inventar métricas |
| `GS_Site-main/src/pages/Topics.jsx` | Filtro inicial `todos`, seleção de leitura recomendada `['constituicao','poderes','executivo','orcamento']`, CTA de Constituição e textos institucionais | Página `/assuntos`; usa `topics` e `guides` do arquivo `content.js` | Transformar a sequência em ordem editorial configurável, se necessário |
| `GS_Site-main/src/components/layout/Header.jsx` | `primaryNavigation` com Portal/Assuntos/Lições, IDs destacados na busca vazia `['constituicao','poderes','executivo','orcamento']`, texto de busca | Cabeçalho de todas as páginas; usa `guides` de `content.js` | Manter como navegação de produto ou tornar destaques configuráveis; a busca ainda é local por texto |
| `GS_Site-main/src/pages/Lesson.jsx` | Estrutura de apresentação da lição, perguntas-guia fixas em “O que observar”, bloco explicativo e diagrama para `orcamento` | `/licoes/:slug`, utiliza os dados editáveis da lição e, quando houver, seu guia original | Conteúdo editorial da lição é editável; blocos didáticos fixos exigiriam modelo estruturado adicional se desejado |
| `GS_Site-main/src/pages/Quiz.jsx` | Textos de instrução e feedback genérico, rótulos de acerto/erro | `/licoes/:slug/quiz`, utiliza o quiz do catálogo em execução | Manter como cópia da interface; perguntas, alternativas e feedback específico vêm do catálogo |
| `GS_Site-main/src/components/library/LibraryTabs.jsx` | 5 abas (`Leituras`, `Salvos`, `Histórico`, `Revisões`, `Notas`) | `src/pages/User.jsx` | Configuração de UI, não deve ser migrada como registros de API |
| `GS_Site-main/src/components/reader/PreferencesDialog.jsx` e `GS_Site-main/src/lib/readingPreferences.js` | Opções e padrões de tema, texto, espaçamento e foco | `src/hooks/useReaderPreferences.js`, `src/app/AppRouter.jsx`, `/user` | Configuração da aplicação; só migrar preferências se houver conta e consentimento |
| `GS_Site-main/src/components/Icon.jsx`, `GS_Site-main/src/lib/brandGeometry.js`, `GS_Site-main/src/lib/motionGeometry.js`, `GS_Site-main/src/lib/motionTiming.js` | Vocabulário de ícones, 16 pontos oficiais, fórmulas e duração de animações | Componentes de marca e navegação | São constantes técnicas/de identidade, **não mocks nem conteúdo a servir por API** |
| `GS_Site-main/public/assets/logo/`, `GS_Site-main/public/favicon/`, `GS_Site-main/public/assets/logo-completo.svg`, `GS_Site-main/public/assets/simbolo.svg`, `GS_Site-main/public/assets/splash-wordmark.svg`, `GS_Site-main/public/assets/wordmark.svg` | Assets reais de marca e favicon | Componentes de marca, `src/components/DotMotion.jsx`, `index.html`, manifest | Preservar; não são mocks |

### C. Registros no navegador, ainda sem API

Esses registros **não são mockados por padrão**: começam vazios e passam a conter dados reais criados neste navegador. Não representam usuários de produção, não são compartilhados entre dispositivos e podem ser perdidos se o armazenamento for apagado.

| Chave exata | Fonte completa | Utilização / funcionalidade | Integração futura |
| --- | --- | --- | --- |
| `pp-editorial-catalog-v1` | `GS_Site-main/src/repositories/localEditorialRepository.js`, `GS_Site-main/src/hooks/useEditorialCatalog.js`, `GS_Site-main/src/lib/editorialCatalog.js` | CRUD de tags, lições e quizzes em `src/pages/Admin.jsx`; páginas `/licoes`, `/licoes/:slug`, `/licoes/:slug/quiz` e revisões em `/user`; esquema `version: 1` | Entidades `tags`, `lessons`, `quizzes` e `questions` em API; migrar snapshot com exportação JSON |
| `pp-editorial-notes` | `GS_Site-main/src/components/admin/GuideInventory.jsx`, `GS_Site-main/src/hooks/usePersistentState.js`, `GS_Site-main/src/lib/localState.js` | Observações textuais por guia em `/admin > Guias`; **não** edita conteúdo oficial | Tabela separada de notas editoriais, com autenticação e autorização |
| `pp-saved-guides` | `GS_Site-main/src/hooks/usePortalState.js`, `GS_Site-main/src/hooks/usePersistentState.js` | Salvos da Home, Guias, navegação e `/user` | Associação usuário ↔ guia |
| `pp-history` | `GS_Site-main/src/hooks/usePortalState.js` | Histórico de guias visitados e `/user` | Atividade do usuário, se existir conta e autorização de dados |
| `pp-local-profile` | `GS_Site-main/src/hooks/usePortalState.js` (`EMPTY_PROFILE`) e `GS_Site-main/src/lib/localState.js` | Padrões vazios de nome/modo de leitura; não há usuário fictício preenchido | Conta opcional; não tratar como cadastro/autenticação atual |
| `pp-quiz-results` | `GS_Site-main/src/hooks/usePortalState.js`, `GS_Site-main/src/lib/learningProgress.js` | Pontuação, melhor resultado, tentativas, data; usado em `/licoes` e `/user` | Tentativas de quiz do usuário, com ID de lição e total de questões da tentativa |
| `pp-reading-progress` | `GS_Site-main/src/hooks/usePortalState.js`, `GS_Site-main/src/lib/readingProgress.js`, `GS_Site-main/src/hooks/useSectionReading.js` | Seções visitadas, última seção, marcação deliberada de leitura | Progresso por usuário, guia e seção; preservar diferenciação entre visita e conclusão |
| `pp-reading-notes` | `GS_Site-main/src/hooks/usePortalState.js`, `GS_Site-main/src/lib/readingNotes.js`, `GS_Site-main/src/components/reader/ReadingTools.jsx` | Notas pessoais por guia/seção e `/user` | Anotações por usuário, guia e seção |
| `pp-reader-preferences` | `GS_Site-main/src/hooks/useReaderPreferences.js`, `GS_Site-main/src/lib/readingPreferences.js`, `GS_Site-main/index.html` | Tema inicial, fonte, espaçamento, modo foco | Preferências do usuário, caso haja contas; manter comportamento sem login |
| `pp-admin-drafts-v2` | Apenas em `GS_Site-main/src/hooks/usePortalState.js` (remoção) e histórico de testes | **Chave legada de versões anteriores**, não é mais produzida nem lida pela interface | Não criar endpoint; remover na migração/limpeza do legado |

`src/hooks/usePersistentState.js` aplica prefixo `pp-` a todas as chaves do hook. `src/lib/localState.js` normaliza formas legadas. A função de exclusão em `/user` também restaura o catálogo editorial inicial; esse comportamento deve ser separado por permissões antes de existir administração real.

### D. Fixtures deliberadamente fictícios, utilizados somente em testes

| Caminho completo | Dados de teste identificados | Finalidade; presentes no site compilado? |
| --- | --- | --- |
| `GS_Site-main/tests/editorial-catalog.test.mjs` | `newTag` (“Controle social”), `newLesson` (“Lição de teste”), `newQuiz` e respostas “Correta/Incorreta”; `Map` simulado do armazenamento | Testar CRUD, vínculos, exclusão, rascunho, rota, validação e persistência. **Não** aparecem no portal por padrão |
| `GS_Site-main/tests/local-state.test.mjs` | Resultados de quiz e notas sintéticos, datas e registros inválidos | Testar normalização e recuperação de armazenamento. Não aparecem no portal |
| `GS_Site-main/tests/progress.test.mjs` | Resultados artificiais e timestamps `data1`, `data2` | Testar tentativas e melhor pontuação. Não aparecem no portal |
| `GS_Site-main/tests/reading.test.mjs` | IDs de seções inválidos, datas e progresso artificiais aplicados a guias reais | Testar contagem, retomada, conclusão e exclusão. Não aparecem no portal |
| `GS_Site-main/tests/notes.test.mjs` | Guias/seções fictícios e textos “Primeiro comentário”, “Segundo comentário” | Testar isolamento e remoção de notas. Não aparecem no portal |
| `GS_Site-main/tests/preferences.test.mjs` | Preferências inválidas deliberadas | Testar normalização segura. Não aparecem no portal |
| `GS_Site-main/tests/routes.test.mjs` | Caminhos fictícios `/guia/falso`, `/login`, `/admin/usuarios` | Confirmar retorno de página não encontrada. Não aparecem no portal |
| `GS_Site-main/tests/content.test.mjs` | Lista fixa de domínios oficiais aceitos, dados reais de `guides` e `questions` | Verificação editorial e de estrutura; os domínios são parâmetros do teste, não simulações de API |
| `GS_Site-main/tests/motion.test.mjs` | Coordenadas esperadas e deslocamentos dos 16 pontos | Comparação da geometria com os assets; não é conteúdo editorial |
| `GS_Site-main/tests/ui.test.mjs` | Expressões regulares e trechos de estilos/JSX esperados | Verificação de estrutura e comportamentos, não um mock de banco/API |

### E. Resultado do rastreamento

- **Não há usuários fictícios populando uma lista**, nem nomes ou senhas de administradores, banco, fake JWT, API falsa, indicadores governamentais numéricos simulados ou resultados pré-preenchidos nos estados iniciais examinados.
- **Há conteúdo editorial estático**, em vez de uma API de conteúdo: 14 guias, 84 perguntas, 5 assuntos, 5 imagens de assunto, imagens e blocos didáticos locais. Os fatos devem continuar sujeitos a revisão e confirmação editorial externa, independentemente de serem estáticos.
- **Há estados de navegação/edição locais reais**, isolados por navegador e sem controle de acesso; o próximo desenvolvedor não deve confundi-los com serviços remotos.
- **Há fixtures inventados** apenas em `tests/`; são intencionais e não integram os dados exibidos em produção.
- Os **textos de interface** que explicam ações, erros, acessibilidade e navegação são cópia de produto. Não se deve migrá-los automaticamente como tabelas de dados.

## Ordem recomendada de substituição por API

1. Separar identidade/permissões do `/admin` e proteger endpoints de escrita **no servidor**.
2. Prover `topics`, `tags`, `lessons`, `quizzes` e `questions` em endpoints versionados; manter IDs existentes de lições e guias associados.
3. Importar/exportar o catálogo V1 com verificação de unicidade de slug, existência de relacionamentos e ordem de alternativas.
4. Adaptar `src/repositories/localEditorialRepository.js` e `src/hooks/useEditorialCatalog.js` para carregamento assíncrono, estados de carregamento/erro, autorização e persistência remota. Evitar substituir os fixtures por chamadas HTTP dentro dos componentes.
5. Migrar `guides` e `sources` para entidades da API **depois** de definir o esquema editorial de seções/blocos e a revisão de referências oficiais.
6. Tratar dados de usuários (histórico, notas, progresso) separadamente, mediante política de privacidade e autenticação quando introduzidas.
7. Substituir curadoria fixa e imagens externas somente se fizer parte do escopo do CMS. Testar links diretos, lições não publicadas, exclusões e migrações de dados legados.

Consulte `GS_Site-main/docs/CONTRATO_INTEGRACAO_API.md` para campos, invariantes e pontos de integração.
