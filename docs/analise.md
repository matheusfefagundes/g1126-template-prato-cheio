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

| Stakeholder | Interesse | Influência | O que espera | O que muda na iteração 1 |
|---|---|---|---|---|
| **Doadores (restaurantes, mercados)** | Doar excedentes com rapidez, sem burocracia ou tempo perdido em cadastros longos. | Alta (são a fonte). | Formulários curtos e não comprometer a operação diária no horário de pico. | **Entrevistar primeiro** para validar a incerteza de adesão[cite: 2]. Aceitamos agora o requisito de interface leve e preenchimento manual simples, sem integração com ERPs, para evitar a desistência[cite: 2]. |
| **ONGs receptoras** | Obter alimentos para distribuir. | Alta (são os consumidores). | Previsibilidade sobre o que vão receber para conseguir planejar a coleta. | **Entrevistar primeiro** para validar o volume de absorção e a capacidade de resposta rápida na janela curta dos perecíveis[cite: 2]. Requisito de "aceitar e reservar" é aceito agora. |
| **Voluntários entregadores** | Fazer as entregas de forma rápida e assertiva. | Média (essenciais para a logística). | Saber exatamente onde buscar e para onde levar, operando em celulares com conexão instável[cite: 2]. | **Aceitamos requisito técnico agora:** a aplicação deve ser leve para rodar obrigatoriamente no navegador do celular com conexão instável[cite: 2]. Aplicativos nativos pesados ficam para depois[cite: 2]. |
| **Marta (Coordenadora)** | Crescer a plataforma rápido, gerar volume e comprovar impacto. | Alta (dona do projeto). | Um piloto rodando rápido em poucas semanas com orçamento quase zero[cite: 2]. | **Aceitamos a restrição de prazo e negócio:** foco estrito na "história zero" (publicar, ver, aceitar e sumir) operando em um único bairro[cite: 2]. Expansões e automações ficam para depois[cite: 2]. |
| **Vigilância Sanitária** | Garantir a segurança alimentar e a saúde pública. | Alta (poder legal). | Rastreabilidade mínima dos alimentos que transitam (tipo, quantidade, validade). | **Entrevistar/Pesquisar primeiro** para definir qual é o nível mínimo exigido para não expor a riscos legais[cite: 2]. Os campos mínimos definidos serão impostos obrigatoriamente. |
| **Pessoas em vulnerabilidade** *(Não listado)* | Receber refeições prontas, seguras e próprias para consumo. | Baixa (não interagem). | Que a cadeia logística não lhes entregue comida estragada. | Ficam para depois (não serão entrevistados). Porém, a regra de janela de validade não será flexibilizada sob nenhuma hipótese na iteração 1. |

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
| # | História (Como… quero… para…) | INVEST: o que falha | Ação corretiva |
|---|---|---|---|
| 1 | Como Doador, quero editar os dados de uma doação já publicada, para evitar punições legais caso eu tenha errado a validade. | Falha em Pequena | Quebrar em duas fatias: editar campos de texto e cancelar a doação inteira. |
| 2 | Como Voluntário entregador, quero visualizar a rota no mapa do sistema, para não perder a janela de validade da comida no trânsito. | Falha em Estimável | Spike de 4 horas para investigar a viabilidade técnica e os custos da API do Google Maps. |
| 3 | Como ONG receptora, quero avaliar o estado do alimento após o recebimento, para evitar problemas de saúde nas pessoas em vulnerabilidade. | Falha em Independente | Acopla com o sistema de histórico e gamificação, adiar para a iteração 2. |
| 4 | Como Vigilância Sanitária, quero um painel com filtros e gráficos de rastreabilidade, para auditar a conformidade de todos os envolvidos. | Falha em Negociável | Escopo muito fechado. Agendar reunião para definir quais são os 2 filtros essenciais para o piloto. |
| 5 | Como Doador, quero que o sistema se integre ao meu ERP, para que eu não perca tempo na hora de pico e desista de usar. | Falha em Estimável | Spike de 2 dias para ler a documentação dos 3 ERPs mais usados pelos restaurantes parceiros. |
| ★ 6 | Como Doador, quero publicar um alimento (tipo, quantidade, validade), para reduzir o descarte de comida boa. | Nenhuma (Aceita) | A história zero é independente, pequena e valida o primeiro passo do MVP. |
| 7 | Como ONG receptora, quero visualizar uma lista de doações disponíveis, para saber quais alimentos estão próximos para coleta. | Nenhuma (Aceita) | Independente e testável por si só, garantindo a visibilidade da doação. |
| 8 | Como ONG receptora, quero aceitar uma doação exclusiva, para garantir que serei a única a buscá-la e não perder a viagem. | Nenhuma (Aceita) | Encerra a regra de negócio central fechando o ciclo logístico. |

