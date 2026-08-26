const { Router } = require('express');
const pacienteControlador = require('./paciente.controlador');
const autenticar = require('../../middlewares/autenticar');
const autorizar = require('../../middlewares/autorizar');
const validar = require('../../middlewares/validar');
const tratarAsync = require('../../utils/tratarAsync');
const { criarPaciente, atualizarPaciente, buscarPorId } = require('./paciente.validador');

const rotas = Router();

rotas.use(autenticar);
rotas.get('/', autorizar('admin', 'recepcao'), tratarAsync(pacienteControlador.listar));
rotas.post('/', autorizar('admin', 'recepcao'), validar(criarPaciente), tratarAsync(pacienteControlador.criar));
rotas.get('/:id', autorizar('admin', 'recepcao'), validar(buscarPorId), tratarAsync(pacienteControlador.buscar));
rotas.patch('/:id', autorizar('admin', 'recepcao'), validar(atualizarPaciente), tratarAsync(pacienteControlador.atualizar));
rotas.delete('/:id', autorizar('admin'), validar(buscarPorId), tratarAsync(pacienteControlador.remover));

module.exports = rotas;
