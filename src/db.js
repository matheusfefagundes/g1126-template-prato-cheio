// Conexão com o banco. Agora em PostgreSQL via `pg` (Pool).
//
// UNIDADE 3: refatoração de SQLite para PostgreSQL (ADR 0001). A interface
// abaixo (`query` devolvendo `{ rows }`) é a mesma que já existia — a troca
// de driver fica contida neste arquivo, sem espalhar mudança pelo resto do código.
import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

// Nome do banco, resolvido uma única vez na importação do módulo — igual ao
// que ARQUIVO fazia para o SQLite (ADR 0002: o guard confere o alvo real já
// resolvido na importação, não process.env lido de novo depois).
const NOME_BANCO = (() => {
  try { return new URL(DATABASE_URL).pathname.replace(/^\//, ''); }
  catch { return ''; }
})();

let pool;

export function conexao() {
  if (!pool) pool = new Pool({ connectionString: DATABASE_URL });
  return pool;
}

/**
 * Executa uma consulta e devolve { rows }.
 * Use `$1, $2, ...` como marcador de parâmetro (evita injeção de SQL):
 *   query('SELECT * FROM doacoes WHERE id = $1', [id])
 */
export async function query(sql, valores = []) {
  const { rows, rowCount } = await conexao().query(sql, valores);
  return { rows, alteradas: rowCount };
}

/** Cria o schema, se ainda não existir. Rodado por `npm run db:migrar` e ao subir o servidor. */
export async function migrar() {
  await conexao().query(`
    CREATE TABLE IF NOT EXISTS doacoes (
      id          SERIAL PRIMARY KEY,
      tipo        TEXT NOT NULL,
      quantidade  TEXT NOT NULL,
      validade    TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'disponivel',
      ong         TEXT,
      criada_em   TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

/** Apaga todos os dados. Usado pelos testes. */
export async function limparBanco() {
  if (!/_test$/.test(NOME_BANCO)) {
    throw new Error(
      'limparBanco() recusado: banco em uso não é o de teste (nome deve terminar em "_test").'
    );
  }
  await conexao().query('DELETE FROM doacoes');
}

export async function encerrar() {
  if (pool) { await pool.end(); pool = undefined; }
}
