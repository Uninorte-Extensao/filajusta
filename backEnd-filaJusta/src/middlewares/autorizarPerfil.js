const ErroAplicacao = require('../utils/erroAplicacao');

const autorizarPerfil = (...perfis) => (req, _res, next) => {
  if (!req.usuario) {
    return next(new ErroAplicacao('Usuario nao autenticado', 401));
  }

  if (!perfis.includes(req.usuario.perfil)) {
    return next(new ErroAplicacao('Permissao insuficiente', 403));
  }

  return next();
};

module.exports = autorizarPerfil;