**Por que ela:** A história #6 é a história zero (que, unida à #7 e #8, forma a fronteira do piloto e dos testes do `doacoes.test.js`) porque a publicação embasa a regra de negócio central de Rastreabilidade (campos mínimos) e é o gatilho sem o qual o resto do ecossistema não existe.

**O que ficou FORA da fatia:**
- Login, senhas e perfis de usuário.
- Mapa geográfico de rotas.
- Edição de doações publicadas.
- Aplicativo móvel nativo e notificações push.

**Por quê:**
- **Login/Senhas:** Risco de atrasar o piloto por complexidade desnecessária; usaremos links fixos para testar no MVP.
- **Mapa de rotas:** Difícil de estimar (requer spike técnico); o foco inicial é medir o aceite da ONG, os voluntários podem usar WhatsApp/Waze.
- **Edição de doações:** Baixa probabilidade de uso no primeiro dia comparado à ação mais simples de excluir e criar de novo.
- **App nativo/Notificações:** Risco técnico de aprovação nas lojas; a restrição do caso (conexão instável) pede algo leve no navegador.

## Critérios de aceite

**História 6 — Doador publica um alimento**
- Dado que o doador ainda não publicou nenhuma doação, Quando ele envia tipo, quantidade e validade preenchidos, Então a doação aparece na lista de disponíveis com status "disponível".
- Dado que o doador ainda não publicou nenhuma doação, Quando ele envia o formulário sem um dos campos obrigatórios (tipo, quantidade ou validade), Então o sistema recusa a publicação e nenhuma doação é criada.

**História 7 — ONG visualiza a lista de doações disponíveis**
- Dado que existe uma doação publicada e ainda não aceita, Quando a ONG consulta a lista de doações disponíveis, Então a doação aparece na lista.
- Dado que existe uma doação publicada e já aceita por uma ONG, Quando qualquer ONG consulta a lista de doações disponíveis, Então essa doação não aparece mais na lista.

**História 8 — ONG aceita uma doação exclusiva**
- Dado que existe uma doação publicada e ainda não aceita, Quando uma ONG aciona "aceitar", Então a doação passa para o status "aceita" e fica associada àquela ONG.
- Dado que existe uma doação já aceita por uma ONG, Quando uma segunda ONG tenta aceitar a mesma doação, Então o sistema recusa o aceite (erro "Doação já reservada") e a doação permanece associada à primeira ONG.

## Riscos
Escala usada: alta / média / baixa.

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Doadores acham os campos obrigatórios (tipo/quantidade/validade) um atrito grande no horário de pico e abandonam o cadastro antes de enviar. | Média | Alta | Até 02/09, o Kauã entrevista 2 doadores parceiros com o formulário atual e mede quantos completam o cadastro sem desistir. |
| `node:sqlite` é experimental (Node 22+); uma mudança de comportamento entre versões do Node pode quebrar `npm test`/`npm start` na máquina de outro integrante ou no CI. | Baixa | Alta | Até 01/09, o Lucas roda `npm test` e `npm start` em uma segunda máquina com Node 22.13+ e documenta no README a versão exata testada. |

