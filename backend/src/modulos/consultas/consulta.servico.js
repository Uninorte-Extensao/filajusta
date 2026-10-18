const { sequelize } = require('../../banco/modelos');
const ErroAplicacao = require('../../utils/erroAplicacao');
const { paraDataLocal, dayjs, inicioDoDia, fimDoDia, horarioComercial, formatarDataManaus } = require('../../utils/data');
const { gerarCodigoConsulta } = require('../../utils/codigoConsulta');
const {
  STATUS_CONSULTA,
  PRIORIDADE_CONSULTA,
  STATUS_ATIVOS_CONSULTA,
  TRANSICOES_STATUS_CONSULTA
} = require('../../utils/statusConsulta');
const consultaRepositorio = require('./consulta.repositorio');
const pacienteServico = require('../pacientes/paciente.servico');
const medicoServico = require('../medicos/medico.servico');

class ConsultaServico {
  async listar(filtros) {
    const normalizado = this.normalizarFiltros(filtros);
    if (normalizado.data) {
      normalizado.inicio = inicioDoDia(normalizado.data);
      normalizado.fim = fimDoDia(normalizado.data);
    }
    return consultaRepositorio.listar(normalizado);
  }

  async buscar(id) {
    const consulta = await consultaRepositorio.buscarPorId(id);
    if (!consulta) throw new ErroAplicacao('Consulta nao encontrada', 404);
    return consulta;
  }

  async buscarPublicaPorCodigoCpf(codigo, cpf) {
    const consulta = await consultaRepositorio.buscarPorCodigoComPaciente(codigo);
    this.validarAcessoPublico(consulta, cpf);
    return this.serializarConsultaPublica(consulta);
  }

  async criar(dados) {
    const normalizado = this.normalizarConsulta(dados);
    const dataConsulta = paraDataLocal(normalizado.consulta_em);
    this.validarJanelaAgendamento(dataConsulta);

    await medicoServico.garantirMedicoAtivo(normalizado.medico_id);

    try {
      return await sequelize.transaction(async (transaction) => {
        const paciente = await pacienteServico.buscarOuCriarPorConsulta(normalizado, { transaction });
        const consultaEm = dataConsulta.toDate();

        const conflitoMedico = await consultaRepositorio.buscarHorarioAtivoMedico(
          normalizado.medico_id,
          consultaEm,
          STATUS_ATIVOS_CONSULTA,
          { transaction }
        );
        if (conflitoMedico) {
          throw new ErroAplicacao('Medico ja possui consulta ativa neste horario', 409);
        }

        const conflitoCpf = await consultaRepositorio.buscarCpfAtivoNoDia(
          normalizado.paciente_cpf,
          inicioDoDia(consultaEm),
          fimDoDia(consultaEm),
          STATUS_ATIVOS_CONSULTA,
          { transaction }
        );
        if (conflitoCpf) {
          throw new ErroAplicacao('CPF ja possui consulta ativa neste dia', 409);
        }

        const codigo = await this.gerarCodigoUnico(transaction);
        const consulta = await consultaRepositorio.criar(
          {
            paciente_id: paciente.id,
            medico_id: normalizado.medico_id,
            consulta_em: consultaEm,
            codigo,
            status: STATUS_CONSULTA.AGUARDANDO,
            prioridade: normalizado.prioridade || PRIORIDADE_CONSULTA.NORMAL,
            observacoes: normalizado.observacoes || null
          },
          { transaction }
        );

        return consultaRepositorio.buscarPorId(consulta.id, { transaction });
      });
    } catch (erro) {
      if (erro instanceof ErroAplicacao) throw erro;
      if (erro.name === 'SequelizeUniqueConstraintError') {
        throw new ErroAplicacao('Conflito de agendamento ou codigo duplicado', 409);
      }
      throw erro;
    }
  }

  async atualizarStatus(id, dados) {
    const consulta = await this.buscar(id);
    const permitidos = TRANSICOES_STATUS_CONSULTA[consulta.status] || [];

    if (!permitidos.includes(dados.status)) {
      throw new ErroAplicacao(`Transicao de status invalida: ${consulta.status} -> ${dados.status}`, 400);
    }

    const atualizacao = { status: dados.status };
    if (dados.status === STATUS_CONSULTA.CANCELADO) {
      atualizacao.motivo_cancelamento = dados.motivo_cancelamento || dados.motivoCancelamento || dados.canceledReason || null;
    }

    return consultaRepositorio.atualizar(consulta, atualizacao);
  }

