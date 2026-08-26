const { z } = require('zod');
const { idUuid, dataCalendario, objetoVazio } = require('../../validadores/comuns');
const { STATUS_CONSULTA } = require('../../utils/statusConsulta');

const horarios = z.object({
  corpo: objetoVazio,
  parametros: objetoVazio,
  consulta: z.object({
    medico_id: idUuid.optional(),
    medicoId: idUuid.optional(),
    doctorId: idUuid.optional(),
    data: dataCalendario.optional(),
    date: dataCalendario.optional()
  }).refine((dados) => dados.medico_id || dados.medicoId || dados.doctorId, 'Medico obrigatorio')
    .refine((dados) => dados.data || dados.date, 'Data obrigatoria')
});

const dia = z.object({
  corpo: objetoVazio,
  parametros: objetoVazio,
  consulta: z.object({
    data: dataCalendario.optional(),
    date: dataCalendario.optional(),
    medico_id: idUuid.optional(),
    medicoId: idUuid.optional(),
    doctorId: idUuid.optional(),
    status: z.enum(Object.values(STATUS_CONSULTA)).optional()
  }).refine((dados) => dados.data || dados.date, 'Data obrigatoria')
});

module.exports = { horarios, dia };
