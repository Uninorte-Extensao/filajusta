const jwt = require('jsonwebtoken');
const ambiente = require('../config/ambiente');
const ErroAplicacao = require('../utils/erroAplicacao');
const { Usuario } = require('../banco/modelos');

const autenticarUsuario = async (req, _res, next) => {
  try {
    const cabecalho = req.headers.authorization || '';
    const [tipo, token] = cabecalho.split(' ');

    if (tipo !== 'Bearer' || !token) {
      throw new ErroAplicacao('Token de autenticacao ausente', 401);
    }

    const payload = jwt.verify(token, ambiente.jwt.segredo);
    const usuario = await Usuario.findByPk(payload.sub, {
      attributes: ['id', 'nome', 'email', 'perfil', 'ativo']
    });

    if (!usuario || !usuario.ativo) {
      throw new ErroAplicacao('Usuario nao autorizado', 401);
    }

    req.usuario = usuario;
    return next();
  } catch (erro) {
    if (erro instanceof ErroAplicacao) return next(erro);
    return next(new ErroAplicacao('Token invalido ou expirado', 401));
  }
};

module.exports = autenticarUsuario;
