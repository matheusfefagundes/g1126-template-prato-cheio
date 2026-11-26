# Validação — Prato Cheio

*Trabalho 3 · confronto do produto com os critérios de aceite escritos na Unidade 1*

Copie aqui os critérios de aceite do seu `docs/analise.md` e marque um por um. **Um "não atende" bem justificado vale mais que um "sim" sem evidência.**

| # | Critério de aceite (da Unidade 1) | Atende? | Evidência |
|:--:|---|:--:|---|
| 1 | Dado que o doador ainda não publicou nenhuma doação, Quando ele envia tipo, quantidade e validade preenchidos, Então a doação aparece na lista de disponíveis com status "disponível". | sim | teste `mostra a doação publicada na lista de disponíveis` (`tests/doacoes.test.js`) |
| 2 | Dado que o doador ainda não publicou nenhuma doação, Quando ele envia o formulário sem um dos campos obrigatórios (tipo, quantidade ou validade), Então o sistema recusa a publicação e nenhuma doação é criada. | sim | teste `recusa doação sem os campos obrigatórios` (`tests/doacoes.test.js`) |
| 3 | Dado que existe uma doação publicada e ainda não aceita, Quando a ONG consulta a lista de doações disponíveis, Então a doação aparece na lista. | sim | teste `mostra a doação publicada na lista de disponíveis` (`tests/doacoes.test.js`) |
| 4 | Dado que existe uma doação publicada e já aceita por uma ONG, Quando qualquer ONG consulta a lista de doações disponíveis, Então essa doação não aparece mais na lista. | sim | teste `remove a doação da lista de disponíveis depois de aceita` (`tests/doacoes.test.js`) |
| 5 | Dado que existe uma doação publicada e ainda não aceita, Quando uma ONG aciona "aceitar", Então a doação passa para o status "aceita" e fica associada àquela ONG. | sim | teste `marca a doação como aceita pela ONG` (`tests/doacoes.test.js`) |
| 6 | Dado que existe uma doação já aceita por uma ONG, Quando uma segunda ONG tenta aceitar a mesma doação, Então o sistema recusa o aceite (erro "Doação já reservada") e a doação permanece associada à primeira ONG. | sim | teste `recusa aceitar uma doação que já foi aceita por outra ONG` (`tests/doacoes.test.js`) |
| 7 | Dado que existe uma doação aceita, Quando a ONG marca como coletada, Então o status vira "coletada". | sim | teste `marca a doação aceita como coletada` (`tests/doacoes.test.js`) |
| 8 | Dado que uma doação está disponível e sua validade já passou, Quando alguém tenta aceitá-la, Então o sistema recusa e marca a doação como expirada. | sim | teste `recusa aceitar uma doação com validade vencida` (`tests/doacoes.test.js`) |
| 9 | H1-CA1 — Dado que a "Padaria Pão Bom" publicou duas doações e a "Casa Esperança" aceitou uma delas, quando a padaria consulta as suas doações, então vê as duas: uma disponível e outra aceita por Casa Esperança. | sim | teste `mostra as duas doações do doador, com a situação de cada uma` (`tests/doacoes.test.js`) |
| 10 | H1-CA2 — Dado que outro doador publicou uma doação, quando a "Padaria Pão Bom" consulta as suas, então essa doação não aparece. | sim | teste `não mostra doação de outro doador` (`tests/doacoes.test.js`) |
| 11 | H1-CA3 — Dado que o doador não é informado na publicação, quando a doação é enviada, então ela é recusada com uma mensagem clara e nada é gravado. | sim | teste `recusa publicar doação sem informar o doador` (`tests/doacoes.test.js`) |
| 12 | H2-CA1 — Dado que a "Casa Esperança" aceitou uma doação, quando o voluntário "Rui" confirma a coleta, então ela passa a coletada, com o nome do voluntário e o horário da coleta. | sim | teste `grava o voluntário e o horário da coleta` (`tests/doacoes.test.js`) |
| 13 | H2-CA2 — Dado que a doação ainda está disponível, quando alguém tenta confirmar a coleta, então a confirmação é recusada com mensagem e a doação não muda. | sim | teste `recusa confirmar coleta de doação ainda disponível` (`tests/doacoes.test.js`) |
| 14 | H2-CA3 — Dado que a doação foi coletada, quando o doador consulta as suas doações (H1), então ela aparece como coletada. | sim | teste `mostra a doação como coletada depois que o voluntário confirma (integração com H2)` (`tests/doacoes.test.js`) |
| 15 | H3-CA1 — Dado que a "Casa Esperança" aceitou uma doação, quando ela a devolve com o motivo "sem voluntário hoje", então a doação volta para a lista de disponíveis, sem ONG, e o motivo fica registrado. | sim | teste `devolve a doacao, que volta para a lista sem ONG, com o motivo gravado` (`tests/doacoes.test.js`) |
| 16 | H3-CA2 — Dado que a doação já foi coletada, quando a ONG tenta devolvê-la, então a devolução é recusada com mensagem. | sim | teste `recusa devolver uma doacao ja coletada` (`tests/doacoes.test.js`) |
| 17 | H3-CA3 — Dado que a "Casa Esperança" aceitou a doação, quando outra ONG tenta devolvê-la, então a devolução é recusada e a doação continua aceita pela Casa Esperança. | sim | teste `recusa devolver uma doacao aceita por outra ONG` (`tests/doacoes.test.js`) |
| 18 | H4-CA1 — Dado que, em um mês, 3 doações foram publicadas, 2 aceitas e 1 coletada 5 horas depois de aceita, quando a Marta consulta o resultado do mês, então vê 3 publicadas, 2 aceitas, 1 coletada e tempo médio até a coleta: 5h. | sim | teste `conta publicadas, aceitas e coletadas do mes, com tempo medio em horas` (`tests/doacoes.test.js`) |
| 19 | H4-CA2 — Dado um mês sem nenhuma coleta, quando a Marta consulta o resultado, então o tempo médio aparece como "sem coletas no mês" — não como zero, nem como erro. | sim | teste `mostra "sem coletas no mes" quando nao ha nenhuma coleta` (`tests/doacoes.test.js`) |
| 20 | H4-CA3 — Dado uma doação aceita num mês e coletada no mês seguinte, quando a Marta consulta cada mês, então ela conta no mês da coleta, não no da publicação/aceite (decisão do grupo, `docs/projeto.md` > Decisão 4). | sim | teste `conta a doacao coletada no mes da coleta, nao no da publicacao` (`tests/doacoes.test.js`) |

