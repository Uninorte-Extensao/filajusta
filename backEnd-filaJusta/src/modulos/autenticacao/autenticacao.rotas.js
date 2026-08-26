const { Router } = require('express');

const autenticacaoControlador = require('./autenticacao.controlador');

const validar = require('../../middlewares/validar');
const autenticar = require('../../middlewares/autenticar');
const tratarAsync = require('../../utils/tratarAsync');

const {
  limitarLogin
} = require('../../middlewares/limiteRequisicoes');

const {
  login,
  solicitarRecuperacao,
  validarCodigoRecuperacao,
  redefinirSenha
} = require('./autenticacao.validador');

const rotas = Router();

rotas.post(
  '/login',
  limitarLogin,
  validar(login),
  tratarAsync(autenticacaoControlador.login)
);

rotas.post(
  '/recuperacao/solicitar',
  validar(solicitarRecuperacao),
  tratarAsync(
    autenticacaoControlador.solicitarRecuperacao
  )
);

rotas.post(
  '/recuperacao/validar',
  validar(validarCodigoRecuperacao),
  tratarAsync(
    autenticacaoControlador.validarCodigoRecuperacao
  )
);

rotas.post(
  '/recuperacao/redefinir',
  validar(redefinirSenha),
  tratarAsync(
    autenticacaoControlador.redefinirSenha
  )
);

rotas.get(
  '/me',
  autenticar,
  tratarAsync(
    autenticacaoControlador.usuarioAutenticado
  )
);

module.exports = rotas;