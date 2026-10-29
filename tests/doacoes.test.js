import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, encerrar } from '../src/db.js';

const app = criarApp();

// Datas relativas a hoje, para a Regra de Expiração do Alimento (Aula 11) não
// quebrar os testes conforme o tempo passa. `date('now')` do SQLite é UTC,
// então usamos UTC aqui também para comparar com a mesma referência.
function dataFutura(dias) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}
const dataPassada = (dias) => dataFutura(-dias);
const VALIDADE_PADRAO = dataFutura(30);

// Este teste já passa e não depende do banco:
// prova que a aplicação sobe e que o CI está funcionando.
describe('a aplicação sobe', () => {
  it('responde na verificação de saúde', async () => {
    const res = await request(app).get('/api/saude');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('publicar uma doação (história 6)', () => {
  beforeEach(async () => { await migrar(); await limparBanco(); });
  afterAll(async () => { await encerrar(); });

  // Dado que o doador ainda não publicou nenhuma doação
  // Quando ele envia o formulário sem um dos campos obrigatórios
  // Então o sistema recusa a publicação
  it('recusa doação sem os campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Sopa', quantidade: '10 porções' });

    expect(res.status).toBe(400);
  });
});

describe('listar doações disponíveis (história 7)', () => {
  beforeEach(async () => { await migrar(); await limparBanco(); });
  afterAll(async () => { await encerrar(); });

  // Dado que existe uma doação publicada e ainda não aceita
  // Quando a ONG consulta a lista de doações disponíveis
  // Então a doação aparece na lista
  it('mostra a doação publicada na lista de disponíveis', async () => {
    await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Sopa', quantidade: '10 porções', validade: VALIDADE_PADRAO });

    const res = await request(app).get('/api/doacoes');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].tipo).toBe('Sopa');
  });

  // Dado que existe uma doação publicada e já aceita por uma ONG
  // Quando qualquer ONG consulta a lista de doações disponíveis
  // Então essa doação não aparece mais na lista
  it('remove a doação da lista de disponíveis depois de aceita', async () => {
    const criada = await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Sopa', quantidade: '10 porções', validade: VALIDADE_PADRAO });

    await request(app)
      .post(`/api/doacoes/${criada.body.id}/aceitar`)
      .send({ ong: 'ONG Esperança' });

    const lista = await request(app).get('/api/doacoes');
    expect(lista.body).toHaveLength(0);
  });
});

