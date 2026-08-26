const consultaServico = require('./consulta.servico');
const { sucesso } = require('../../utils/responder');

class ConsultaControlador {
  async listar(req, res) {
    return sucesso(res, await consultaServico.listar(req.validado.consulta), 'Consultas encontradas');
  }

  async buscar(req, res) {
    return sucesso(res, await consultaServico.buscar(req.validado.parametros.id), 'Consulta encontrada');
  }

  async criar(req, res) {
    return sucesso(res, await consultaServico.criar(req.validado.corpo), 'Consulta agendada', 201);
  }

  async atualizarStatus(req, res) {
    const mensagem =
      req.validado.corpo.status === 'falta'
        ? 'Consulta marcada como falta com sucesso'
        : 'Status da consulta atualizado';

    return sucesso(
      res,
      await consultaServico.atualizarStatus(req.validado.parametros.id, req.validado.corpo),
      mensagem
    );
  }

  async remover(req, res) {
    return sucesso(res, await consultaServico.cancelar(req.validado.parametros.id), 'Consulta cancelada');
  }
}

module.exports = new ConsultaControlador();
