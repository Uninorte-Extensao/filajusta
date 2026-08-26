const especialidadeServico = require('./especialidade.servico');
const { sucesso } = require('../../utils/responder');

class EspecialidadeControlador {
  async listar(_req, res) {
    return sucesso(res, await especialidadeServico.listar(), 'Especialidades encontradas');
  }

  async buscar(req, res) {
    return sucesso(res, await especialidadeServico.buscar(req.validado.parametros.id), 'Especialidade encontrada');
  }

  async criar(req, res) {
    return sucesso(res, await especialidadeServico.criar(req.validado.corpo), 'Especialidade criada', 201);
  }

  async atualizar(req, res) {
    return sucesso(res, await especialidadeServico.atualizar(req.validado.parametros.id, req.validado.corpo), 'Especialidade atualizada');
  }

  async remover(req, res) {
    await especialidadeServico.remover(req.validado.parametros.id);
    return sucesso(res, null, 'Especialidade removida');
  }
}

module.exports = new EspecialidadeControlador();
