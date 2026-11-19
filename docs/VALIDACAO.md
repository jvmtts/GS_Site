# Validação — Ponto Público V1.8.0

## Origem do código e escopo

Base utilizada: `Ponto_Publico_GS_Site_v1_7_0_Codigo_Limpo.zip`, derivada da integração anterior à estrutura `GS_Site-main`. A alteração V1.8.0 acrescenta ao `/admin` cadastro, edição e exclusão de tags, lições e quizzes, validação de relações, persistência local, exportação JSON, reinicialização do acervo e consumo das alterações pelas páginas de lições e exercícios.

O conteúdo original foi preservado como fonte do catálogo inicial: 14 guias, 84 questões e cinco assuntos. A interface e seus dados de administração **não** são uma API, nem controlam banco, autenticação ou aprovação institucional.

## Verificações executadas nesta entrega

- `node --test`: **55/55 testes aprovados**, incluindo sete testes novos do catálogo editorial.
- `node scripts/check-static.mjs`: **269/269 verificações aprovadas** de imports relativos, arquivos estáticos e marca.
- Análise sintática de **65 arquivos JS/JSX** com o parser TypeScript instalado no ambiente: **zero erros**.
- Validação de **10 arquivos CSS** com `tinycss2`: **zero erros de parsing**; `package.json` e `package-lock.json` estão ambos na versão 1.8.0.
- Teste de relações no catálogo: inclusão de tag, associação a lição, cadastro de quiz, edição, exclusão em cascata, impossibilidade de duplicação de slug, respostas inválidas, rascunhos não públicos e recuperação de armazenamento malformado.

## Limitações verificadas

O registro npm não estava disponível no ambiente de geração. A instalação do Vite não foi concluída; portanto, **não foi executado nesta sessão o `npm run build` nem uma homologação visual integrada da V1.8.0**. O build anteriormente comprovado no Windows pertencia à V1.6.1, e não substitui essa etapa. A auditoria de segurança completa também depende da instalação local das dependências.

## Checklist de homologação no Windows

```powershell
npm ci
npm test
npm run build
npm run preview
npm run audit:prod
npm run audit:all
```

Validar manualmente na prévia compilada, com teste claro e escuro, em 320, 390, 768 e 1440 px:

1. `/admin > Tags`: cadastrar tag, recarregar, editar nome e descrição, vincular a uma lição, excluir e verificar desvinculação.
2. `/admin > Lições`: criar lição sem guia, atribuir assunto e tag, salvar rascunho, confirmar que não aparece em `/licoes`; mudar para visível e confirmar que abre em URL própria.
3. `/admin > Quizzes`: selecionar a nova lição, criar quiz com alternativas, marcar a correta, preencher explicação, publicar e responder pela rota `/licoes/:slug/quiz`.
4. `/admin`: editar item existente, alterar pergunta, confirmar feedback explicativo e pontuação; excluir quiz e verificar que a lição permanece acessível sem link quebrado.
5. Excluir lição com quiz vinculado e verificar remoção dos dois; exportar catálogo JSON e conferir quantidade de itens, restabelecer acervo inicial com confirmação explícita.
6. Recarregar navegador e confirmar permanência dos dados; conferir novamente após alternância de tema; executar navegação por teclado e zoom.
7. `/home`, `/assuntos`, `/guia/orcamento-publico`, `/user`: validar que dados de leitura, notas, salvos e histórico continuam funcionais.
8. Conferir uso de `prefers-reduced-motion`, ausência de mensagens de erro no console e retorno/avanço do navegador. Revisar impacto visual e legibilidade.

## Observações de segurança

Há alertas conhecidos nas ferramentas de desenvolvimento herdados das versões anteriores. Não se deve fazer downgrade forçado do Vite sem testar a compatibilidade. O status de auditoria de produção anterior não garante a situação após novas instalações. A rota `/admin` não é protegida e não deve ser exposta como administração remota de produção.
