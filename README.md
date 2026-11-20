# Ponto Público

Portal editorial independente dedicado a explicar informações públicas brasileiras com linguagem acessível, referências oficiais e atividades opcionais de revisão. Não é um portal governamental, um veículo de notícias ou uma plataforma de cursos.

## Integração com a API — branch API

O catálogo de lições, perguntas, alternativas e tags utiliza a API Java da equipe, publicada em `https://ponto-publico.onrender.com`. Em desenvolvimento e na prévia, o frontend chama `/api`, que o Vite encaminha para o Render. É possível mudar o destino com `PONTO_API_URL` em `.env.local`. Para um frontend hospedado separadamente, configure um proxy `/api` na hospedagem ou use `VITE_API_URL` com o endereço do backend e libere a origem do site no CORS da API.

1. A API roda no Render. Não é necessário iniciar o Java ou manter a pasta do backend junto ao site.
2. Na pasta `GS_Site`, execute `npm run dev`. O comando inicia o Vite, que encaminha as chamadas para a API publicada. Mantenha o terminal aberto.
3. No `/admin`, cadastre tags, lições e perguntas. Para levar as 14 lições e as 84 perguntas do acervo para o banco, use **Importar acervo inicial**. A importação preserva os registros existentes e pode continuar depois de uma interrupção.
4. Em `/licoes`, os filtros de tags consultam `/lesson/getbytagsnames`. A busca do cabeçalho também encontra lições por título e tags.
5. Em `/user`, abra **Cadastro e inscrições** para criar ou selecionar um cadastro, atualizar nome/senha ou excluí-lo. Em uma lição, use **Inscrever-se nesta lição**.

A API atual não tem autenticação. A seleção de um cadastro serve para a demonstração de inscrições e não é um login. Use cadastros simulados. Favoritos, notas, histórico, preferências e resultados continuam sendo dados do navegador, pois não há endpoints para essas informações.

O campo `text` das lições aceita fragmentos HTML, como `<p>Uma explicação.</p>`, subtítulos, listas, negrito e links. A exibição usa DOMPurify com uma lista de tags permitidas. Textos simples antigos também são aceitos, e os resumos são exibidos como texto legível. O acervo inicial já é enviado em HTML.

A edição de títulos, textos e enunciados ficará para a próxima etapa. É possível adicionar e excluir perguntas. Tags são criadas e vinculadas/desvinculadas das lições. A API não oferece exclusão global de tag. Campos complementares de descrição, assunto, endereço, visibilidade e explicações são derivados do acervo quando existe um guia correspondente.

A integração mantém o catálogo local antigo no armazenamento do navegador. Os documentos de arquitetura V1.8 abaixo descrevem a versão local anterior. A camada remota ativa está em `src/repositories/apiEditorialRepository.js` e `src/hooks/useEditorialCatalog.js`.

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

## Publicar na Vercel

O arquivo `vercel.json` configura o build Vite, a saída `dist` e as rotas da hospedagem. Chamadas para `/api/*` são encaminhadas para `https://ponto-publico.onrender.com/*`; as demais rotas abrem o React, permitindo atualizar páginas como `/licoes` e `/user` sem erro 404.

Mantenha `VITE_API_URL` ausente ou com o valor `/api` nas variáveis da Vercel. O proxy de desenvolvimento de `vite.config.js` não configura a hospedagem de produção. Depois de enviar alterações ao repositório conectado, aguarde a nova publicação da Vercel.

## Estrutura

| Caminho | Responsabilidade |
| --- | --- |
| `src/app` | Composição global, navegação e resolução de páginas |
| `src/pages` | Páginas do portal |
| `src/components` | Interface compartilhada, administração, leitura e biblioteca pessoal |
| `src/data` | Acervo editorial estático e inicialização do catálogo de gestão |
| `src/repositories` | Acesso à API e suporte ao catálogo local anterior |
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
- `/admin`: cadastro de tags e lições, associação de tags, inclusão/exclusão de perguntas, notas por guia, exportação JSON e importação do acervo inicial.

As preferências, notas, favoritos, histórico e resultados de revisão ficam no navegador. Lições, perguntas, alternativas, tags, cadastros e inscrições utilizam a API Java. A rota `/admin` e os endpoints atuais não possuem autenticação. A configuração do Oracle pertence ao backend.

As instruções de execução da integração estão na seção acima. Os documentos `docs/ARQUITETURA.md`, `docs/CONTRATO_INTEGRACAO_API.md`, `docs/INVENTARIO_DADOS_E_MOCKS.md` e `docs/VALIDACAO.md` registram a base V1.8 anterior à integração e ajudam a localizar o acervo e as regras originais.
