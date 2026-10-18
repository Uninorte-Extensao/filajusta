const { Router } = require('express');
const autenticacaoControlador = require('./autenticacao.controlador');
const validar = require('../../middlewares/validar');
const autenticar = require('../../middlewares/autenticar');
const tratarAsync = require('../../utils/tratarAsync');
const { limitarLogin } = require('../../middlewares/limiteRequisicoes');
const { login } = require('./autenticacao.validador');

const rotas = Router();

rotas.post('/login', limitarLogin, validar(login), tratarAsync(autenticacaoControlador.login));
rotas.get('/me', autenticar, tratarAsync(autenticacaoControlador.usuarioAutenticado));

module.exports = rotas;
