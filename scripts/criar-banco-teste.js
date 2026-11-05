// Cria o banco de teste (sufixo "_test"), se ainda não existir. Idempotente.
// Deriva o nome a partir de DATABASE_URL (troca o nome do banco por "<nome>_test"),
// ou usa DATABASE_URL_TESTE diretamente se definida.
import pg from 'pg';

const urlTeste = process.env.DATABASE_URL_TESTE
  || process.env.DATABASE_URL?.replace(/\/([^/?]+)(\?.*)?$/, '/$1_test$2');

if (!urlTeste) {
  throw new Error('Defina DATABASE_URL (ou DATABASE_URL_TESTE) para criar o banco de testes.');
}

const nomeBanco = new URL(urlTeste).pathname.replace(/^\//, '');
if (!/_test$/.test(nomeBanco)) {
  throw new Error(`"${nomeBanco}" não termina em "_test" — recusando criar.`);
}

// Conecta ao banco de manutenção "postgres" (sempre existe num servidor novo)
// porque não é possível criar um banco estando conectado a ele mesmo.
const urlManutencao = urlTeste.replace(/\/[^/?]+(\?.*)?$/, '/postgres$1');
const admin = new pg.Pool({ connectionString: urlManutencao });

try {
  await admin.query(`CREATE DATABASE "${nomeBanco}"`);
  console.log(`banco de teste criado: ${nomeBanco}`);
} catch (erro) {
  if (erro.code === '42P04') console.log(`banco de teste já existia: ${nomeBanco}`);
  else throw erro;
} finally {
  await admin.end();
}
