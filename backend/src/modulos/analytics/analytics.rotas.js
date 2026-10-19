// src/modulos/analytics/analytics.rotas.js
const { Router } = require('express');
const analyticsControlador = require('./analytics.controlador');
const autenticar = require('../../middlewares/autenticar');
const autorizar = require('../../middlewares/autorizar');

const rotas = Router();

// Aplica a autenticação JWT para todas as rotas de analytics
rotas.use(autenticar);

// Permite acesso para os perfis 'admin' e 'recepcao'
rotas.get('/kpis', autorizar('admin', 'recepcao'), analyticsControlador.obterKPIs);
rotas.get('/noshow-especialidades', autorizar('admin', 'recepcao'), analyticsControlador.obterNoShowPorEspecialidade);
rotas.get('/alto-risco', autorizar('admin', 'recepcao'), analyticsControlador.obterConsultasAltoRisco);

module.exports = rotas;