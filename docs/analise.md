# Documento de Análise — Prato Cheio

*Trabalho 1 · máximo 4 páginas · entrega na Aula 5*

## Problema central

## Incertezas
1. **Volume e Frequência de Doações:** Não há dados sobre quantas doações reais os estabelecimentos farão por dia e se o esforço de cadastramento será mantido.
2. **Gargalo Logístico Real:** Acredita-se que o problema seja o tempo de coleta, mas não há medições ou dados que comprovem se a demora está na doação, na aceitação ou no transporte.
3. **Adesão e Comportamento dos Doadores:** Não se sabe se os doadores realmente vão dispor de tempo para cadastrar os itens de forma recorrente ou se desistirão por causa da fricção.
4. **Capacidade e Demanda das ONGs:** Desconhece-se o volume exato de absorção das cozinhas comunitárias e se elas têm capacidade de resposta rápida na janela curta dos perecíveis.
5. **Conformidade com a Vigilância Sanitária:** Não está definido qual é o nível mínimo aceitável de rastreabilidade exigido pela fiscalização para liberar o piloto sem expor os envolvidos a riscos legais.

## Stakeholders
| Stakeholder | Interesse | Influência | O que espera |
|---|---|---|---|

## Objetivos de impacto

1. **Objetivo:** Reduzir a quantidade de comida boa que é descartada.
   * **Métrica:** Porcentagem de doações cadastradas que expiram a janela de retirada sem serem coletadas.
   * **Linha de base:** Hoje desconhecida. Medir desde o primeiro dia do piloto.
   * **Direção:** Reduzir.

2. **Objetivo:** Aumentar o número de refeições que chegam a quem precisa.
   * **Métrica:** Quantidade (em Kg) de alimentos coletados e entregues com sucesso às ONGs por semana.
   * **Linha de base:** 0 Kg através do sistema (visto que o piloto ainda não existe).
   * **Direção:** Aumentar.

3. **Objetivo:** Reduzir o tempo logístico de resposta ("comida disponível" até "comida coletada").
   * **Métrica:** Tempo médio (em minutos) entre a publicação da doação no sistema e a confirmação de aceite pela ONG.
   * **Linha de base:** Hoje desconhecida e sentida como o maior gargalo. Medir desde o primeiro dia do piloto.
   * **Direção:** Reduzir.

## Regras de negócio
**Regra da Vantagem Logística**
   * **Origem:** Derivada.
   * **Enunciado:** Se [uma nova doação é publicada], então [a plataforma notifica primeiro exclusivamente as ONGs em um raio curto de distância durante os primeiros minutos].
   * **Como se verifica:** Dois desenvolvedores simulam o uso (um como ONG próxima, outro como ONG distante) no exato minuto da publicação. Verifica-se se apenas o próximo tem acesso à doação inicialmente.

2. **Regra de Expiração do Alimento**
   * **Origem:** Ausente. Decidida pela equipe.
   * **Enunciado:** Se [o prazo máximo da 'janela de retirada' for atingido sem que nenhuma ONG tenha aceitado], então [o sistema altera o status da doação para 'Expirada' e remove o item da lista pública].
   * **Como se verifica:** Cadastrar uma doação para expirar às 14:00. Alterar a hora do ambiente de testes para 14:01. O item obrigatoriamente deve desaparecer da lista de alimentos disponíveis.logístico

3. **Regra de Unicidade de Aceite**
   * **Origem:** Inventada.
   * **Enunciado:** Se [uma ONG aciona o botão de 'Aceitar' em um alimento], então [o sistema atribui o item àquela ONG e bloqueia imediatamente o aceite para outras].
   * **Como se verifica:** Dois usuários (ONG A e ONG B) tentam clicar em "Aceitar" na mesma doação simultaneamente. O sistema deve processar o primeiro e retornar erro "Doação já reservada" para o segundo.

## Conflitos de prioridade

* **Falas em conflito:**
  * *Doador:* "Não vou perder tempo preenchendo detalhes de validade no horário de pico da minha padaria, ou o formulário é rápido ou eu desisto e jogo no lixo."
  * *Vigilância Sanitária:* "Se vocês transitarem comida sem rastreabilidade mínima de tipo, quantidade e validade, a plataforma será autuada."
* **O eixo do trade-off:** Aderência e facilidade para o doador *vs.* Conformidade e segurança sanitária.
* **O que cada lado perde:** O doador perde conveniência, podendo abandonar o sistema. A conformidade perde segurança legal, arriscando a paralisação do projeto.
* **Critério que decide:** Na iteração 1, os campos obrigatórios na tela do doador são estritamente os três exigidos pela vigilância (Tipo, Quantidade e Validade). O resto (fotos, descrições extras) é opcional e não trava o envio.
* **Saída usada:** Decidir.

## Histórias de usuário
| # | História (Como… quero… para…) | INVEST: o que falha |
|---|---|---|

## Critérios de aceite
**História X** — Dado … Quando … Então …

## Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|

## Hipótese e experimento

## Decisão de análise
- **Problema:**
- **Alternativas:**
- **Decisão e justificativa:**
- **Riscos e limitações:**

## Uso de IA
O que geramos com IA, o que verificamos e o que alteramos.
