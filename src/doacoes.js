// Regras de negócio das doações.
import * as repo from './repositorio.js';

// História 6 — "um doador publica uma doação".
// Critério: tipo, quantidade, validade e doador são obrigatórios (o campo
// doador foi acrescentado pela história H1 do Trabalho 3 — CA3).
export async function criarDoacao({ tipo, quantidade, validade, doador }) {
  if (!tipo || !quantidade || !validade || !doador) {
    throw new Error('tipo, quantidade, validade e doador são obrigatórios');
  }
  return repo.inserir({ tipo, quantidade, validade, doador });
}

// História H1 (Trabalho 3) — "o doador acompanha as suas doações".
export async function listarPorDoador(doador) {
  if (!doador) throw new Error('doador é obrigatório');
  return repo.listarPorDoador(doador);
}

// História 7 — "uma ONG vê as doações disponíveis".
export async function listarDisponiveis() {
  return repo.listarDisponiveis();
}

// Padrao repetido 3x (aceitar/coletar/devolver): a condicao de exclusividade
// ja roda atomicamente no banco (WHERE status=...); isto aqui so decide QUAL
// mensagem de erro mostrar quando a transicao falha.
async function resolverOuFalhar(resultado, id, mensagemSeConflito) {
  if (resultado) return resultado;
  const atual = await repo.buscarPorId(id);
  if (!atual) throw new Error('Doação não encontrada');
  throw new Error(mensagemSeConflito(atual));
}

// História 8 — "uma ONG aceita uma doação".
// Regra do caso: uma doação aceita não fica disponível para outra ONG.
// Regra de Expiração do Alimento (Aula 11): doação com validade vencida não pode ser aceita.
export async function aceitar(id, ong) {
  const doacao = await repo.aceitar(id, ong);
  return resolverOuFalhar(doacao, id, (atual) =>
    atual.status === 'expirada' ? 'Doação expirada, não pode mais ser aceita' : 'Doação já reservada'
  );
}

// Lista as doações aceitas, aguardando coleta (para o voluntário marcar como coletada).
export async function listarAceitas() {
  return repo.listarAceitas();
}

// História H2 (Trabalho 3) — "o voluntário confirma a coleta".
// Regra: só uma doação aceita pode ser coletada; uma já coletada (ou nunca aceita) é recusada.
// Nome do voluntário é obrigatório (decisão do grupo, docs/projeto.md): é quem
// se pergunta depois se algo deu errado com a entrega.
export async function coletar(id, voluntario) {
  if (!voluntario) throw new Error('voluntario é obrigatório');
  const doacao = await repo.coletar(id, voluntario);
  return resolverOuFalhar(doacao, id, () => 'Doação não está aceita ou já foi coletada');
}

// Historia H3 (Trabalho 3) - "a ONG devolve uma doacao aceita".
export async function devolver(id, ong, motivo) {
  if (!motivo) throw new Error('motivo e obrigatorio');
  const doacao = await repo.devolver(id, ong, motivo);
  return resolverOuFalhar(doacao, id, (atual) => {
    if (atual.status === 'coletada') return 'Doacao ja coletada, nao pode ser devolvida';
    if (atual.status === 'aceita' && atual.ong !== ong) return 'Voce nao pode devolver uma doacao que nao aceitou';
    return 'Doacao nao esta aceita';
  });
}
