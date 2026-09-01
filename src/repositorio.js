// Camada de dados do Prato Cheio — acesso ao banco.
// TODO (grupo): implementar as quatro funções abaixo usando query().
// A conexão e o schema já estão prontos em src/db.js.
//
// Marcador de parâmetro é `?` (SQL parametrizado evita injeção):
//   const { rows } = await query('SELECT * FROM doacoes WHERE id = ?', [id]);
import { query } from './db.js';

export async function inserir({ tipo, quantidade, validade }) {
  const { rows } = await query(
    'INSERT INTO doacoes (tipo, quantidade, validade) VALUES (?, ?, ?) RETURNING *',
    [tipo, quantidade, validade]
  );
  return rows[0];
}

// TODO: devolver apenas as doações com status 'disponivel'.
export async function listarDisponiveis() {
  const { rows } = await query("SELECT * FROM doacoes WHERE status = 'disponivel'");
  return rows;
}

export async function buscarPorId(id) {
  const { rows } = await query('SELECT * FROM doacoes WHERE id = ?', [id]);
  return rows[0];
}

// TODO: buscar uma doação pelo id (devolver undefined se não existir).
export async function buscarPorId(id) {
  throw new Error('não implementado: repositorio.buscarPorId');
}

// A condição `AND status = 'disponivel'` no WHERE é o que garante, de forma
// que duas ONGs não aceitem a mesma doação: se a segunda UPDATE
// rodar depois da primeira já ter mudado o status, nenhuma linha é afetada.
export async function aceitar(id, ong) {
  const { rows } = await query(
    "UPDATE doacoes SET status = 'aceita', ong = ? WHERE id = ? AND status = 'disponivel' RETURNING *",
    [ong, id]
  );
  return rows[0];
}