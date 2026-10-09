# Retrospectiva da Iteração 2

- **Data:** 08/10/2026 · **Grupo:** Matheus Ferreira Fagundes, Lucas Klug Sebastião, Kauã Martins Bassan

## O que decidimos nesta iteração
- **ADR 0001 — migração de SQLite para PostgreSQL na Unidade 3:** entre as três formas de o PostgreSQL subir, escolhemos a **alternativa 2 (instalado ou em contêiner local)**, rejeitando serviço gerenciado gratuito (Neon, Supabase, Render) para não trocar a dependência de uma API experimental (`node:sqlite`) pela dependência de disponibilidade e limites de um plano de terceiro. A migração em si é requisito dado pela disciplina; o ADR decide só como o banco sobe.
- **Revisão do ADR com a exigência da Vigilância Sanitária:** em aula ficou exigido `pg_dump` mensal para fiscalização. A exigência **reforça** a alternativa 2 (em serviço gerenciado, backup/export completo costuma ser restrito ao plano pago) e acrescenta um custo novo, agora registrado em `## Consequências`: trabalho manual recorrente de rodar o `pg_dump` e entregar o arquivo — sem dono definido e sem automação.
- **Requisitos não-funcionais e critérios de validação do Trabalho 2:** três RNF com medida observável (latência ≤ 2s em 10 chamadas, os 6 testes verdes sem mudar asserção na troca de banco, `npm test` 6/6 em Node 22 e 24) e sete critérios de validação em Sim/Não, todos com fonte citada.
- **Checklist de fragilidades do revisor interno** em `docs/projeto.md`, com a resposta do time para cada uma (opção: corrigida / aceita como limitação / contestada).

## O que funcionou
- Registrar a revisão de 08/10 como seção datada no ADR, em vez de reescrever o texto original, deixou visível **o que mudou, por quê e o que continuou valendo** — exatamente o que um ADR precisa mostrar para quem lê meses depois.
- `src/db.js` já isolar `query()`/`{rows}` desde a Unidade 1 fez a Decisão #3 e o ADR custarem quase nada de código: a discussão toda foi de projeto, não de refatoração emergencial.
- A revisão feita por quem não escreveu o checklist: as duas fragilidades apontadas eram reais (diagrama ausente; CI sem prova contra PostgreSQL) e as respostas do time puderam ser honestas — as duas registradas como **aceita como limitação**, sem fingir que estava tudo certo.

## O que mudaríamos
- Publicar o diagrama **junto** com o ADR, em vez de deixar a seção `## Diagramas` vazia e só descobrir isso na revisão.
- Decidir junto com o ADR **quem roda o `pg_dump` mensal** da Vigilância Sanitária — a exigência chegou na mesma aula e a resposta ficou "falta decidir", que é adiar, não decidir.
- Ativar o bloco do `postgres` no CI e provar o critério do ADR **na primeira iteração em que o assunto aparece**, em vez de deixar tudo declarado até a Unidade 3.

## Próximos passos (para a próxima iteração)
- Criar `docs/diagramas/` (diagrama de contexto + dados, com o schema antes e depois da migração) e linkar na seção `## Diagramas` de `docs/projeto.md` — fecha fragilidade 1.
- Definir dono, data e rotina do `pg_dump` mensal exigido pela Vigilância Sanitária.
- Unidade 3: refatorar `src/db.js` para PostgreSQL, descomentar o serviço em `.github/workflows/ci.yml` e rodar os 6 testes sem alterar asserção — fecha fragilidade 2 e comprova o critério do ADR 0001.
- Regra de Expiração do Alimento, pendente desde a Retrospectiva 1 e ainda sem código.

## Autoavaliação de contribuição
Distribuam 100 pontos entre os integrantes conforme a contribuição desta iteração
(inclui código, análise, documentação, revisão de PR). Cada integrante assina.

| Integrante | Pontos | O que fez de mais relevante |
|---|:--:|---|
| Matheus Ferreira Fagundes | 55 | Escreveu o ADR 0001 inteiro (contexto, alternativas, decisão, consequências, riscos), a revisão de 08/10 com a exigência da Vigilância Sanitária, os 3 requisitos não-funcionais e os 7 critérios de validação em `docs/projeto.md` (commit `4a09a71`). |
| Lucas Klug Sebastião | 45 | Fez a revisão interna de fora do checklist: apontou e escreveu as 2 fragilidades e as respostas do time em `docs/projeto.md`, escreveu esta retrospectiva e preparou o comentário de fragilidades para o PR. |
| Kauã Martins Bassan | 0 | Faltou à reunião de 08/10/2026 — nenhuma contribuição registrada nesta iteração. |

**Total: 100**
