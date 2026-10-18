const medicoServico = require('./medico.servico');
const { sucesso } = require('../../utils/responder');

class MedicoControlador {
  async listar(_req, res) {
    return sucesso(res, await medicoServico.listar(), 'Medicos encontrados');
  }

  async buscar(req, res) {
    return sucesso(res, await medicoServico.buscar(req.validado.parametros.id), 'Medico encontrado');
  }

  async criar(req, res) {
    return sucesso(res, await medicoServico.criar(req.validado.corpo), 'Medico criado', 201);
  }

  async atualizar(req, res) {
    return sucesso(res, await medicoServico.atualizar(req.validado.parametros.id, req.validado.corpo), 'Medico atualizado');
  }

  async remover(req, res) {
    await medicoServico.remover(req.validado.parametros.id);
    return sucesso(res, null, 'Medico removido');
  }
}

module.exports = new MedicoControlador();
