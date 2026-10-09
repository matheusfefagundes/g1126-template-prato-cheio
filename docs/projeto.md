# Documento de Projeto — Prato Cheio

*Trabalho 2 · máximo 4 páginas (fora diagramas) · entrega na Aula 10*

## Decisões de projeto
| # | Decisão | Alternativas | Requisito/risco da Análise que a motiva |
|---|---|---|---|
| 1 | Como garantir que só uma ONG aceita a doação | **A (escolhida)** `UPDATE ... WHERE status='disponivel'` atômico, como hoje em `src/repositorio.js`. B: reserva temporária com prazo, confirmada depois. | Regra de Unicidade de Aceite; risco do perecível vencer antes da coleta. |
| 2 | O que fazer com a doação vencida | A: filtrar na consulta (`validade >= hoje`). **B (escolhida)** mudar o status para `expirada`. | Regra de Expiração do Alimento; Objetivo de impacto 1 (% de doações que expiram sem coleta). |
| 3 | Como o PostgreSQL vai subir na Unidade 3 | **A (escolhida)** instalado ou em contêiner local. B: serviço gerenciado gratuito (Neon, Supabase, Render). | Restrição de orçamento quase zero da Marta; dependência externa (disponibilidade e limites de plano de terceiros). |

**Por que escolhemos:**
- Decisão 1: Optou-se pelo `UPDATE` condicional atômico, em vez de reserva temporária, pela simplicidade: uma única instrução SQL faz valer a Regra de Unicidade de Aceite, sem estado extra, prazo nem rotina de liberação. Como o alimento é perecível e o Objetivo 3 mede o tempo entre publicação e aceite, mantemos o aceite direto. O custo é que o aceite é definitivo: se a ONG aceita e depois não aparece para buscar, nenhuma outra ONG consegue pegar a doação e o alimento vence parado, concretizando o risco do perecível apontado na Análise. Validamos pelo teste do segundo aceite em `tests/doacoes.test.js`.
- Decisão 2: Optou-se por mudar o status para `expirada`, em vez de apenas filtrar na consulta, por duas razões: (1) permite contar as "doações expiradas sem coleta", métrica do Objetivo 1, e (2) deixa no banco um registro do que foi descartado, útil para auditoria e para a rastreabilidade que a Vigilância Sanitária exige. O custo é código e testes a mais, pois algo precisa mudar o status no momento certo, e o custo depende do mecanismo que o grupo escolher ao implementar: com uma rotina agendada, existe uma janela entre o vencimento e a próxima execução em que a doação vencida ainda aparece na lista e uma ONG pode fazer uma viagem perdida; com uma verificação a cada listagem, não há essa janela, mas cada consulta passa a fazer uma escrita a mais. Uma doação `expirada` não pode ser aceita, e o `WHERE status='disponivel'` da Decisão 1 já garante isso. Validaremos ao implementar, publicando uma doação com validade de ontem e conferindo que ela não aparece na lista.
- Decisão 3: Optou-se por instalar o PostgreSQL localmente, em vez de usar um serviço gerenciado, para não depender de disponibilidade e limites de planos gratuitos de terceiros. O custo é o trabalho de configuração: cada integrante precisa instalar e configurar o PostgreSQL na própria máquina, o que abre espaço para o "na minha máquina funciona", e o CI (GitHub Actions) passa a exigir um serviço de banco; o bloco comentado em `.github/workflows/ci.yml` já prevê isso. Validaremos na Unidade 3, com o critério: `DATABASE_URL` alcançável, schema migrado e CI verde.

## Tabela de trade-offs (uma decisão em detalhe)
Decisão 2: doação vencida.

| Critério | A) Filtrar na consulta | B) Status `expirada` |
|---|---|---|
| Complexidade de implementar | uma condição no SQL | rotina agendada ou verificação ao consultar |
| Medir o Objetivo 1 (expiradas sem coleta) | não registra quantas expiraram | permite contar |
| Risco da viagem perdida | some da lista na hora | some só depois que a rotina roda (se for rotina agendada) |
| Quem paga a conta | o objetivo de impacto fica sem medida | o time, com mais código e mais testes |

## Diagramas
(contexto + dados ou componentes — em `docs/` ou como imagem)

## ADRs
- [ADR 0001 — Migração de SQLite para PostgreSQL na Unidade 3](adr/0001-migracao-postgresql.md) — `aceito`, formaliza a Decisão #3 acima.

