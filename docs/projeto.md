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
Ver `docs/adr/`.

## Requisitos não-funcionais
| Requisito | Como afeta o design |
|---|---|

## Critérios de validação do projeto

## Uso de IA
Nível "IA para consulta" (Aula 06): a IA comparou alternativas e revisou o raciocínio. A escolha das decisões e as justificativas são do grupo.
