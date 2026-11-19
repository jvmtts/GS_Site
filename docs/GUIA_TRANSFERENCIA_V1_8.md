# Transferência para integração com API e banco — V1.8.0

## Ponto de partida

Projeto real em `GS_Site-main`, React 19 + Vite 8 + Tailwind 4, com rotas `/home`, `/assuntos`, `/guia/:slug`, `/licoes`, `/licoes/:slug`, `/licoes/:slug/quiz`, `/user` e `/admin`. Preservar identidade, movimento dos 16 pontos, cantos retos e conteúdo editorial existente.

## O que está pronto no front-end

- CRUD de tags com unicidade de slug, vínculo e desvínculo de lições.
- CRUD de lições (inclusive independentes de um guia), status local de rascunho/visível, relacionamento com assunto, guia e tags.
- CRUD de quizzes (um quiz por lição) com perguntas, alternativas, resposta correta, explicação e limitação de 2–5 opções.
- Exibição e execução pública local de lições/quizzes marcados visíveis; notas pessoais, histórico e pontuação existentes preservados.
- Catálogo salvo em `pp-editorial-catalog-v1` no `localStorage`, exportação JSON, restauração do catálogo original e recuperação de snapshots inválidos.
- Testes de domínio e regressão documentados em `docs/VALIDACAO.md`.

## Ordem proposta de trabalho

1. Testar build V1.8.0 no Windows, realizar QA do `/admin` no navegador e ajustar eventuais problemas constatados.
2. Definir modelos reais de `tag`, `topic`, `lesson`, `quiz`, `question`, `guide`, `section`, `source` e relações de integridade; confrontar com `docs/INVENTARIO_DADOS_E_MOCKS.md`.
3. Criar API versionada, validação no servidor, autenticação, autorização e trilha editorial.
4. Adaptar `src/repositories/localEditorialRepository.js` e `src/hooks/useEditorialCatalog.js` para operações remotas assíncronas (sem alterar os formulários diretamente).
5. Importar acervo inicial de forma idempotente; preservar IDs e slugs legados para não perder histórico, leitura e resultados.
6. Avaliar multiusuário, sincronização e importação de dados, antes de remover qualquer suporte local existente.
7. Homologar acessibilidade, imagens documentais, fontes oficiais e política de privacidade antes da publicação pública.

Não há API real, banco, login ou CMS remoto implementados nesta versão. O botão “Exportar catálogo” é apenas um mecanismo local de portabilidade de JSON.
