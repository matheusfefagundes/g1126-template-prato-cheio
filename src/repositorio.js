// Camada de dados do Prato Cheio — acesso ao banco.
// A conexão e o schema já estão prontos em src/db.js.
// Marcador de parâmetro é `$1, $2, ...` (SQL parametrizado evita injeção):
//   const { rows } = await query('SELECT * FROM doacoes WHERE id = $1', [id]);
import { query } from './db.js';

export async function inserir({ tipo, quantidade, validade, doador }) {
  const { rows } = await query(
    'INSERT INTO doacoes (tipo, quantidade, validade, doador) VALUES ($1, $2, $3, $4) RETURNING *',
    [tipo, quantidade, validade, doador]
  );
  return rows[0];
}

// História H1 (Trabalho 3) — "o doador acompanha as suas doações".
// Doações antigas (sem doador, docs/projeto.md > Decisão 4) nunca aparecem
// aqui, porque `doador` nelas é NULL e NULL nunca é igual a nada em SQL.
export async function listarPorDoador(doador) {
  const { rows } = await query('SELECT * FROM doacoes WHERE doador = $1', [doador]);
  return rows;
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
    "UPDATE doacoes SET status = 'aceita', ong = $1, aceita_em = now() WHERE id = $2 AND status = 'disponivel' RETURNING *",
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
// que só uma doação aceita pode virar coletada, e que ninguém coleta duas vezes
// (história H2 do Trabalho 3 — confirmação de coleta pelo voluntário).
export async function coletar(id, voluntario) {
  const { rows } = await query(
    "UPDATE doacoes SET status = 'coletada', voluntario = $1, coletada_em = now() WHERE id = $2 AND status = 'aceita' RETURNING *",
    [voluntario, id]
  );
  return rows[0];
}
