const { z } = require('zod');
const { idUuid, cpf, telefone, dataIso, dataCalendario, objetoVazio } = require('../../validadores/comuns');
const { STATUS_CONSULTA, PRIORIDADE_CONSULTA } = require('../../utils/statusConsulta');

const idParametro = z.object({ id: idUuid });

const criarConsulta = z.object({
  corpo: z.object({
    medico_id: idUuid.optional(),
    medicoId: idUuid.optional(),
    doctorId: idUuid.optional(),
    consulta_em: dataIso.optional(),
    consultaEm: dataIso.optional(),
    appointmentAt: dataIso.optional(),
    paciente_nome: z.string().min(2).max(140).optional(),
    pacienteNome: z.string().min(2).max(140).optional(),
    patientName: z.string().min(2).max(140).optional(),
    paciente_cpf: cpf.optional(),
    pacienteCpf: cpf.optional(),
    patientCpf: cpf.optional(),
    paciente_telefone: telefone,
    pacienteTelefone: telefone,
    patientPhone: telefone,
    paciente_email: z.string().email().optional().nullable(),
    pacienteEmail: z.string().email().optional().nullable(),
    patientEmail: z.string().email().optional().nullable(),
    prioridade: z.enum(Object.values(PRIORIDADE_CONSULTA)).default(PRIORIDADE_CONSULTA.NORMAL),
    observacoes: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
  }).refine((dados) => dados.medico_id || dados.medicoId || dados.doctorId, 'Medico obrigatorio')
    .refine((dados) => dados.consulta_em || dados.consultaEm || dados.appointmentAt, 'Data da consulta obrigatoria')
    .refine((dados) => dados.paciente_nome || dados.pacienteNome || dados.patientName, 'Nome do paciente obrigatorio')
    .refine((dados) => dados.paciente_cpf || dados.pacienteCpf || dados.patientCpf, 'CPF do paciente obrigatorio'),
  parametros: objetoVazio,
  consulta: objetoVazio
});

const atualizarStatus = z.object({
  parametros: idParametro,
  corpo: z.object({
    status: z.enum(Object.values(STATUS_CONSULTA)),
    motivo_cancelamento: z.string().optional().nullable(),
    motivoCancelamento: z.string().optional().nullable(),
    canceledReason: z.string().optional().nullable()
  }),
  consulta: objetoVazio
});

const listarConsultas = z.object({
  corpo: objetoVazio,
  parametros: objetoVazio,
  consulta: z.object({
    data: dataCalendario.optional(),
    date: dataCalendario.optional(),
    medico_id: idUuid.optional(),
    medicoId: idUuid.optional(),
    doctorId: idUuid.optional(),
    paciente_cpf: cpf.optional(),
    pacienteCpf: cpf.optional(),
    patientCpf: cpf.optional(),
    status: z.enum(Object.values(STATUS_CONSULTA)).optional(),
    prioridade: z.enum(Object.values(PRIORIDADE_CONSULTA)).optional()
  })
});

const buscarPorId = z.object({
  parametros: idParametro,
  corpo: objetoVazio,
  consulta: objetoVazio
});

module.exports = {
  criarConsulta,
  atualizarStatus,
  listarConsultas,
  buscarPorId
};
