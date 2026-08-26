const { Router } = require('express');
const validar = require('../../middlewares/validar');
const tratarAsync = require('../../utils/tratarAsync');
const { sucesso } = require('../../utils/responder');
const { uploadDocumento } = require('../../middlewares/upload');
const validarConsultaPublica = require('../../middlewares/validarConsultaPublica');
const especialidadeServico = require('../../modulos/especialidades/especialidade.servico');
const medicoServico = require('../../modulos/medicos/medico.servico');
const agendaServico = require('../../modulos/agenda/agenda.servico');
const consultaServico = require('../../modulos/consultas/consulta.servico');
const documentoServico = require('../../modulos/documentos/documento.servico');
const {
  criarConsultaPublica,
  horariosPublicos,
  consultaPorCodigo,
  alterarConsultaPublica,
  uploadDocumentoPublico
} = require('./publico.validador');

const rotas = Router();

rotas.get(
  '/especialidades',
  tratarAsync(async (_req, res) => {
    return sucesso(res, await especialidadeServico.listarPublico(), 'Especialidades encontradas');
  })
);

rotas.get(
  '/medicos',
  tratarAsync(async (_req, res) => {
    return sucesso(res, await medicoServico.listarPublico(), 'Medicos encontrados');
  })
);

rotas.get(
  '/horarios',
  validar(horariosPublicos),
  tratarAsync(async (req, res) => {
    return sucesso(res, await agendaServico.horariosPublicos(req.validado.consulta), 'Horarios encontrados');
  })
);

rotas.post(
  '/consultas',
  validar(criarConsultaPublica),
  tratarAsync(async (req, res) => {
    const consulta = await consultaServico.criar(req.validado.corpo);
    return sucesso(res, consultaServico.serializarConsultaPublica(consulta), 'Consulta agendada', 201);
  })
);

rotas.get(
  '/consultas/codigo/:codigo',
  validar(consultaPorCodigo),
  tratarAsync(async (req, res) => {
    return sucesso(
      res,
      await consultaServico.buscarPublicaPorCodigoCpf(req.validado.parametros.codigo, req.validado.consulta.cpf),
      'Consulta encontrada'
    );
  })
);

rotas.patch(
  '/consultas/codigo/:codigo/confirmar',
  validar(alterarConsultaPublica),
  validarConsultaPublica,
  tratarAsync(async (req, res) => {
    return sucesso(res, await consultaServico.confirmarPublica(req.consultaPublica), 'Consulta confirmada');
  })
);

rotas.patch(
  '/consultas/codigo/:codigo/cancelar',
  validar(alterarConsultaPublica),
  validarConsultaPublica,
  tratarAsync(async (req, res) => {
    return sucesso(
      res,
      await consultaServico.cancelarPublica(req.consultaPublica, req.validado.corpo?.motivo_cancelamento || null),
      'Consulta cancelada'
    );
  })
);

rotas.post(
  '/documentos/upload',
  uploadDocumento,
  validar(uploadDocumentoPublico),
  validarConsultaPublica,
  tratarAsync(async (req, res) => {
    return sucesso(
      res,
      await documentoServico.criarPublico(req.consultaPublica, req.validado.corpo, req.files),
      'Documento enviado',
      201
    );
  })
);

module.exports = rotas;
