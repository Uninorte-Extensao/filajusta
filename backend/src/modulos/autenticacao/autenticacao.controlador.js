const autenticacaoServico = require('./autenticacao.servico');
const { sucesso } = require('../../utils/responder');

class AutenticacaoControlador {
  async login(req, res) {
    return sucesso(res, await autenticacaoServico.login(req.validado.corpo), 'Login realizado com sucesso');
  }

  async usuarioAutenticado(req, res) {
    return sucesso(res, autenticacaoServico.serializarUsuario(req.usuario), 'Usuario autenticado');
  }

  async solicitarRecuperacao(req, res) {
    await autenticacaoServico.solicitarRecuperacao(req.validado.corpo);
    return sucesso(res, null, 'Se o e-mail estiver cadastrado, enviamos um codigo de recuperacao');
  }

  async validarRecuperacao(req, res) {
    await autenticacaoServico.validarRecuperacao(req.validado.corpo);
    return sucesso(res, null, 'Codigo valido');
  }

  async redefinirSenha(req, res) {
    await autenticacaoServico.redefinirSenha(req.validado.corpo);
    return sucesso(res, null, 'Senha redefinida com sucesso');
  }
}

module.exports = new AutenticacaoControlador();
