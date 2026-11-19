# Segurança e privacidade

## Dependências

A auditoria fornecida no ambiente Windows da versão anterior identificou zero vulnerabilidades conhecidas nas dependências de produção (`npm audit --omit=dev`) e cinco alertas altos relacionados à cadeia de desenvolvimento `picomatch`, `fdir`, `tinyglobby`, `vite` e `@vitejs/plugin-react`.

Aviso relacionado: https://github.com/advisories/GHSA-fc5q-39xc-vjpf

As versões utilizadas foram preservadas na refatoração para evitar uma alteração incompatível sem homologação. Esse registro não representa correção da vulnerabilidade.

```bash
npm run audit:prod
npm run audit:all
```

Não usar `npm audit fix --force` sem avaliar as versões propostas, os testes e os efeitos no build. Ferramentas de desenvolvimento devem ser executadas localmente, sem exposição desnecessária da porta do Vite à internet.

## Dados pessoais

Histórico, favoritos, resultados, preferências e notas são registrados no navegador, sem autenticação ou sincronização. Os formulários não fazem envios para serviços próprios. O visitante pode exportar suas leituras e apagar os dados locais pela área Minhas leituras.

Os valores recuperados do armazenamento são normalizados antes de entrar no estado React. Textos fornecidos pelo usuário são renderizados como conteúdo, sem execução de HTML arbitrário.

## Painel editorial

`/admin` não é uma área protegida. O cadastro e a edição locais modificam lições e quizzes visíveis somente neste navegador, não registros de um servidor. A marcação `published` não representa aprovação editorial nem autorização de produção. As observações dos guias são armazenadas somente no navegador. Caso seja necessário um painel restrito, é preciso implementar autenticação, controle de autorização, backend, trilha de auditoria e persistência adequados antes de disponibilizá-lo em produção.

## Preparação para publicação

Conferir a política de hospedagem para rotas client-side, cabeçalhos de segurança, carregamento de imagens externas, atribuições e licenças, proteção de dados e comportamento da aplicação em navegadores reais. Os textos e as URLs oficiais precisam de revisão editorial periódica.
