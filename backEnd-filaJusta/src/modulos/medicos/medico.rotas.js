const { Router } = require('express');
const medicoControlador = require('./medico.controlador');
const autenticar = require('../../middlewares/autenticar');
const autorizar = require('../../middlewares/autorizar');
const validar = require('../../middlewares/validar');
const tratarAsync = require('../../utils/tratarAsync');
const { criarMedico, atualizarMedico, buscarPorId } = require('./medico.validador');

const rotas = Router();

rotas.use(autenticar);
rotas.get('/', autorizar('admin', 'recepcao'), tratarAsync(medicoControlador.listar));
rotas.post('/', autorizar('admin'), validar(criarMedico), tratarAsync(medicoControlador.criar));
rotas.get('/:id', autorizar('admin', 'recepcao'), validar(buscarPorId), tratarAsync(medicoControlador.buscar));
rotas.patch('/:id', autorizar('admin'), validar(atualizarMedico), tratarAsync(medicoControlador.atualizar));
rotas.delete('/:id', autorizar('admin'), validar(buscarPorId), tratarAsync(medicoControlador.remover));

module.exports = rotas;
