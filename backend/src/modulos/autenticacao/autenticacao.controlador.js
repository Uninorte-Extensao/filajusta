const autenticacaoServico = require('./autenticacao.servico');
const { sucesso } = require('../../utils/responder');

class AutenticacaoControlador {
  async login(req, res) {
    return sucesso(res, await autenticacaoServico.login(req.validado.corpo), 'Login realizado com sucesso');
  }

  async usuarioAutenticado(req, res) {
    return sucesso(res, autenticacaoServico.serializarUsuario(req.usuario), 'Usuario autenticado');
  }
}

module.exports = new AutenticacaoControlador();
