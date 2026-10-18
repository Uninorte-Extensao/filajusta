const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ambiente = require('../../config/ambiente');
const ErroAplicacao = require('../../utils/erroAplicacao');
const { Usuario } = require('../../banco/modelos');
const usuarioRepositorio = require('../usuarios/usuario.repositorio');
const emailServico = require('../email/email.servico');

// Armazenamento temporário em memória.
// Para produção, depois podemos mover para Redis ou banco.
const recuperacoes = new Map();

class AutenticacaoServico {
  async login(dados) {
    const usuario = await Usuario.findOne({
      where: {
        email: dados.email
      }
    });

    if (!usuario || !usuario.ativo) {
      throw new ErroAplicacao('Credenciais invalidas', 401);
    }

    const senha = dados.senha || dados.password;

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha_hash
    );

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

  async solicitarRecuperacao(email) {
    const emailNormalizado = String(email)
      .trim()
      .toLowerCase();

    const usuario =
      await usuarioRepositorio.buscarPorEmail(
        emailNormalizado
      );

    if (!usuario || !usuario.ativo) {
      // Não revela se o e-mail existe.
      return {
        enviado: true
      };
    }

    const codigo = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    const expiraEm =
      Date.now() + 10 * 60 * 1000;

    recuperacoes.set(emailNormalizado, {
      codigo,
      expiraEm,
      validado: false
    });

    await emailServico.enviarCodigoRecuperacao(
      usuario.email,
      codigo
    );

    return {
      enviado: true
    };
  }

  validarCodigoRecuperacao(email, codigo) {
    const emailNormalizado = String(email)
      .trim()
      .toLowerCase();

    const recuperacao =
      recuperacoes.get(emailNormalizado);

    if (!recuperacao) {
      throw new ErroAplicacao(
        'Codigo invalido ou expirado',
        400
      );
    }

    if (Date.now() > recuperacao.expiraEm) {
      recuperacoes.delete(emailNormalizado);

      throw new ErroAplicacao(
        'Codigo invalido ou expirado',
        400
      );
    }

    if (
      String(recuperacao.codigo) !==
      String(codigo).trim()
    ) {
      throw new ErroAplicacao(
        'Codigo invalido ou expirado',
        400
      );
    }

    recuperacao.validado = true;

    recuperacoes.set(
      emailNormalizado,
      recuperacao
    );

    return {
      valido: true
    };
  }

  async redefinirSenha(
    email,
    codigo,
    novaSenha
  ) {
    const emailNormalizado = String(email)
      .trim()
      .toLowerCase();

    const recuperacao =
      recuperacoes.get(emailNormalizado);

    if (!recuperacao) {
      throw new ErroAplicacao(
        'Codigo invalido ou expirado',
        400
      );
    }

    if (Date.now() > recuperacao.expiraEm) {
      recuperacoes.delete(emailNormalizado);

      throw new ErroAplicacao(
        'Codigo invalido ou expirado',
        400
      );
    }

    if (
      String(recuperacao.codigo) !==
      String(codigo).trim()
    ) {
      throw new ErroAplicacao(
        'Codigo invalido ou expirado',
        400
      );
    }

    const usuario =
      await usuarioRepositorio.buscarPorEmail(
        emailNormalizado
      );

    if (!usuario) {
      throw new ErroAplicacao(
        'Usuario nao encontrado',
        404
      );
    }

    const senha_hash = await bcrypt.hash(
      novaSenha,
      ambiente.bcrypt.saltos
    );

    await usuario.update({
      senha_hash
    });

    recuperacoes.delete(emailNormalizado);

    return {
      redefinida: true
    };
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