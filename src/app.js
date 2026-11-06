import express from "express";
import * as doacoes from "./doacoes.js";

function comTratamentoDeErro(manipulador) {
  return async (req, res) => {
    try {
      await manipulador(req, res);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  };
}

export function criarApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static("public"));

  app.get("/api/saude", (req, res) => res.json({ ok: true }));
  
  app.get(
    "/api/doacoes",
    comTratamentoDeErro(async (req, res) => {
      res.json(await doacoes.listarDisponiveis());
    }),
  );

  app.post(
    "/api/doacoes",
    comTratamentoDeErro(async (req, res) => {
      res.status(201).json(await doacoes.criarDoacao(req.body));
    }),
  );

  app.post(
    "/api/doacoes/:id/aceitar",
    comTratamentoDeErro(async (req, res) => {
      res.json(await doacoes.aceitar(req.params.id, req.body?.ong ?? "ONG"));
    }),
  );

  app.get(
    "/api/doacoes/aceitas",
    comTratamentoDeErro(async (req, res) => {
      res.json(await doacoes.listarAceitas());
    }),
  );

  app.post(
    "/api/doacoes/:id/coletar",
    comTratamentoDeErro(async (req, res) => {
      res.json(await doacoes.coletar(req.params.id));
    }),
  );
  return app;
}
