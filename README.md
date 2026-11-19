# Ponto Público

Portal editorial independente dedicado a explicar informações públicas brasileiras com linguagem acessível, referências oficiais e atividades opcionais de revisão. Não é um portal governamental, um veículo de notícias ou uma plataforma de cursos.

## Requisitos

- Node.js 22 ou superior
- npm 10 ou superior

## Executar

```bash
npm ci
npm run dev
```

O endereço local padrão é `http://localhost:5173/`.

Para executar as verificações e visualizar a compilação de produção:

```bash
npm test
npm run build
npm run preview
```

A prévia compilada utiliza normalmente `http://localhost:4173/`.

## Estrutura

| Caminho | Responsabilidade |
| --- | --- |
| `src/app` | Composição global, navegação e resolução de páginas |
| `src/pages` | Páginas do portal |
| `src/components` | Interface compartilhada, administração, leitura e biblioteca pessoal |
| `src/data` | Acervo editorial estático e inicialização do catálogo de gestão |
| `src/repositories` | Persistência editorial local, substituível por API |
| `src/hooks` | Navegação, preferências e persistência local |
| `src/lib` | Funções de domínio sem dependência de React |
| `src/styles` | Estilos separados por responsabilidade |
| `public` | Marca, favicons e recursos estáticos |
| `tests` | Regressões de conteúdo, navegação, leitura e interface |
| `docs` | Arquitetura, manutenção e critérios de segurança |

O conteúdo editorial fica em `src/data/guides.js` e as 84 perguntas em `src/data/questions.js`. O ponto de acesso comum aos dados é `src/data/content.js`.

## Áreas do portal

- `/home`: apresentação editorial e acesso aos guias.
- `/assuntos`: categorias e busca por temas.
- `/guia/:slug`: textos, fontes, índice, notas e progresso por seção.
- `/licoes`: atividades opcionais de revisão, com explicações por resposta.
- `/user`: Minhas leituras, favoritos, histórico, resultados e exportação de dados.
- `/admin`: cadastro, edição e exclusão de tags, lições e quizzes, notas por guia, exportação JSON e restauração do acervo inicial.

As preferências e a atividade do visitante são armazenadas exclusivamente no navegador. Não há contas, sincronização, banco de dados ou serviço de publicação. A rota `/admin` não possui autenticação. Alterações de lições e quizzes aparecem nas rotas públicas **somente neste navegador**, sem envio a servidor; observações dos guias não modificam o texto dos guias. Não publicar o painel como administração remota sem backend e permissões.

## Testes e auditoria

```bash
npm test
npm run audit:prod
npm run audit:all
```

Os alertas conhecidos de desenvolvimento relacionados ao `picomatch` permanecem documentados em `docs/SEGURANCA.md`. Não execute `npm audit fix --force` sem avaliar e testar as mudanças de versão.

A entrega contém código-fonte e recursos gráficos. Quando fornecida com histórico Git, os commits são locais. Nenhum repositório remoto foi modificado. Antes da publicação, conferir rotas diretas no serviço de hospedagem, licenças das imagens, fontes oficiais, navegação por teclado, responsividade e funcionamento real no navegador.

Comece por `LEIA_PRIMEIRO.md`. Leia também `docs/ARQUITETURA.md`, `docs/CONTRATO_INTEGRACAO_API.md`, `docs/INVENTARIO_DADOS_E_MOCKS.md` e `docs/VALIDACAO.md` antes de integrar API ou alterar o acervo. O inventário classifica cada origem local, seus consumidores e os fixtures dos testes, com caminhos completos a partir de `GS_Site-main/`.
