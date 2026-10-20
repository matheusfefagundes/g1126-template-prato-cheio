import { describe, it, expect, afterEach, vi } from 'vitest';

describe('segurança do banco de testes', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('recusa limpar banco que não é o de teste', async () => {
    vi.stubEnv('DATABASE_FILE', 'dados-piloto-fake.sqlite');
    vi.resetModules();
    const dbIsolado = await import('../src/db.js');
    await expect(dbIsolado.limparBanco()).rejects.toThrow(/não é o de teste/);
  });
});
