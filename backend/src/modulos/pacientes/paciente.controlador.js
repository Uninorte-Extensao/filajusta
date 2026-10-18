const pacienteServico = require('./paciente.servico');
const { sucesso } = require('../../utils/responder');

class PacienteControlador {
  async listar(_req, res) {
    return sucesso(res, await pacienteServico.listar(), 'Pacientes encontrados');
  }

  async buscar(req, res) {
    return sucesso(res, await pacienteServico.buscar(req.validado.parametros.id), 'Paciente encontrado');
  }

  async criar(req, res) {
    return sucesso(res, await pacienteServico.criar(req.validado.corpo), 'Paciente criado', 201);
  }

  async atualizar(req, res) {
    return sucesso(res, await pacienteServico.atualizar(req.validado.parametros.id, req.validado.corpo), 'Paciente atualizado');
  }

  async remover(req, res) {
    await pacienteServico.remover(req.validado.parametros.id);
    return sucesso(res, null, 'Paciente removido');
  }
}

module.exports = new PacienteControlador();
