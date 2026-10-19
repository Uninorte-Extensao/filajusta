const { Router } = require('express');
const autenticacaoRotas = require('../modulos/autenticacao/autenticacao.rotas');
const rotasPublicas = require('./publicas');
const rotasAdmin = require('./admin');
const rotasRecepcao = require('./recepcao');

const rotas = Router();

rotas.use('/autenticacao', autenticacaoRotas);
rotas.use('/auth', autenticacaoRotas);
rotas.use('/admin', rotasAdmin);
rotas.use('/recepcao', rotasRecepcao);
rotas.use('/', rotasPublicas);

module.exports = rotas;
