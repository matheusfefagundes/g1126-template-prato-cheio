export default {
  test: {
    setupFiles: ['./tests/setup.js'],
    // SQLite em memória: os testes não tocam o arquivo do banco de desenvolvimento.
    env: { DATABASE_FILE: ':memory:' }
  }
};
