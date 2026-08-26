const autenticacaoServico = require('./autenticacao.servico');
const { sucesso } = require('../../utils/responder');

class AutenticacaoControlador {
  async login(req, res) {
    return sucesso(
      res,
      await autenticacaoServico.login(req.validado.corpo),
      'Login realizado com sucesso'
    );
  }

  async solicitarRecuperacao(req, res) {
    return sucesso(
      res,
      await autenticacaoServico.solicitarRecuperacao(
        req.validado.corpo.email
      ),
      'Se o e-mail estiver cadastrado, enviaremos um código de recuperação'
    );
  }

  async validarCodigoRecuperacao(req, res) {
    return sucesso(
      res,
      autenticacaoServico.validarCodigoRecuperacao(
        req.validado.corpo.email,
        req.validado.corpo.codigo
      ),
      'Código validado com sucesso'
    );
  }

  async redefinirSenha(req, res) {
    return sucesso(
      res,
      await autenticacaoServico.redefinirSenha(
        req.validado.corpo.email,
        req.validado.corpo.codigo,
        req.validado.corpo.novaSenha
      ),
      'Senha redefinida com sucesso'
    );
  }

  async usuarioAutenticado(req, res) {
    return sucesso(
      res,
      autenticacaoServico.serializarUsuario(req.usuario),
      'Usuario autenticado'
    );
  }
}

module.exports = new AutenticacaoControlador();