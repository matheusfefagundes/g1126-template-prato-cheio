// ADR 0002, camada 2: recusa a suíte inteira antes de qualquer teste rodar,
// se o banco em DATABASE_URL não for claramente um banco de teste.
function nomeBanco(urlStr) {
  try { return new URL(urlStr ?? '').pathname.replace(/^\//, ''); }
  catch { return ''; }
}

if (!/_test$/.test(nomeBanco(process.env.DATABASE_URL))) {
  throw new Error('Suíte de testes recusada: DATABASE_URL não aponta para um banco "_test".');
}
