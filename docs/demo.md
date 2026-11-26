# Roteiro da demo — Prato Cheio

*Trabalho 3 · 3 minutos · outra pessoa precisa conseguir reproduzir só lendo isto*

## Antes de começar

```bash
docker run --name pratocheio-postgres \
  -e POSTGRES_USER=pratocheio -e POSTGRES_PASSWORD=pratocheio -e POSTGRES_DB=pratocheio \
  -p 5432:5432 -d postgres:16-alpine
cp .env.example .env
npm install
npm run db:migrar
npm run db:criar-teste
npm start
```

## Roteiro (3 minutos)

| Tempo | O que mostrar | O que se prova |
|---|---|---|
| 0:00–0:20 | O problema em uma frase: alimentos ainda próprios para consumo são descartados por restaurantes/mercados enquanto ONGs não ficam sabendo a tempo do que está disponível para retirada — e ninguém, depois do aceite, sabia o que acontecia com a doação. | por que o produto existe |
| 0:20–2:00 | A vida inteira de uma doação: a "Padaria Pão Bom" publica uma doação → ela aparece na lista de disponíveis → a "Casa Esperança" aceita (sai da lista) → o voluntário "Rui" confirma a coleta (vira "coletada", com nome e horário) → a padaria consulta "Minhas doações" e vê a situação de cada uma. Mais: publicar outra doação, aceitar, e a ONG **devolver** ("sem voluntário hoje") — ela volta pra lista, sem ONG, pronta pra ser aceita de novo. | o produto executa ponta a ponta, incluindo o ciclo de volta (devolução) |
| 2:00–2:30 | Um caso de erro tratado: tentar devolver uma doação que já foi coletada — o sistema recusa ("Doação já coletada, não pode ser devolvida"). E a Marta consultando `GET /api/resultado?ano=2026&mes=11` e vendo o total de publicadas/aceitas/coletadas e o tempo médio até a coleta do mês. | os limites (transições inválidas) foram pensados, e o objetivo de impacto da análise virou número |
| 2:30–3:00 | O que falta e por quê: notificar o doador quando a doação expira (fora de escopo do Trabalho 3, exigiria um canal de notificação que o produto não tem); autenticação real de doador/ONG/voluntário (ver `docs/validacao.md` > Limitações do produto). | vocês sabem onde estão |

## Passo a passo reproduzível

1. Publicar uma doação: `curl -X POST http://localhost:3000/api/doacoes -H "Content-Type: application/json" -d '{"tipo":"Sopa","quantidade":"10 porções","validade":"2027-01-01","doador":"Padaria Pão Bom"}'` → `201`, `status: "disponivel"`. Guarde o `id`.
2. Listar disponíveis: `curl http://localhost:3000/api/doacoes` → a doação do passo 1 aparece.
3. Aceitar: `curl -X POST http://localhost:3000/api/doacoes/<id>/aceitar -H "Content-Type: application/json" -d '{"ong":"Casa Esperança"}'` → `200`, `status: "aceita"`, `ong: "Casa Esperança"`.
4. Confirmar a coleta: `curl -X POST http://localhost:3000/api/doacoes/<id>/coletar -H "Content-Type: application/json" -d '{"voluntario":"Rui"}'` → `200`, `status: "coletada"`, `voluntario: "Rui"`, `coletada_em` preenchido.
5. Minhas doações: `curl "http://localhost:3000/api/doacoes/minhas?doador=Padaria%20P%C3%A3o%20Bom"` → a doação aparece com `status: "coletada"`.
6. Publicar uma segunda doação (mesmo `doador`), aceitar com `"ong":"Casa Esperança"`, guardar o novo `id`.
7. Devolver: `curl -X POST http://localhost:3000/api/doacoes/<id>/devolver -H "Content-Type: application/json" -d '{"ong":"Casa Esperança","motivo":"sem voluntário hoje"}'` → `200`, `status: "disponivel"`, `ong: null`, `motivo_devolucao: "sem voluntário hoje"`.
8. Caso de erro — devolver uma já coletada: repita o passo 7 com o `id` do passo 1 (já coletado) → `400`, `erro: "Doação já coletada, não pode ser devolvida"`.
9. Resultado do mês: `curl "http://localhost:3000/api/resultado?ano=2026&mes=11"` → mostra `publicadas`, `aceitas`, `coletadas` e `tempoMedio` (ex.: `"X.X h"` ou `"sem coletas no mês"`).

## Testado por

Outro integrante executou este roteiro sem ajuda: **Lucas Klug Sebastião**, em **25/11/2026**.
Se ele travou em algum passo, o roteiro está incompleto — corrija antes de entregar.