  async confirmarPublica(consulta) {
    const atualizada = await this.atualizarStatus(consulta.id, { status: STATUS_CONSULTA.CONFIRMADO });
    return this.serializarConsultaPublica(atualizada);
  }

  async cancelarPublica(consulta, motivoCancelamento = null) {
    const atualizada = await this.atualizarStatus(consulta.id, {
      status: STATUS_CONSULTA.CANCELADO,
      motivo_cancelamento: motivoCancelamento
    });
    return this.serializarConsultaPublica(atualizada);
  }

  async cancelar(id, motivoCancelamento = null) {
    return this.atualizarStatus(id, { status: STATUS_CONSULTA.CANCELADO, motivo_cancelamento: motivoCancelamento });
  }

  validarJanelaAgendamento(dataConsulta) {
    if (!dataConsulta.isValid()) {
      throw new ErroAplicacao('Data da consulta invalida', 400);
    }

    const agora = dayjs().tz();
    if (dataConsulta.diff(agora, 'minute', true) < 60) {
      throw new ErroAplicacao('Consulta deve ser agendada com no minimo 1 hora de antecedencia', 400);
    }

    if (dataConsulta.isAfter(agora.add(7, 'day'))) {
      throw new ErroAplicacao('Consulta deve ser agendada com no maximo 7 dias de antecedencia', 400);
    }

    if (!horarioComercial(dataConsulta)) {
      throw new ErroAplicacao('Horário fora do funcionamento da clínica', 400);
    }
  }

  async gerarCodigoUnico(transaction) {
    for (let tentativa = 0; tentativa < 10; tentativa += 1) {
      const codigo = gerarCodigoConsulta();
      const existente = await consultaRepositorio.buscarPorCodigo(codigo, { transaction });
      if (!existente) return codigo;
    }
    throw new ErroAplicacao('Nao foi possivel gerar codigo unico da consulta', 500);
  }

  normalizarConsulta(dados) {
    return {
      medico_id: dados.medico_id || dados.medicoId || dados.doctorId,
      consulta_em: dados.consulta_em || dados.consultaEm || dados.appointmentAt,
      paciente_nome: dados.paciente_nome || dados.pacienteNome || dados.patientName,
      paciente_cpf: dados.paciente_cpf || dados.pacienteCpf || dados.patientCpf,
      paciente_telefone: dados.paciente_telefone || dados.pacienteTelefone || dados.patientPhone || null,
      paciente_email: dados.paciente_email || dados.pacienteEmail || dados.patientEmail || null,
      prioridade: dados.prioridade || PRIORIDADE_CONSULTA.NORMAL,
      observacoes: dados.observacoes || dados.notes || null
    };
  }

  normalizarFiltros(filtros = {}) {
    return {
      data: filtros.data || filtros.date,
      medico_id: filtros.medico_id || filtros.medicoId || filtros.doctorId,
      paciente_cpf: filtros.paciente_cpf || filtros.pacienteCpf || filtros.patientCpf,
      status: filtros.status,
      prioridade: filtros.prioridade
    };
  }

  validarAcessoPublico(consulta, cpf) {
    if (!consulta) throw new ErroAplicacao('Consulta nao encontrada', 404);
    if (!consulta.paciente || consulta.paciente.cpf !== cpf) {
      throw new ErroAplicacao('CPF nao autorizado para esta consulta', 403);
    }
  }

  serializarConsultaPublica(consulta) {
    return {
      codigo: consulta.codigo,
      consulta_em: formatarDataManaus(consulta.consulta_em),
      status: consulta.status,
      prioridade: consulta.prioridade,
      paciente: consulta.paciente
        ? {
            nome: consulta.paciente.nome,
            cpf: consulta.paciente.cpf
          }
        : null,
      medico: consulta.medico
        ? {
            id: consulta.medico.id,
            nome: consulta.medico.nome,
            especialidade: consulta.medico.especialidade
              ? {
                  id: consulta.medico.especialidade.id,
                  nome: consulta.medico.especialidade.nome
                }
              : null
          }
        : null
    };
  }
}

module.exports = new ConsultaServico();
