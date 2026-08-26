const ErroAplicacao = require('../utils/erroAplicacao');

const validar = (schema) => (req, _res, next) => {
  const resultado = schema.safeParse({
    corpo: req.body,
    parametros: req.params,
    consulta: req.query
  });

  if (!resultado.success) {
    const detalhes = resultado.error.issues.map((item) => ({
      campo: item.path.join('.'),
      mensagem: item.message
    }));
    return next(new ErroAplicacao('Erro de validacao', 400, detalhes));
  }

  req.validado = resultado.data;
  return next();
};

module.exports = validar;
