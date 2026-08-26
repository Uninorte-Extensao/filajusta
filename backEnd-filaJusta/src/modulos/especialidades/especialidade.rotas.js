const { Router } = require('express');
const especialidadeControlador = require('./especialidade.controlador');
const autenticar = require('../../middlewares/autenticar');
const autorizar = require('../../middlewares/autorizar');
const validar = require('../../middlewares/validar');
const tratarAsync = require('../../utils/tratarAsync');
const { criarEspecialidade, atualizarEspecialidade, buscarPorId } = require('./especialidade.validador');

const rotas = Router();

rotas.use(autenticar);
rotas.get('/', autorizar('admin', 'recepcao'), tratarAsync(especialidadeControlador.listar));
rotas.post('/', autorizar('admin'), validar(criarEspecialidade), tratarAsync(especialidadeControlador.criar));
rotas.get('/:id', autorizar('admin', 'recepcao'), validar(buscarPorId), tratarAsync(especialidadeControlador.buscar));
rotas.patch('/:id', autorizar('admin'), validar(atualizarEspecialidade), tratarAsync(especialidadeControlador.atualizar));
rotas.delete('/:id', autorizar('admin'), validar(buscarPorId), tratarAsync(especialidadeControlador.remover));

module.exports = rotas;
