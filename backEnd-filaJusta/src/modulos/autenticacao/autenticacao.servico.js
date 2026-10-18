const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ambiente = require('../../config/ambiente');
const ErroAplicacao = require('../../utils/erroAplicacao');
const { Usuario } = require('../../banco/modelos');

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
