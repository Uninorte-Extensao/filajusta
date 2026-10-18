const { Router } = require('express');
const usuarioControlador = require('./usuario.controlador');
const autenticar = require('../../middlewares/autenticar');
const autorizar = require('../../middlewares/autorizar');
const validar = require('../../middlewares/validar');
const tratarAsync = require('../../utils/tratarAsync');
const { criarUsuario, atualizarUsuario, buscarPorId } = require('./usuario.validador');

const rotas = Router();

rotas.use(autenticar, autorizar('admin'));
rotas.get('/', tratarAsync(usuarioControlador.listar));
rotas.post('/', validar(criarUsuario), tratarAsync(usuarioControlador.criar));
rotas.get('/:id', validar(buscarPorId), tratarAsync(usuarioControlador.buscar));
rotas.patch('/:id', validar(atualizarUsuario), tratarAsync(usuarioControlador.atualizar));
rotas.delete('/:id', validar(buscarPorId), tratarAsync(usuarioControlador.remover));

module.exports = rotas;