## Requisitos não-funcionais
| Requisito | Como afeta o design |
|---|---|
| Quando uma ONG lista as doações disponíveis em qualquer momento da janela de retirada, o sistema responde em até 2 segundos, medido por 10 chamadas manuais a `GET /api/doacoes` cronometradas pelo relógio do celular, sem nenhuma acima de 2s. | Nasce da restrição de orçamento quase zero da Marta (sem CDN ou cache pago) e do caso (voluntário com conexão instável no celular). Afeta a Decisão #3/ADR 0001: ficar em um único PostgreSQL local, sem camada extra de cache, é só sustentável se a consulta simples (`SELECT ... WHERE status='disponivel'`) já for rápida o bastante sozinha — custo: se não for, o grupo paga com uma camada de cache que hoje não está no escopo. |
| Quando o grupo troca o banco de SQLite para PostgreSQL (ADR 0001), o sistema mantém o comportamento das histórias #6, #7 e #8 inalterado, medido pelos 6 testes de `tests/doacoes.test.js` passando sem nenhuma alteração de asserção, só trocando a conexão em `src/db.js`. | Decorre diretamente do ADR 0001 (Critério de validação). Afeta a Decisão #3: é o que justifica a abstração `query()`/`{rows}` já existir em `src/db.js` hoje — custo: qualquer função de `src/repositorio.js` que algum dia usar SQL específico do SQLite (ex.: `datetime('now')`) precisa de ajuste de dialeto na migração, sob pena de quebrar esse critério. |
| Quando o `node:sqlite` muda de comportamento entre versões do Node (risco já registrado em `docs/analise.md`), o sistema continua funcionando sem intervenção, medido por `npm test` passando 6/6 tanto em Node 22 (CI) quanto na versão local de cada integrante, antes da migração para PostgreSQL estar pronta. | Nasce do risco "`node:sqlite` é experimental" do `docs/analise.md`. Afeta o ADR 0001 (Contexto): é a justificativa de por que a migração é necessária e não apenas desejável — custo: enquanto a migração não acontece, o grupo paga rodando esse teste de compatibilidade manualmente a cada atualização de Node, como já foi feito em 08/09. |

## Critérios de validação do projeto
1. **(Sim/Não)** O ADR 0001 existe em `docs/adr/0001-migracao-postgresql.md` e está linkado na seção `## ADRs` acima. — Fonte: `docs/projeto.md` > ADRs.
2. **(Sim/Não)** O critério de validação do ADR 0001 cita `DATABASE_URL` alcançável, schema migrado e CI verde, igual ao que o `README.md` já promete para a Unidade 3. — Fonte: `docs/adr/0001-migracao-postgresql.md` > Critério de validação; `README.md` > "O banco: SQLite agora, PostgreSQL depois".
3. **(Sim/Não)** O bloco de serviço `postgres` em `.github/workflows/ci.yml` já existe comentado, pronto para ser ativado na Unidade 3. — Fonte: `.github/workflows/ci.yml`, linhas 14-36.
4. **(Sim/Não)** Cada decisão da tabela `## Decisões de projeto` cita um requisito ou risco de origem na Unidade 1. — Fonte: `docs/projeto.md` > Decisões de projeto, coluna "Requisito/risco da Análise".
5. **(Sim/Não)** Os 6 testes de `tests/doacoes.test.js` continuam passando no CI atual (antes de qualquer mudança de banco). — Fonte: GitHub Actions, check `build-e-testes` no commit mais recente de `main`.
6. **(Sim/Não)** Cada um dos 3 requisitos não-funcionais acima tem uma medida numérica ou observável, não um adjetivo solto. — Fonte: `docs/projeto.md` > Requisitos não-funcionais, coluna "Requisito".
7. **(Sim/Não)** A Regra de Expiração do Alimento, citada como pendente na Retrospectiva 1, ainda não tem código — isso está declarado como próximo passo, e não escondido. — Fonte: `docs/retrospectivas/retrospectiva-1.md` > Próximos passos; `README.md` > "O que já está pronto e o que falta".

### Fragilidades apontadas pelo revisor interno
1. **Observação candidata (Claude):** não existe diagrama de dados ou de componentes em `docs/diagramas/` — a seção `## Diagramas` deste documento está vazia, então ninguém de fora consegue visualizar o schema antes ou depois da migração sem ler o código.
   - **Resposta do time:** **aceita como limitação.** Fica registrado como fraqueza conhecida desta iteração, sem correção agora: a seção `## Diagramas` segue vazia e não há `docs/diagramas/`. Como o Trabalho 2 é entregue na Aula 10, o diagrama (contexto + dados) é tarefa da próxima iteração, antes da entrega — e até lá quem de fora quiser ver o schema precisa ler `src/db.js` e `src/repositorio.js`.
2. **Observação candidata (Claude):** o CI hoje só roda contra SQLite em memória — o ADR 0001 promete `npm test` verde contra PostgreSQL, mas essa prova automatizada ainda não existe; o critério de validação do ADR está declarado, não comprovado.
   - **Resposta do time:** **aceita como limitação.** Fica registrado como fraqueza conhecida, sem correção agora: a prova automatizada só pode existir depois da refatoração de `src/db.js`, que é da Unidade 3 — hoje `DATABASE_URL` é ignorado pelo código, então descomentar o serviço `postgres` de `.github/workflows/ci.yml` agora quebraria o pipeline em vez de provar algo. O que já existe como preparação é o bloco comentado (`postgres:16-alpine` + `DATABASE_URL`) nas linhas 14-36 do workflow. Até a migração, o critério de validação do ADR 0001 permanece declarado, não comprovado.

## Uso de IA
Nível "IA para consulta" (Aula 06): a IA comparou alternativas e revisou o raciocínio. A escolha das decisões e as justificativas são do grupo.
