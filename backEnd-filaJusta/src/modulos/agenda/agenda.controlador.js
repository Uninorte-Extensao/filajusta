const agendaServico = require('./agenda.servico');
const { sucesso } = require('../../utils/responder');

class AgendaControlador {
  async horarios(req, res) {
    return sucesso(res, await agendaServico.horarios(req.validado.consulta), 'Agenda de horarios encontrada');
  }

  async dia(req, res) {
    return sucesso(res, await agendaServico.dia(req.validado.consulta), 'Agenda diaria encontrada');
  }
}

module.exports = new AgendaControlador();
