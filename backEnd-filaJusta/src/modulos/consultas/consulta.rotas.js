const { Router } = require('express');
const consultaControlador = require('./consulta.controlador');
const autenticar = require('../../middlewares/autenticar');
const autorizar = require('../../middlewares/autorizar');
const validar = require('../../middlewares/validar');
const tratarAsync = require('../../utils/tratarAsync');
const { criarConsulta, atualizarStatus, listarConsultas, buscarPorId } = require('./consulta.validador');

const rotas = Router();

rotas.use(autenticar, autorizar('admin', 'recepcao'));
rotas.post('/', validar(criarConsulta), tratarAsync(consultaControlador.criar));
rotas.get('/', validar(listarConsultas), tratarAsync(consultaControlador.listar));
rotas.get('/:id', validar(buscarPorId), tratarAsync(consultaControlador.buscar));
rotas.patch('/:id/status', validar(atualizarStatus), tratarAsync(consultaControlador.atualizarStatus));
rotas.delete('/:id', validar(buscarPorId), tratarAsync(consultaControlador.remover));

module.exports = rotas;
