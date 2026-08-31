import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, encerrar } from '../src/db.js';

const app = criarApp();

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

// Backlog: o teste de listar (história 7) entra no próximo commit do grupo.
describe('listar doações disponíveis (história 7)', () => {
  it.todo('mostra a doação publicada na lista de disponíveis');
  it.todo('remove a doação da lista de disponíveis depois de aceita');
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
      .send({ tipo: 'Sopa', quantidade: '10 porções', validade: '2026-08-01' });

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
      .send({ tipo: 'Sopa', quantidade: '10 porções', validade: '2026-08-01' });

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