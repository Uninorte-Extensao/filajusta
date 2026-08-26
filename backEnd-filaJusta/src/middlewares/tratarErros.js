const { ZodError } = require('zod');
const { erro: responderErro } = require('../utils/responder');
const ErroAplicacao = require('../utils/erroAplicacao');
const { logger } = require('../utils/logger');

const tratarErros = (erro, _req, res, _next) => {
  if (erro instanceof ZodError) {
    const detalhes = erro.issues.map((item) => ({
      campo: item.path.join('.'),
      mensagem: item.message
    }));
    return responderErro(res, 'Erro de validacao', 400, detalhes);
  }

  if (erro instanceof ErroAplicacao || erro.operacional) {
    return responderErro(res, erro.message, erro.statusHttp || 500, erro.erro || null);
  }

  if (erro.name === 'MulterError') {
    const mensagem = erro.code === 'LIMIT_FILE_SIZE' ? 'Arquivo excede o tamanho maximo permitido' : erro.message;
    return responderErro(res, mensagem, 400);
  }

  logger.error('Erro interno nao tratado', erro);
  return responderErro(res, 'Erro interno do servidor', 500);
};

module.exports = tratarErros;
