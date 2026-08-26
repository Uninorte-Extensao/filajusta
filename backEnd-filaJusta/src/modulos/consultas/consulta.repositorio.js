const { Op } = require('sequelize');
const { Consulta, Paciente, Medico, Especialidade, Documento } = require('../../banco/modelos');

const incluirRelacionamentos = [
  { model: Paciente, as: 'paciente' },
  {
    model: Medico,
    as: 'medico',
    include: [{ model: Especialidade, as: 'especialidade', attributes: ['id', 'nome'] }]
  }
];

class ConsultaRepositorio {
  listar(filtros = {}) {
    const where = {};
    const include = [...incluirRelacionamentos];

    if (filtros.medico_id) where.medico_id = filtros.medico_id;
    if (filtros.status) where.status = filtros.status;
    if (filtros.prioridade) where.prioridade = filtros.prioridade;
    if (filtros.inicio && filtros.fim) where.consulta_em = { [Op.between]: [filtros.inicio, filtros.fim] };

    if (filtros.paciente_cpf) {
      include[0] = { ...include[0], where: { cpf: filtros.paciente_cpf } };
    }

    return Consulta.findAll({
      where,
      include,
      order: [['consulta_em', 'ASC']]
    });
  }

  buscarPorId(id, opcoes = {}) {
    return Consulta.findByPk(id, {
      include: [
        ...incluirRelacionamentos,
        { model: Documento, as: 'documentos' }
      ],
      ...opcoes
    });
  }

  buscarHorarioAtivoMedico(medicoId, consultaEm, statusAtivos, opcoes = {}) {
    return Consulta.findOne({
      where: {
        medico_id: medicoId,
        consulta_em: consultaEm,
        status: { [Op.in]: statusAtivos }
      },
      ...opcoes
    });
  }

  buscarCpfAtivoNoDia(cpf, inicio, fim, statusAtivos, opcoes = {}) {
    return Consulta.findOne({
      where: {
        consulta_em: { [Op.between]: [inicio, fim] },
        status: { [Op.in]: statusAtivos }
      },
      include: [{ model: Paciente, as: 'paciente', where: { cpf } }],
      ...opcoes
    });
  }

  buscarPorCodigo(codigo, opcoes = {}) {
    return Consulta.findOne({ where: { codigo }, ...opcoes });
  }

  buscarPorCodigoComPaciente(codigo, opcoes = {}) {
    return Consulta.findOne({
      where: { codigo },
      include: incluirRelacionamentos,
      ...opcoes
    });
  }

  criar(dados, opcoes = {}) {
    return Consulta.create(dados, opcoes);
  }

  async atualizar(consulta, dados, opcoes = {}) {
    await consulta.update(dados, opcoes);
    return this.buscarPorId(consulta.id);
  }
}

module.exports = new ConsultaRepositorio();
