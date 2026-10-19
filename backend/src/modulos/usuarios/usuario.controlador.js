const usuarioServico = require('./usuario.servico');
const { sucesso } = require('../../utils/responder');

class UsuarioControlador {
  async listar(_req, res) {
    return sucesso(res, await usuarioServico.listar(), 'Usuarios encontrados');
  }

  async buscar(req, res) {
    return sucesso(res, await usuarioServico.buscar(req.validado.parametros.id), 'Usuario encontrado');
  }

  async criar(req, res) {
    return sucesso(res, await usuarioServico.criar(req.validado.corpo), 'Usuario criado', 201);
  }

  async atualizar(req, res) {
    return sucesso(res, await usuarioServico.atualizar(req.validado.parametros.id, req.validado.corpo), 'Usuario atualizado');
  }

  async remover(req, res) {
    await usuarioServico.remover(req.validado.parametros.id);
    return sucesso(res, null, 'Usuario removido');
  }
}

module.exports = new UsuarioControlador();
