# Refatorações — Prato Cheio

*Trabalho 3 · uma seção por refatoração · o que importa é o motivo e a evidência*

## Refatoração 1 — Migração de SQLite para PostgreSQL

- **Motivo:** ADR 0001 (`docs/adr/0001-migracao-postgresql.md`) — o SQLite embutido (`node:sqlite`) é uma API experimental do Node, e a disciplina já exige PostgreSQL na Unidade 3. A hospedagem decidida no ADR (instalado/contêiner local) foi executada via Docker.
- **O que mudou:**
  - `src/db.js`: driver trocado de `node:sqlite` (`DatabaseSync`) para `pg` (`Pool`). `query()` continua devolvendo `{ rows }`. `migrar()` usa DDL do Postgres (`SERIAL`, `TIMESTAMPTZ`). `limparBanco()` troca o guard `ARQUIVO !== ':memory:'` (SQLite) por `!/_test$/.test(NOME_BANCO)` (Postgres não tem equivalente a `:memory:`; a convenção de nome `..._test` cumpre o mesmo papel, verificada sobre o alvo real de `DATABASE_URL`, não uma flag separada — mesmo raciocínio do ADR 0002).
  - `src/repositorio.js`: marcadores `?` → `$1, $2, ...` (dialeto do `pg`); `expirarVencidas()` usa `validade::date < (now() AT TIME ZONE 'UTC')::date` em vez de `validade < date('now')`.
  - `.github/workflows/ci.yml`: bloco `services.postgres` e `DATABASE_URL` descomentados; novo passo "Criar banco de teste" antes de `npm test`.
  - `scripts/criar-banco-teste.js` (novo): provisiona o banco `..._test`, usado por CI e localmente.
  - `tests/setup.js` e `tests/db-seguranca.test.js`: guard adaptado para `DATABASE_URL` (a asserção do teste de segurança não mudou, só a variável simulada).
  - `vitest.config.js`: `DATABASE_URL` do banco de teste + `fileParallelism: false` (um Postgres real compartilhado, ao contrário do `:memory:` isolado por processo, pode colidir entre arquivos de teste rodando em paralelo).
- **O que NÃO mudou:** `src/doacoes.js` (nenhuma regra de negócio) e `src/app.js` (nenhuma rota) não aparecem no diff — o contrato `query()`→`{rows}` absorveu toda a troca de banco. Os 16 testes existentes continuam com as mesmas asserções (só o teste de segurança teve a variável de ambiente simulada trocada de nome, não o comportamento esperado).
- **Evidência de que o comportamento se manteve:**
  - testes antes da mudança: 16 passando (SQLite)
  - testes depois da mudança: 16 passando (PostgreSQL real, via Docker)
  - link da execução do CI verde: https://github.com/matheusfefagundes/g1126-template-prato-cheio/actions/runs/42304869010/job/128191550837

## Refatoração 2 — Centralizar o tratamento de erro das rotas

- **Cheiro de código atacado:** duplicação — os 5 handlers de rota em `src/app.js` repetem o mesmo bloco `try { ... } catch (erro) { res.status(400).json({erro: erro.message}) }`, idêntico em todos.
- **Qual dor concreta isso resolvia:** a próxima rota nova precisa lembrar de copiar esse bloco certo; esquecer uma vez deixa uma rejeição sem tratamento (vira erro cru do Express em vez do contrato `{erro}`); mudar o formato do erro no futuro exigiria editar 5 lugares iguais em vez de 1.
- **O que mudou:** "Extraído comTratamentoDeErro() em src/app.js; os 5 handlers passam a centralizar o catch nessa função, mantendo cada um seu próprio código de sucesso (201 no POST de criação, por exemplo)."
- **Evidência (testes verdes antes e depois):** "16/16 testes passando antes e depois, nenhuma asserção mudou, só a estrutura interna do arquivo."

---

**Limitações e o que ficou de fora:** `vitest.config.js` roda os arquivos de teste em série (`fileParallelism: false`), porque agora todos compartilham o mesmo banco Postgres real — ao contrário do `:memory:` do SQLite, isolado por processo, um Postgres compartilhado deixa dois arquivos de teste em paralelo colidirem na mesma tabela. Decidimos corretude antes de velocidade por ora; se a suíte crescer muito, vale revisitar (schema por worker, por exemplo) — apontado na revisão do PR #8 por Kauã.
