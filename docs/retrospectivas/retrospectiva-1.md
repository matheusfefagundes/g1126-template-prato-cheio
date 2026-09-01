# Retrospectiva da Iteração 1

- **Data:** 27/08/2026 · **Grupo:** Matheus Ferreira Fagundes, Lucas Klug Sebastião, Kauã Martins Bassan

## O que decidimos nesta iteração
- Fechamos a fronteira da "história zero" nas histórias #6, #7 e #8 (publicar → listar →
  aceitar), deixando login, mapa de rotas, edição de doação e app nativo fora da iteração 1
  — decisão registrada em `docs/analise.md` > Decisão de análise.
- Resolvemos o conflito entre o doador (quer cadastro rápido) e a Vigilância Sanitária (exige
  rastreabilidade) fixando **tipo, quantidade e validade** como os únicos campos obrigatórios
  do formulário de doação; o resto fica opcional.
- Adotamos a Regra de Unicidade de Aceite como regra de negócio central do MVP: uma doação
  aceita por uma ONG sai imediatamente da lista e nenhuma outra ONG consegue aceitá-la.
- Dividimos a implementação do walking skeleton por história (cada um ficou dono de uma
  história de ponta a ponta: código, teste e critério de aceite).

## O que funcionou
- Ter a tabela de Histórias de usuário e a marcação da história zero (★) prontas desde a
  Aula 3 tornou os Critérios de aceite de hoje quase diretos de escrever.
- Dividir o walking skeleton por história (#6 Kauã, #7 Lucas, #8 Matheus) deixou cada commit
  pequeno, testável sozinho e sem quebrar o CI dos outros dois no meio do caminho.

## O que mudaríamos
- Escrever os Critérios de aceite das três histórias do piloto já na Aula 3, junto com o
  fatiamento, em vez de deixar só um critério solto para completar depois.
- Combinar a ordem dos commits (quem implementa o quê primeiro) antes de começar a mexer no
  código, para não descobrir dependência entre funções só na hora de rodar `npm test`.

## Próximos passos (para a próxima iteração)
- Implementar a Regra de Expiração do Alimento (status "Expirada" quando a janela de retirada
  vence) — ainda não tem código, só a regra descrita em `docs/analise.md`.
- Rodar os dois experimentos combinados nos Riscos e na Hipótese (entrevista com doadores até
  02/09, checagem do `node:sqlite` em outra máquina até 01/09) antes da Prova 1.
- Preparar o branch `entrega-1` para a entrega de 03/09.

## Autoavaliação de contribuição
Distribuam 100 pontos entre os integrantes conforme a contribuição desta iteração
(inclui código, análise, documentação, revisão de PR). Cada integrante assina.

| Integrante | Pontos | O que fez de mais relevante |
|---|:--:|---|
| Matheus Ferreira Fagundes | 45 | Escreveu Regras de negócio e Conflitos de prioridade e a tabela de Histórias de usuário (Aula 3); implementou a história 8 (ONG aceita com exclusividade) — código, testes e critérios — e a Decisão de análise. |
| Kauã Martins Bassan | 28 | Levantou e escreveu Stakeholders (Aula 3); implementou a história 6 (Doador publica) — código, teste e critérios — e a seção de Riscos. |
| Lucas Klug Sebastião | 27 | Levantou e escreveu Incertezas e Objetivos de impacto (Aula 3); implementou a história 7 (ONG lista) — código, testes e critérios —, a Hipótese e experimento e esta retrospectiva. |

**Total: 100**