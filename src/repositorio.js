// Camada de dados do Prato Cheio — acesso ao banco.
// A conexão e o schema já estão prontos em src/db.js.
// Marcador de parâmetro é `$1, $2, ...` (SQL parametrizado evita injeção):
//   const { rows } = await query('SELECT * FROM doacoes WHERE id = $1', [id]);
import { query } from './db.js';

export async function inserir({ tipo, quantidade, validade }) {
  const { rows } = await query(
    'INSERT INTO doacoes (tipo, quantidade, validade) VALUES ($1, $2, $3) RETURNING *',
    [tipo, quantidade, validade]
  );
  return rows[0];
}

// Marca como 'expirada' toda doação disponível cuja validade já passou.
// Rodada antes de listar/aceitar, para a lista nunca mostrar nem aceitar o que já venceu.
// Comparação fixa em UTC (date('now') do SQLite sempre foi UTC, sem conceito de timezone).
export async function expirarVencidas() {
  await query(
    `UPDATE doacoes
        SET status = 'expirada'
      WHERE status = 'disponivel'
        AND validade::date < (now() AT TIME ZONE 'UTC')::date`
  );
}

// Devolver apenas as doações com status 'disponivel'.
export async function listarDisponiveis() {
  await expirarVencidas();
  const { rows } = await query("SELECT * FROM doacoes WHERE status = 'disponivel'");
  return rows;
}

// Buscar uma doação pelo id (devolver undefined se não existir).
export async function buscarPorId(id) {
  const { rows } = await query('SELECT * FROM doacoes WHERE id = $1', [id]);
  return rows[0];
}

// A condição `AND status = 'disponivel'` no WHERE é o que garante, de forma
// que duas ONGs não aceitem a mesma doação: se a segunda UPDATE
// rodar depois da primeira já ter mudado o status, nenhuma linha é afetada.
export async function aceitar(id, ong) {
  await expirarVencidas();
  const { rows } = await query(
    "UPDATE doacoes SET status = 'aceita', ong = $1 WHERE id = $2 AND status = 'disponivel' RETURNING *",
    [ong, id]
  );
  return rows[0];
}

// Devolver apenas as doações com status 'aceita' (aguardando coleta).
export async function listarAceitas() {
  const { rows } = await query("SELECT * FROM doacoes WHERE status = 'aceita'");
  return rows;
}

// Mesmo padrão do aceitar(): a condição `AND status = 'aceita'` no WHERE garante
// que só uma doação aceita pode virar coletada, e que ninguém coleta duas vezes.
export async function coletar(id) {
  const { rows } = await query(
    "UPDATE doacoes SET status = 'coletada' WHERE id = $1 AND status = 'aceita' RETURNING *",
    [id]
  );
  return rows[0];
}
