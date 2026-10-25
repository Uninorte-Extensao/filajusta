const { Router } = require('express');
const autenticacaoControlador = require('./autenticacao.controlador');
const validar = require('../../middlewares/validar');
const autenticar = require('../../middlewares/autenticar');
const tratarAsync = require('../../utils/tratarAsync');
const { limitarLogin, limitarRecuperacao } = require('../../middlewares/limiteRequisicoes');
const { login, solicitarRecuperacao, validarRecuperacao, redefinirSenha } = require('./autenticacao.validador');

const rotas = Router();

rotas.post('/login', limitarLogin, validar(login), tratarAsync(autenticacaoControlador.login));
rotas.get('/me', autenticar, tratarAsync(autenticacaoControlador.usuarioAutenticado));

rotas.post(
  '/recuperacao/solicitar',
  limitarRecuperacao,
  validar(solicitarRecuperacao),
  tratarAsync(autenticacaoControlador.solicitarRecuperacao)
);
rotas.post(
  '/recuperacao/validar',
  limitarRecuperacao,
  validar(validarRecuperacao),
  tratarAsync(autenticacaoControlador.validarRecuperacao)
);
rotas.post(
  '/recuperacao/redefinir',
  limitarRecuperacao,
  validar(redefinirSenha),
  tratarAsync(autenticacaoControlador.redefinirSenha)
);

module.exports = rotas;
