# ADR 0001 — Migração de SQLite para PostgreSQL na Unidade 3

- **Data:** 08/10/2026
- **Status:** aceito

## Contexto
Na Unidade 1 e na Unidade 2 o Prato Cheio roda sobre SQLite, usando o módulo embutido `node:sqlite` (`DatabaseSync`), que não exige nada além do Node instalado — decisão correta para o walking skeleton, onde o custo de setup precisava ser zero. Duas restrições, porém, já apontam para a troca:

1. `node:sqlite` é uma API experimental do Node 22+. `docs/analise.md` (seção Riscos) já registra esse risco; o experimento realizado em 08/09 confirmou que os testes passam tanto em Node 22 (CI) quanto em Node 24 (local), mas isso não elimina o fato de a API poder mudar de comportamento entre versões — é uma dependência de algo ainda instável.
2. O próprio desenho da disciplina exige a migração: o `README.md` ("O banco: SQLite agora, PostgreSQL depois") já declara que a Unidade 3 usa PostgreSQL, com a troca registrada em ADR na Unidade 2 e executada como refatoração na Unidade 3, provando com os testes existentes que o comportamento se manteve.

A migração em si não é decidida aqui — ela é um requisito dado. O que este ADR decide é **como o PostgreSQL vai subir** (instalado, em contêiner, ou como serviço gerenciado de terceiro), decisão que `src/db.js` já foi desenhado para isolar: ele expõe `query(sql, valores)` devolvendo sempre `{ rows }`, então a troca de driver fica contida nesse arquivo e não vaza para `src/repositorio.js` nem para as regras de negócio em `src/doacoes.js`.

## Alternativas consideradas
1. **Ficar em SQLite indefinidamente (não migrar)** — prós: zero custo de setup, já funciona, nenhum integrante precisa instalar nada a mais. Contras: descumpre o requisito explícito da disciplina para a Unidade 3; mantém indefinidamente a dependência de uma API experimental (`node:sqlite`) em vez de um banco relacional maduro; SQLite de arquivo único não reflete o ambiente de produção que um piloto real exigiria.
2. **PostgreSQL instalado ou em contêiner local** — prós: nenhuma dependência de disponibilidade ou de limite de uso de um serviço de terceiro; o grupo controla totalmente o ambiente; sem custo financeiro. Contras: cada integrante precisa instalar e configurar o PostgreSQL na própria máquina, com risco de "na minha máquina funciona"; o CI (GitHub Actions) passa a precisar subir um serviço de banco a cada execução.
3. **PostgreSQL gerenciado (Neon, Supabase, Render, plano gratuito)** — prós: nenhuma instalação local, qualquer integrante acessa o mesmo banco compartilhado, configuração mais rápida no início. Contras: depende da disponibilidade e dos limites de uso do plano gratuito de um serviço externo, fora do controle do grupo; risco de o plano mudar ou expirar durante o semestre.

## Decisão
Optamos pela **alternativa 2: PostgreSQL instalado ou em contêiner local**. Essa já era a Decisão #3 registrada em `docs/projeto.md` (Aula 06); este ADR a formaliza. A razão central é não trocar uma dependência (API experimental do SQLite embutido) por outra (disponibilidade e limites de um serviço gratuito de terceiro que o grupo não controla) — preferimos pagar o custo de configuração local, que é previsível e está sob controle do grupo, a um risco externo que pode aparecer sem aviso durante o semestre. Ficar em SQLite (alternativa 1) não é viável porque contraria um requisito explícito da disciplina para a Unidade 3.

## Consequências
- **Positivas:** nenhuma dependência de terceiro para o banco rodar; nenhum custo financeiro; ambiente totalmente sob controle do grupo, sem risco de o serviço externo mudar de política durante o semestre.
- **Negativas / o que abrimos mão:** cada integrante do grupo (Matheus, Lucas, Kauã) precisa instalar e configurar o PostgreSQL na própria máquina antes de rodar o projeto localmente — quem não o fizer corretamente paga o preço de divergências do tipo "na minha máquina funciona". O CI deixa de ser "sem serviço nenhum" (como hoje, com SQLite em memória) e passa a depender de subir e aguardar a saúde de um serviço `postgres` a cada execução, o que torna o pipeline mais lento e com mais uma peça que pode falhar.
- **Riscos e o que fazer se der errado:** se a configuração local divergir entre as máquinas do grupo (versão do PostgreSQL, charset, etc.), o sintoma mais provável é um teste passando para um integrante e falhando para outro; a mitigação é fixar a versão do PostgreSQL no `.github/workflows/ci.yml` (já previsto como `postgres:16-alpine` no bloco comentado) e documentar essa mesma versão no README quando a migração for executada na Unidade 3.

## Rastreabilidade
Atende ao risco "`node:sqlite` é experimental" registrado na tabela de Riscos de `docs/analise.md`, e formaliza a Decisão #3 ("Como o PostgreSQL vai subir na Unidade 3") já registrada em `docs/projeto.md`.

## Critério de validação
`DATABASE_URL` alcançável a partir do ambiente (local e CI), schema migrado via `src/db.js` reescrito para PostgreSQL, e `npm test` verde no CI contra esse banco — os mesmos três compromissos já descritos no `README.md`. "Testar bastante" não é critério: o critério concreto é esse comando (`npm test`) passando contra um PostgreSQL real, não mais contra SQLite.

## Revisão — 08/10/2026

**O que mudou no contexto:** em aula, foi anunciado que a Vigilância Sanitária passa a solicitar cópias do banco de dados mensalmente, para fins de rastreabilidade e fiscalização.

**O que continua valendo e por quê:** a decisão pela alternativa 2 (PostgreSQL instalado ou em contêiner local) se mantém e esse novo requisito, na verdade, reforça a escolha em vez de contrariá-la. Uma cópia completa do banco (`pg_dump`) é uma operação padrão de administração do PostgreSQL, disponível igualmente em qualquer das três alternativas originais; a diferença é que planos gratuitos de serviços gerenciados (alternativa 3: Neon, Supabase, Render) costumam restringir backup/export completo ao plano pago ou limitam a frequência de extração, o que colocaria em risco justamente a obrigação mensal agora exigida pela Vigilância Sanitária. Manter o banco local/em contêiner evita essa segunda dependência de terceiro, desta vez sobre uma obrigação regulatória, e não apenas sobre a disponibilidade do banco em si.

**O que cai/não se aplica mais:** nada do que já estava decidido cai. O que se acrescenta é um novo custo, antes não previsto: alguém do grupo precisa rodar `pg_dump` mensalmente e entregar o arquivo à Vigilância Sanitária — hoje isso não está automatizado nem atribuído a uma pessoa. Fica registrado aqui como consequência negativa adicional (ver `## Consequências`, que não é editado retroativamente): é trabalho manual recorrente, e falta decidir quem o executa e como.

**Referência a `src/db.js`:** continua válida, sem mudança de código necessária. `pg_dump` opera diretamente sobre o banco Postgres pela linha de comando, fora da aplicação não passa pela abstração `query()`/`{rows}` que `src/db.js` expõe para `src/repositorio.js`. Nenhuma divergência a declarar.
