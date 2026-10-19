const { Op } = require('sequelize');
const { Consulta, Paciente } = require('../../banco/modelos');
const { STATUS_ATIVOS_CONSULTA } = require('../../utils/statusConsulta');
const { paraDataLocal, inicioDoDia, fimDoDia, diaUtil, formatarDataManaus } = require('../../utils/data');
const ErroAplicacao = require('../../utils/erroAplicacao');
const medicoServico = require('../medicos/medico.servico');
const consultaServico = require('../consultas/consulta.servico');

class AgendaServico {
  async horarios(filtros) {
    const medicoId = filtros.medico_id || filtros.medicoId || filtros.doctorId;
    const data = filtros.data || filtros.date;
    await medicoServico.garantirMedicoAtivo(medicoId);

    if (!diaUtil(data)) {
      return { medico_id: medicoId, data, horarios: [] };
    }

    const consultas = await Consulta.findAll({
      where: {
        medico_id: medicoId,
        consulta_em: { [Op.between]: [inicioDoDia(data), fimDoDia(data)] },
        status: { [Op.in]: STATUS_ATIVOS_CONSULTA }
      },
      include: [{ model: Paciente, as: 'paciente', attributes: ['id', 'nome', 'cpf'] }],
      order: [['consulta_em', 'ASC']]
    });

    const porHorario = new Map(consultas.map((consulta) => [paraDataLocal(consulta.consulta_em).format('HH:mm'), consulta]));
    const horarios = [];
    let cursor = paraDataLocal(`${data}T07:00:00`);
    const fim = paraDataLocal(`${data}T17:00:00`);

    if (!cursor.isValid()) throw new ErroAplicacao('Data invalida', 400);

    while (cursor.isBefore(fim) || cursor.isSame(fim)) {
      const horario = cursor.format('HH:mm');
      const consulta = porHorario.get(horario);
      horarios.push({
        horario,
        consulta_em: formatarDataManaus(cursor),
        disponivel: !consulta,
        consulta: consulta
          ? {
              id: consulta.id,
              codigo: consulta.codigo,
              status: consulta.status,
              prioridade: consulta.prioridade,
              paciente: consulta.paciente
            }
          : null
      });
      cursor = cursor.add(30, 'minute');
    }

    return { medico_id: medicoId, data, horarios };
  }

  async horariosPublicos(filtros) {
    const agenda = await this.horarios(filtros);
    return {
      medico_id: agenda.medico_id,
      data: agenda.data,
      horarios: agenda.horarios.map((item) => ({
        horario: item.horario,
        consulta_em: item.consulta_em,
        disponivel: item.disponivel
      }))
    };
  }

  async dia(filtros) {
    const consultas = await consultaServico.listar(filtros);
    return { data: filtros.data || filtros.date, consultas };
  }
}

module.exports = new AgendaServico();
