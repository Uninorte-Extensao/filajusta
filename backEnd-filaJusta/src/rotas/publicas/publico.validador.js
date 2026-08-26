const { z } = require('zod');
const { cpf, dataCalendario, objetoVazio } = require('../../validadores/comuns');
const { criarConsulta } = require('../../modulos/consultas/consulta.validador');

const codigoConsulta = z.string().regex(/^VPL-[A-Z0-9]{4}$/, 'Codigo da consulta invalido');

const horariosPublicos = z.object({
  corpo: objetoVazio,
  parametros: objetoVazio,
  consulta: z.object({
    medico_id: z.string().uuid('Medico invalido').optional(),
    medicoId: z.string().uuid('Medico invalido').optional(),
    data: dataCalendario.optional(),
    date: dataCalendario.optional()
  }).refine((dados) => dados.medico_id || dados.medicoId, 'Medico obrigatorio')
    .refine((dados) => dados.data || dados.date, 'Data obrigatoria')
});

const consultaPorCodigo = z.object({
  corpo: objetoVazio,
  parametros: z.object({
    codigo: codigoConsulta
  }),
  consulta: z.object({
    cpf
  })
});

const alterarConsultaPublica = z.object({
  corpo: z.object({
    cpf: cpf.optional(),
    motivo_cancelamento: z.string().optional().nullable()
  }).optional(),
  parametros: z.object({
    codigo: codigoConsulta
  }),
  consulta: z.object({
    cpf: cpf.optional()
  }).optional()
});

const uploadDocumentoPublico = z.object({
  corpo: z.object({
    codigo: codigoConsulta,
    cpf,
    tipo: z.string().min(2).max(80).optional()
  }),
  parametros: objetoVazio,
  consulta: objetoVazio
});

module.exports = {
  criarConsultaPublica: criarConsulta,
  horariosPublicos,
  consultaPorCodigo,
  alterarConsultaPublica,
  uploadDocumentoPublico
};
