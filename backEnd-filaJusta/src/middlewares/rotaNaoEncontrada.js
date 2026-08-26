const ErroAplicacao = require('../utils/erroAplicacao');

module.exports = (req, _res, next) => {
  next(new ErroAplicacao(`Rota nao encontrada: ${req.method} ${req.originalUrl}`, 404));
};
