const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ambiente = require('../../config/ambiente');
const ErroAplicacao = require('../../utils/erroAplicacao');
const { logger } = require('../../utils/logger');
const emailServico = require('../email/email.servico');
const { Usuario } = require('../../banco/modelos');

const MENSAGEM_CODIGO_INVALIDO = 'Codigo invalido ou expirado';
const limparRecuperacao = {
  recuperacao_codigo_hash: null,
  recuperacao_expira_em: null,
  recuperacao_tentativas: 0
};

class AutenticacaoServico {
  async login(dados) {
    const usuario = await Usuario.findOne({ where: { email: dados.email } });

    if (!usuario || !usuario.ativo) {
      throw new ErroAplicacao('Credenciais invalidas', 401);
    }

    const senha = dados.senha || dados.password;
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      throw new ErroAplicacao('Credenciais invalidas', 401);
    }

    const token = jwt.sign(
      {
        perfil: usuario.perfil,
        email: usuario.email
      },
      ambiente.jwt.segredo,
      {
        subject: usuario.id,
        expiresIn: ambiente.jwt.expiracao
      }
    );

    return {
      token,
      expiracao: ambiente.jwt.expiracao,
      usuario: this.serializarUsuario(usuario)
    };
  }

  async solicitarRecuperacao({ email }) {
    const usuario = await Usuario.findOne({ where: { email } });

    // Resposta neutra: nao revela se o e-mail existe.
    if (!usuario || !usuario.ativo) return;

    const codigo = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const expiraEm = new Date(Date.now() + ambiente.recuperacaoSenha.expiracaoMinutos * 60 * 1000);

    await usuario.update({
      recuperacao_codigo_hash: await bcrypt.hash(codigo, 10),
      recuperacao_expira_em: expiraEm,
      recuperacao_tentativas: 0
    });

    try {
      await emailServico.enviarCodigoRecuperacao(usuario.email, codigo);
    } catch (falha) {
      await usuario.update(limparRecuperacao);
      logger.error(`Falha ao enviar e-mail de recuperacao: ${falha.message}`);
      throw new ErroAplicacao('Nao foi possivel enviar o e-mail de recuperacao. Tente novamente mais tarde.', 503);
    }
  }

  async conferirCodigoRecuperacao({ email, codigo }) {
    const usuario = await Usuario.findOne({ where: { email } });

    if (
      !usuario ||
      !usuario.ativo ||
      !usuario.recuperacao_codigo_hash ||
      !usuario.recuperacao_expira_em ||
      new Date(usuario.recuperacao_expira_em) < new Date() ||
      usuario.recuperacao_tentativas >= ambiente.recuperacaoSenha.maximoTentativas
    ) {
      if (usuario && usuario.recuperacao_codigo_hash) await usuario.update(limparRecuperacao);
      throw new ErroAplicacao(MENSAGEM_CODIGO_INVALIDO, 400);
    }

    const codigoCorreto = await bcrypt.compare(codigo, usuario.recuperacao_codigo_hash);
    if (!codigoCorreto) {
      const tentativas = usuario.recuperacao_tentativas + 1;
      await usuario.update(
        tentativas >= ambiente.recuperacaoSenha.maximoTentativas
          ? limparRecuperacao
          : { recuperacao_tentativas: tentativas }
      );
      throw new ErroAplicacao(MENSAGEM_CODIGO_INVALIDO, 400);
    }

    return usuario;
  }

  async validarRecuperacao(dados) {
    await this.conferirCodigoRecuperacao(dados);
  }

  async redefinirSenha({ email, codigo, novaSenha }) {
    const usuario = await this.conferirCodigoRecuperacao({ email, codigo });

    await usuario.update({
      senha_hash: await bcrypt.hash(novaSenha, ambiente.bcrypt.saltos),
      ...limparRecuperacao
    });
  }

  serializarUsuario(usuario) {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      ativo: usuario.ativo
    };
  }
}

module.exports = new AutenticacaoServico();