## Critérios que não atendem — por quê

Nenhum. Os 20 critérios de aceite (8 da Unidade 1 + 12 das histórias H1-H4 do Trabalho 3) têm hoje um teste automatizado real correspondente em `tests/doacoes.test.js`, passando no CI (`build-e-testes`) contra o PostgreSQL real.

## Mudanças de critério ao longo do semestre

Nenhum critério da Unidade 1 se mostrou errado — mas o produto cresceu além deles sem que `docs/analise.md` fosse atualizado na hora: a história "voluntário marca a doação como coletada" (Trabalho 2) e a Regra de Expiração do Alimento (Aula 11) já tinham teste desde que foram implementadas, mas só ganharam critério formal em Dado/Quando/Então em `docs/analise.md` na atividade da Aula 13 (Lucas e Kauã, respectivamente). Essa lacuna já foi corrigida; os critérios 9-20 acima (H1-H4, Trabalho 3) nunca existiram em `docs/analise.md` por não fazerem parte da Unidade 1 — ficam documentados aqui, na validação do Trabalho 3, com a mesma evidência exigida dos demais.

## Limitações do produto

- Identificação de doador, voluntário e ONG é feita por nome digitado em texto livre, sem login nem senha: qualquer pessoa pode se passar por outra preenchendo o mesmo nome.
- O motivo de uma devolução (`motivo_devolucao`) é gravado no banco, mas não é exibido a mais ninguém (nem ao doador, nem à Marta) — só existe para rastreabilidade futura.
- `resultadoDoMes` (H4) conta uma doação devolvida e reaceita no mesmo mês apenas pelo `aceita_em` mais recente — se isso acontecer em meses diferentes, a contagem de "aceitas" pode incluir a mesma doação duas vezes (uma por aceite), um efeito colateral não coberto por teste.

## Uso de IA

A IA (Claude) redigiu o código das histórias H1-H4, os testes, esta tabela e o texto desta seção, mapeando cada critério ao teste real que o cobre (conferido lendo o arquivo de teste, não assumido). O grupo revisou cada PR (H1/H2: Kauã; H3: Matheus; Refatoração 2: Matheus, no lugar do Kauã por indisponibilidade; H4: Matheus) e rodou `npm test` contra o PostgreSQL real antes de cada merge. **Erro real da IA, corrigido nesta iteração:** o primeiro rascunho da Refatoração 2 não diferenciava, em `devolver`, uma doação "nunca aceita" de uma "aceita por outra ONG" com a mesma clareza que `aceitar` já tinha — apontado no comentário de revisão sobre `coletar` não diferenciar os casos, e mantido como decisão consciente (não um bug) depois da resposta do Lucas no PR #14.