describe('aceitar uma doação (história 8)', () => {
  beforeEach(async () => { await migrar(); await limparBanco(); });
  afterAll(async () => { await encerrar(); });

  // Dado que existe uma doação publicada e ainda não aceita
  // Quando uma ONG aciona "aceitar"
  // Então a doação passa para o status "aceita" e fica associada àquela ONG
  it('marca a doação como aceita pela ONG', async () => {
    const criada = await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Sopa', quantidade: '10 porções', validade: VALIDADE_PADRAO });

    const res = await request(app)
      .post(`/api/doacoes/${criada.body.id}/aceitar`)
      .send({ ong: 'ONG Esperança' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('aceita');
    expect(res.body.ong).toBe('ONG Esperança');
  });

  // Dado que existe uma doação já aceita por uma ONG
  // Quando uma segunda ONG tenta aceitar a mesma doação
  // Então o sistema recusa o aceite e a doação permanece com a primeira ONG
  it('recusa aceitar uma doação que já foi aceita por outra ONG', async () => {
    const criada = await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Sopa', quantidade: '10 porções', validade: VALIDADE_PADRAO });

    await request(app)
      .post(`/api/doacoes/${criada.body.id}/aceitar`)
      .send({ ong: 'ONG Esperança' });

    const segundoAceite = await request(app)
      .post(`/api/doacoes/${criada.body.id}/aceitar`)
      .send({ ong: 'ONG Solidária' });

    expect(segundoAceite.status).toBe(400);
    expect(segundoAceite.body.erro).toBe('Doação já reservada');
  });
});

describe('marcar uma doação como coletada (história coletada)', () => {
  beforeEach(async () => { await migrar(); await limparBanco(); });
  afterAll(async () => { await encerrar(); });

  async function criarAceita() {
    const criada = await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Sopa', quantidade: '10 porções', validade: VALIDADE_PADRAO });
    await request(app)
      .post(`/api/doacoes/${criada.body.id}/aceitar`)
      .send({ ong: 'ONG Esperança' });
    return criada.body.id;
  }

  // Dado que existe uma doação aceita
  // Quando a ONG marca como coletada
  // Então o status vira "coletada"
  it('marca a doação aceita como coletada', async () => {
    const id = await criarAceita();

    const res = await request(app).post(`/api/doacoes/${id}/coletar`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('coletada');
  });

  // Dado que uma doação já está coletada
  // Quando alguém tenta marcar de novo
  // Então o sistema recusa
  it('recusa marcar como coletada uma doação que já está coletada', async () => {
    const id = await criarAceita();
    await request(app).post(`/api/doacoes/${id}/coletar`);

    const segunda = await request(app).post(`/api/doacoes/${id}/coletar`);

    expect(segunda.status).toBe(400);
    expect(segunda.body.erro).toBe('Doação não está aceita ou já foi coletada');
  });

  // Dado que existe uma doação ainda disponível (não aceita)
  // Quando alguém tenta marcar como coletada
  // Então o sistema recusa, pois ninguém coleta o que não foi aceito
  it('recusa marcar como coletada uma doação que ainda não foi aceita', async () => {
    const criada = await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Pão', quantidade: '20 unidades', validade: VALIDADE_PADRAO });

    const res = await request(app).post(`/api/doacoes/${criada.body.id}/coletar`);

    expect(res.status).toBe(400);
  });
});

describe('doação vencida não pode mais ser aceita (Regra de Expiração do Alimento)', () => {
  beforeEach(async () => { await migrar(); await limparBanco(); });
  afterAll(async () => { await encerrar(); });

  // Dado que uma doação está disponível e sua validade já passou
  // Quando alguém tenta aceitá-la
  // Então o sistema recusa e marca a doação como expirada
  it('recusa aceitar uma doação com validade vencida', async () => {
    const criada = await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Sopa', quantidade: '10 porções', validade: dataPassada(1) });

    const res = await request(app).post(`/api/doacoes/${criada.body.id}/aceitar`);

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('Doação expirada, não pode mais ser aceita');
  });

  // Dado que existe uma doação disponível e sua validade já passou
// Quando qualquer pessoa consulta a lista de disponíveis
// Então ela não aparece
it('não lista uma doação com validade vencida', async () => {
  await request(app)
    .post('/api/doacoes')
    .send({ tipo: 'Sopa', quantidade: '10 porções', validade: dataPassada(1) });

  const res = await request(app).get('/api/doacoes');

  expect(res.body).toHaveLength(0);
});

// Dado que existe uma doação com validade igual a hoje
// Quando a lista de disponíveis é consultada
// Então ela continua aparecendo (hoje ainda vale, "retirar até")
it('mantém doação com validade de hoje na lista', async () => {
  await request(app)
    .post('/api/doacoes')
    .send({ tipo: 'Pão', quantidade: '5 unidades', validade: dataFutura(0) });

  const res = await request(app).get('/api/doacoes');

  expect(res.body).toHaveLength(1);
});

// Dado que uma doação vencida foi marcada como expirada
// Quando alguém consulta a lista de disponíveis depois
// Então o status dela no banco é 'expirada' (confirma o efeito, não só o status HTTP)
it('marca a doação vencida como expirada ao listar', async () => {
  const criada = await request(app)
    .post('/api/doacoes')
    .send({ tipo: 'Sopa', quantidade: '10 porções', validade: dataPassada(2) });

  await request(app).get('/api/doacoes'); // dispara a expiração

  const tentativa = await request(app).post(`/api/doacoes/${criada.body.id}/aceitar`);

  expect(tentativa.body.erro).toBe('Doação expirada, não pode mais ser aceita');
});

// E se a doação não existir?
it('recusa aceitar uma doação que não existe', async () => {
  const res = await request(app).post('/api/doacoes/99999/aceitar');

  expect(res.status).toBe(400);
  expect(res.body.erro).toBe('Doação não encontrada');
});

// E se a lista já tiver sido consultada antes (a doação já expirou)?
it('recusa aceitar doação já expirada numa listagem anterior', async () => {
  const criada = await request(app)
    .post('/api/doacoes')
    .send({ tipo: 'Sopa', quantidade: '10 porções', validade: dataPassada(1) });

  await request(app).get('/api/doacoes'); // primeira listagem, já expira

  const res = await request(app).post(`/api/doacoes/${criada.body.id}/aceitar`); // chamada separada

  expect(res.status).toBe(400);
  expect(res.body.erro).toBe('Doação expirada, não pode mais ser aceita');
});
});
