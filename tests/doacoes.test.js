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

// Backlog: os testes de listar (história 7) e aceitar (história 8) entram
// nos próximos commits do grupo — cada um troca o `it.todo` da sua história
// por um `it` de verdade.
describe('listar doações disponíveis (história 7)', () => {
  it.todo('mostra a doação publicada na lista de disponíveis');
  it.todo('remove a doação da lista de disponíveis depois de aceita');
});

describe('aceitar uma doação (história 8)', () => {
  it.todo('marca a doação como aceita pela ONG');
  it.todo('recusa aceitar uma doação que já foi aceita por outra ONG');
});