## Hipótese e experimento
Acreditamos que o maior tempo perdido no ciclo doação-coleta está entre a publicação da doação e o aceite por uma ONG (decisão), e não no deslocamento físico até o local (coleta).

Saberemos que estávamos errados se, em pelo menos 10 doações registradas (reais ou simuladas com ONGs parceiras), o tempo médio entre "aceite" e "coleta confirmada" for maior ou igual ao tempo médio entre "publicação" e "aceite", até 02/09.

Como medimos: planilha simples com os timestamps de publicação, aceite e coleta, preenchida manualmente pelo Lucas durante o piloto com 2 ONGs parceiras.

## Decisão de análise
- **Problema:** definir o que entra e o que fica de fora da fatia da história zero para a iteração 1 andar dentro do prazo e do orçamento quase zero pedido pela Marta.
- **Alternativas:**
  - (A) Fatia mínima — publicar/listar/aceitar apenas, sem login, sem mapa, sem edição de doação, sem app nativo. Ganha: cabe no prazo e no orçamento, foco total na regra de negócio central (Unicidade de Aceite). Perde: doador não corrige um cadastro errado sem excluir e recriar; voluntário navega sem apoio de mapa dentro do sistema.
  - (B) Fatia completa — incluir login básico e edição de doações já na iteração 1. Ganha: experiência mais robusta, doador corrige erros sem recriar. Perde: mais tempo de desenvolvimento, risco real de não termos um walking skeleton rodando até a Aula 5.
- **Decisão e justificativa:** optamos pela alternativa (A). Ela é a que valida a Regra de Unicidade de Aceite e o Objetivo de impacto 3 (reduzir tempo logístico de resposta) dentro do orçamento quase zero exigido pela Marta, e reduz o risco de não termos o walking skeleton pronto no prazo (ver seção Riscos).
- **Riscos e limitações:** um doador que errar o cadastro (ex.: validade errada) não tem como corrigir — precisa excluir e recriar, o que pode sujar os dados; sem mapa embutido, o voluntário depende de apps externos (WhatsApp/Waze), fora do controle e da métrica do produto.

## Uso de IA
Utilizamos a IA para gerar propostas iniciais de histórias e refinamento do fatiamento.

- **História #1:**
  - **O que a IA gerou:** "Como Doador, quero editar os dados da minha doação, para atualizar informações."
  - **O que mudamos e por quê:** Refinamos o "para" para terminar em uma perda concreta ("evitar punições legais caso eu tenha errado a validade"). A versão original repetiu a ação com outras palavras e não declarava valor.
  - **Regra de negócio inventada:** A IA assumiu a regra de que doações podem ser editadas a qualquer momento. Nós (junto com a Marta) decidimos que não se pode editar uma doação que já foi aceita por uma ONG, para evitar conflitos logísticos.

- **História #2:**
  - **O que a IA gerou:** "Como Voluntário entregador, quero ver o trajeto no aplicativo, para chegar rápido."
  - **O que mudamos e por quê:** Mudamos o motivo para focar no objetivo do caso ("não perder a janela de validade da comida"). Removemos a palavra "aplicativo", pois a restrição imposta é que tudo rode no navegador leve de celular.
  - **Regra de negócio inventada:** A IA assumiu que a plataforma possui rastreamento georreferenciado nativo das entregas. Decidimos deixar essa invenção fora do MVP, pois exigiria recursos pesados.

- **História #5:**
  - **O que a IA gerou:** "Como Doador, quero integrar com o iFood, para automatizar as doações."
  - **O que mudamos e por quê:** Trocamos "iFood" por "ERP" e mudamos o "para" baseando-se na fala direta do doador no mapa de stakeholders ("não perca tempo na hora de pico e desista de usar").
  - **Regra de negócio inventada:** A IA inventou a regra de integração com serviços de terceiros (iFood) sem validar viabilidade técnica. A Coordenadora Marta é a dona dessa decisão e decidirá se o custo compensa.
