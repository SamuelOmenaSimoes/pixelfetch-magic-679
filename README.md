# Top Fit — site e atendimento

Frontend e design preservados, planos por unidade, contatos oficiais, formulários persistentes e painel privado em `/admin`. Sem compra online: matrículas são solicitações concluídas pela equipe no WhatsApp.

## Executar

Requer Node.js 24.11 ou superior na linha 24.

```sh
npm ci
npm run setup
npm run dev
```

Setup gera uma senha aleatória, mostra uma única vez e salva apenas seu hash em `.env.local`. Guarde a senha; nunca publique esse arquivo, bancos ou backups. Para trocar: `npm run setup -- --rotate` e reinicie o servidor. A troca invalida sessões existentes.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
node scripts/smoke.mjs
```

Smoke usa dados sintéticos em pasta temporária, porta 4181. Verifica HTTP da versão compilada, autenticação, persistência após reiniciar, duplicidade, atualização e backup. Remove somente sua própria pasta.

## Publicação na Vercel

O build Vercel usa Nitro `vercel` e gera `.vercel/output/config.json`, arquivos públicos e uma função Node.js 24. O vercel.json substitui a configuração antiga que procurava `dist`. Não aponte o deploy apenas para arquivos estáticos: SSR e APIs usam a função.

1. Na Vercel, abra o projeto, vá a Storage/Marketplace e conecte um PostgreSQL (por exemplo, Neon). Escolha o plano conforme as condições do provedor, sem contratar serviços automaticamente. Use banco separado para Preview e Production.
2. Confira a variável **DATABASE_URL** fornecida pela integração (conexão pooled com SSL). Nunca use prefixo VITE_ nem publique a URL no GitHub/chat.
3. Execute `npm run setup` localmente e configure **TOPFIT_ADMIN_PASSWORD_HASH** nas variáveis seguras da Vercel. Guarde a senha exibida; copie somente o hash de .env.local. Configure **TOPFIT_SITE_URL** com a origem HTTPS real de produção, sem caminho.
4. Para aplicar as tabelas, em ambiente seguro configure DATABASE_URL do banco desejado e execute `npm run db:migrate`. Alternativamente execute migrations/001-attendance.sql no editor SQL do provedor. A migração é idempotente e não deve rodar durante build de Preview com credenciais de produção.
5. Faça redeploy da branch. O repositório define `npm ci`, `npm run build:vercel` e `.vercel/output`. Se houver override manual antigo, remova `dist` dos ajustes do projeto. Em Preview a origem permitida vem de VERCEL_URL; produção usa TOPFIT_SITE_URL.
6. Valide no endereço publicado: página inicial, unidades, envio real de solicitação, login /admin, leitura e atualização. Confirme persistência após novo deploy.

Na Vercel **não há fallback para SQLite**. Sem DATABASE_URL ou tabelas, o site e catálogo continuam disponíveis, mas formulários retornam erro controlado e nunca mostram pedido salvo. Não foi criado/conectado um banco na conta do proprietário, nem validado o deploy público.

Pedidos, sessões e limites usam PostgreSQL quando DATABASE_URL está configurada. Inserção usa transação e locks por solicitação/telefone para evitar duplicidade e corrida entre funções. O pool é limitado e não desativa validação TLS. Sessões duram 8 horas; cookies HttpOnly/SameSite Strict e Secure sob HTTPS.

## Desenvolvimento local e backups

Sem DATABASE_URL, fora da Vercel, o desenvolvimento continua usando SQLite. Build Node local: `npm run build`, seguido de `npm start`. O Dockerfile também usa Node local; não foi executado neste ambiente. Para PostgreSQL local, configure DATABASE_URL e execute a migração.

`npm run backup` é **exclusivo para SQLite**, com TOPFIT_DATA_DIR/TOPFIT_BACKUP_DIR. Para PostgreSQL, configure backups e recuperação no provedor e/ou pg_dump, mantenha cópia protegida e teste restauração. Não há backup remoto/agendamento automático implementado.

SQLite e PostgreSQL são bases distintas: esta mudança não copia registros existentes automaticamente. Nenhum dado de produção foi recebido. Se houver base SQLite real a migrar, preserve backup e planeje importação antes de trocar.

## Testes de deploy

`npm run build:vercel` e `node scripts/check-vercel.mjs` verificam pacote, runtime, SSR, catálogo e falha segura sem banco. A CI cria PostgreSQL 16 descartável e executa testes de gravação, login, persistência após reconectar, alteração/exclusão, concorrência, idempotência e limites. Localmente os testes PostgreSQL ficam ignorados sem TEST_DATABASE_URL; somente aceita banco topfit_test em localhost/127.0.0.1, nunca produção.

## Atendimento e limites

- São Jorge: 5592981643664, topfitsj@gmail.com.
- Santo Antônio: 5592981524570.
- Alvorada: 5592981691185.
- Experimental crossfit: 5592981643664.
- Instagram: @academiatopfitoficial.
- Primeiro mês: R$99,90 São Jorge/Santo Antônio; R$89,90 Alvorada. Novos/inativos, horário livre.

Catálogo central em src/data/topfit.ts, usado no frontend e validado no backend. Preços não são aceitos do navegador. Painel lista, filtra, atualiza e exclui pedidos. Não controla acesso à academia, renovação, cobrança ou matrícula ativa. Senha administrativa compartilhada; contas individuais, MFA e auditoria completa são evoluções para equipes maiores.

Horários de funcionamento e do CrossTopFit cadastrados conforme informações da academia. Domingo de Santo Antônio e Alvorada permanece não informado.

Pendentes de informação oficial: endereços, grade, mensalidades posteriores, prazo das ofertas, identificação completa do controlador e política de retenção. Não foram inventados. Textos de privacidade/atendimento descrevem a implementação e precisam dessa complementação antes de publicar. Imagens ilustrativas preservadas; logotipo recuperado do site original.

## Validação em 07/10/2026

10 testes passaram. TypeScript sem erros; lint sem erros, com 7 avisos de Fast Refresh. Build Node concluído. Smoke de produção local passou. Navegador: validação, matrícula Alvorada, experimental crossfit, links, seleção Santo Antônio, menu móvel/Escape e layout 390px verificados. Nenhuma mensagem enviada pelo WhatsApp.

Build Vercel e verificação do handler gerado passaram localmente. A publicação pública depende de criar/conectar o PostgreSQL, aplicar tabelas e configurar variáveis na conta Vercel. Não foi validada ao vivo.
