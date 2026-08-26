const { Router } = require('express');
const documentoControlador = require('./documento.controlador');
const autenticar = require('../../middlewares/autenticar');
const autorizar = require('../../middlewares/autorizar');
const validar = require('../../middlewares/validar');
const tratarAsync = require('../../utils/tratarAsync');
const { uploadDocumento } = require('../../middlewares/upload');
const { uploadPorConsulta, listarPorConsulta, download } = require('./documento.validador');

const rotas = Router();

rotas.use(autenticar, autorizar('admin', 'recepcao'));
rotas.post('/consultas/:consultaId/documentos', uploadDocumento, validar(uploadPorConsulta), tratarAsync(documentoControlador.criar));
rotas.get('/consultas/:consultaId/documentos', validar(listarPorConsulta), tratarAsync(documentoControlador.listarPorConsulta));
rotas.get('/documentos/:id/download', validar(download), tratarAsync(documentoControlador.download));

module.exports = rotas;
