if (process.env.DATABASE_FILE !== ':memory:') {
  throw new Error('Suíte de testes recusada: DATABASE_FILE não é :memory:.');
}
