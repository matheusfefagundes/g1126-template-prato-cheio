# ADR 0002 — Isolamento do banco de testes em relação ao banco de produção

- **Data:** 20/10/2026
- **Status:** aceito

## Contexto
O piloto do Prato Cheio já tem doações reais cadastradas. Uma pessoa da equipe da Marta rodou a suíte de testes na máquina do piloto, com a configuração apontando para o banco real — e a limpeza dos testes (`limparBanco()`, chamada em todo `beforeEach` de `tests/doacoes.test.js`) apagou todas as doações reais. A Marta pediu que isso não possa acontecer de novo, "seja qual for a máquina ou a configuração".

Hoje, `src/db.js` resolve o arquivo do banco uma única vez, na importação do módulo: `const ARQUIVO = process.env.DATABASE_FILE || 'dados.sqlite'`. Em desenvolvimento e em produção, sem a variável `DATABASE_FILE` definida, isso cai para `'dados.sqlite'` — o arquivo real. Só `vitest.config.js` injeta `DATABASE_FILE=':memory:'` antes dos testes rodarem; `limparBanco()` em si não confere nada, só executa `DELETE FROM doacoes` incondicionalmente contra o que `conexao()` devolver. Essa é exatamente a lacuna que permitiu o incidente: a segurança dependia inteiramente de uma configuração externa (`vitest.config.js`) nunca ser contornada, ignorada ou rodada fora do Vitest.

A pergunta que este ADR responde é: como garantir, estruturalmente e não por convenção, que a limpeza de testes nunca apague dados fora do banco de teste?

## Alternativas consideradas
1. **Guardar só a chamada de limpeza (`limparBanco()`)** — prós: protege exatamente a operação destrutiva que causou o incidente; não toca no caminho de escrita que a aplicação em produção usa (`query()`), então não arrisca quebrar o servidor real; mudança pequena e isolada. Contras: sozinha, só protege quem efetivamente chama `limparBanco()` — um teste futuro que, por engano, nunca chamar essa função mas ainda assim escrever no banco errado não seria pego por este guard.
2. **Guardar toda escrita dentro de `query()`** — prós: cobertura mais ampla, qualquer `INSERT`/`UPDATE`/`DELETE` fora do banco de teste seria recusado. Contras: `query()` é o único caminho de escrita tanto dos testes quanto do servidor rodando de verdade — bloquear escrita fora de `:memory:` ali tornaria a aplicação incapaz de gravar qualquer doação real em produção. Descartada: resolveria o sintoma trocando por um problema maior (a aplicação para de funcionar).
3. **Guardar a chamada de limpeza E recusar a suíte inteira de testes se o ambiente não estiver configurado para `:memory:`** (combinação) — prós: duas camadas independentes — uma no código de produção (`limparBanco()`, pega qualquer chamador, mesmo fora da suíte padrão) e uma na configuração do Vitest (`tests/setup.js`, pega o caso de um teste futuro esquecer a convenção de chamar `limparBanco()` no `beforeEach`, recusando rodar qualquer teste antes mesmo de começarem). Contras: a camada em `tests/setup.js` só vale para quem roda via Vitest; um script arbitrário fora do Vitest que importe `src/db.js` diretamente ainda depende só da primeira camada.

## Decisão
Optamos pela **alternativa 3: duas camadas combinadas**. Em `src/db.js`, `limparBanco()` passa a checar a constante já resolvida `ARQUIVO` (não `process.env.DATABASE_FILE`, que mudado depois de o módulo já ter sido importado não tem efeito nenhum sobre `ARQUIVO`) e lança erro antes de chamar `conexao()` caso não seja `':memory:'` — então o guard nunca cria nem toca em nenhum arquivo, mesmo quando dispara. Em paralelo, `tests/setup.js` (novo, ligado via `vitest.config.js` > `test.setupFiles`) recusa a suíte inteira antes de qualquer teste rodar, se `DATABASE_FILE` não for `':memory:'`. Nenhuma das duas camadas toca em `query()`, então a aplicação em produção continua escrevendo normalmente no banco real.

## Consequências
- **Positivas:** o incidente da Marta deixa de ser possível por configuração incorreta — mesmo que alguém aponte `DATABASE_FILE` para um arquivo real e rode os testes, `limparBanco()` recusa antes de apagar qualquer coisa. A proteção vive no código versionado, não depende de ninguém lembrar de uma convenção.
- **Negativas / o que abrimos mão:** a proteção continua condicionada a `src/db.js` ser o único caminho de acesso ao banco — um script que abra o arquivo SQLite diretamente (fora de `src/db.js`) não é protegido por nada aqui. Isso é um limite aceito, não resolvido por este ADR.
- **Riscos e o que fazer se der errado:** se algum teste futuro precisar legitimamente rodar contra um arquivo real (por exemplo, um teste de integração deliberado), ele vai falhar ao chamar `limparBanco()` — o time precisa tratar isso como um sinal para revisar o desenho do teste, não para remover o guard.

## Rastreabilidade
Atende à exigência de rastreabilidade mínima da Vigilância Sanitária registrada em `docs/analise.md` (stakeholder Vigilância Sanitária, "Rastreabilidade mínima dos alimentos que transitam") — perder os registros reais de doações contraria diretamente essa exigência, já que não há mais dado nenhum para rastrear.

## Critério de validação
`tests/db-seguranca.test.js` existe e passa: ao forçar `DATABASE_FILE` para um valor diferente de `':memory:'` e reimportar `src/db.js`, `limparBanco()` rejeita a chamada com um erro, sem apagar nada. "Testar bastante" não é critério: o critério concreto é esse teste específico passando no CI.
