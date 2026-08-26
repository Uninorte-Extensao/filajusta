const { Router } = require('express');
const agendaControlador = require('./agenda.controlador');
const autenticar = require('../../middlewares/autenticar');
const autorizar = require('../../middlewares/autorizar');
const validar = require('../../middlewares/validar');
const tratarAsync = require('../../utils/tratarAsync');
const { horarios, dia } = require('./agenda.validador');

const rotas = Router();

rotas.use(autenticar, autorizar('admin', 'recepcao'));
rotas.get('/horarios', validar(horarios), tratarAsync(agendaControlador.horarios));
rotas.get('/slots', validar(horarios), tratarAsync(agendaControlador.horarios));
rotas.get('/dia', validar(dia), tratarAsync(agendaControlador.dia));
rotas.get('/day', validar(dia), tratarAsync(agendaControlador.dia));

module.exports = rotas;
