// Regras de negócio das doações.
// TODO (grupo): implementar conforme as histórias e os critérios de aceite da Unidade 1.
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
  throw new Error('não implementado: listarDisponiveis');
}

// História 8 — "uma ONG aceita uma doação".
// Regra do caso: uma doação aceita não fica disponível para outra ONG.
export async function aceitar(id, ong) {
  const doacao = await repo.aceitar(id, ong);
  if (!doacao) throw new Error('Doação já reservada');
  return doacao;
}