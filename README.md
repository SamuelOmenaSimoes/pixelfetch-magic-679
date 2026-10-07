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

## Publicação

Esta versão usa **Node.js com SQLite em disco persistente**, Nitro `node-server`. Não é pacote estático nem compatível diretamente com Cloudflare Workers/Lovable sem adaptar banco e runtime. O Dockerfile oferece alternativa para hospedagem Node; Docker não foi executado neste ambiente.

Configure as variáveis de `.env.example` no servidor. TOPFIT_SITE_URL precisa ser a origem pública HTTPS exata. TOPFIT_DATA_DIR deve ser um volume persistente fora da pasta pública. Copie o hash gerado pelo setup para o gerenciador de segredos da hospedagem; não use valores de exemplo como configuração final. Use uma instância com esse volume; múltiplas instâncias exigem estratégia de banco compartilhado.

Use HTTPS e restrinja o acesso ao volume. Sessões de 8 horas com HttpOnly/SameSite Strict, Secure sob HTTPS. APIs privadas exigem sessão, escrita exige origem autorizada, JSON limitado e validação. Limites globais de envios/login e por celular são proteção inicial; não substituem proteção de borda contra ataques distribuídos.

## Backup

`npm run backup` faz cópia consistente do SQLite. Configure TOPFIT_BACKUP_DIR fora da pasta pública. Agende na hospedagem e mantenha cópia protegida externa. O script é manual, sem agendamento ou armazenamento externo automático.

Para restaurar: pare o servidor; preserve cópia do banco atual e arquivos WAL/SHM; substitua o conjunto pelo backup como topfit.sqlite em TOPFIT_DATA_DIR, confirme permissões e reinicie. Teste restauração em ambiente separado antes de produção.

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

A versão pública não foi atualizada nem validada. Falta definir/acessar hospedagem, configurar domínio/HTTPS/volume/segredos e repetir os fluxos no endereço final.
