// Regras de negócio das doações.
import * as repo from './repositorio.js';

// História 6 — "um doador publica uma doação".
// Critério: tipo, quantidade e validade são obrigatórios.
export async function criarDoacao({ tipo, quantidade, validade }) {
  if (!tipo || !quantidade || !validade) {
    throw new Error('tipo, quantidade e validade são obrigatórios');
  }
  return repo.inserir({ tipo, quantidade, validade });
}

// História 7 — "uma ONG vê as doações disponíveis".
export async function listarDisponiveis() {
  return repo.listarDisponiveis();
}

// História 8 — "uma ONG aceita uma doação".
// Regra do caso: uma doação aceita não fica disponível para outra ONG.
// Regra de Expiração do Alimento (Aula 11): doação com validade vencida não pode ser aceita.
export async function aceitar(id, ong) {
  const doacao = await repo.aceitar(id, ong);
  if (!doacao) {
    const atual = await repo.buscarPorId(id);
    if (!atual) throw new Error('Doação não encontrada');
    if (atual.status === 'expirada') throw new Error('Doação expirada, não pode mais ser aceita');
    throw new Error('Doação já reservada');
  }
  return doacao;
}

// Lista as doações aceitas, aguardando coleta (para o voluntário marcar como coletada).
export async function listarAceitas() {
  return repo.listarAceitas();
}

// História "voluntário marca a doação como coletada".
// Regra: só uma doação aceita pode ser coletada; uma já coletada é recusada.
export async function coletar(id) {
  const doacao = await repo.coletar(id);
  if (!doacao) throw new Error('Doação não está aceita ou já foi coletada');
  return doacao;
}
