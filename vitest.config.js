export default {
  test: {
    setupFiles: ['./tests/setup.js'],
    // Compartilham um único banco Postgres real (não há um ":memory:" por
    // processo); roda os arquivos de teste em série para não colidir.
    fileParallelism: false,
    env: { DATABASE_URL: 'postgres://pratocheio:pratocheio@localhost:5432/pratocheio_test' }
  }
};
