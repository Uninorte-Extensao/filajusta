const { Router } = require('express');
const autenticarUsuario = require('../../middlewares/autenticarUsuario');
const autorizarPerfil = require('../../middlewares/autorizarPerfil');
const usuarioRotas = require('../../modulos/usuarios/usuario.rotas');
const pacienteRotas = require('../../modulos/pacientes/paciente.rotas');
const medicoRotas = require('../../modulos/medicos/medico.rotas');
const especialidadeRotas = require('../../modulos/especialidades/especialidade.rotas');
const consultaRotas = require('../../modulos/consultas/consulta.rotas');
const agendaRotas = require('../../modulos/agenda/agenda.rotas');
const documentoRotas = require('../../modulos/documentos/documento.rotas');

const rotas = Router();

rotas.use(autenticarUsuario, autorizarPerfil('admin'));
rotas.use('/usuarios', usuarioRotas);
rotas.use('/pacientes', pacienteRotas);
rotas.use('/medicos', medicoRotas);
rotas.use('/especialidades', especialidadeRotas);
rotas.use('/consultas', consultaRotas);
rotas.use('/agenda', agendaRotas);
rotas.use('/', documentoRotas);

module.exports = rotas;
