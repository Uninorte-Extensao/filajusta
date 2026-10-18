const { z } = require('zod');
const { idUuid, telefone, objetoVazio } = require('../../validadores/comuns');

const idParametro = z.object({ id: idUuid });

const criarMedico = z.object({
  corpo: z.object({
    especialidade_id: idUuid.optional(),
    especialidadeId: idUuid.optional(),
    nome: z.string().min(2).max(140),
    crm: z.string().min(3).max(40),
    telefone: telefone.optional().nullable(),
    email: z.string().email().optional().nullable(),
    ativo: z.boolean().optional()
  }).refine((dados) => dados.especialidade_id || dados.especialidadeId, 'Especialidade obrigatoria'),
  parametros: objetoVazio,
  consulta: objetoVazio
});

const atualizarMedico = z.object({
  parametros: idParametro,
  corpo: z.object({
    especialidade_id: idUuid.optional(),
    especialidadeId: idUuid.optional(),
    nome: z.string().min(2).max(140).optional(),
    crm: z.string().min(3).max(40).optional(),
    telefone,
    email: z.string().email().optional().nullable(),
    ativo: z.boolean().optional()
  }).refine((valor) => Object.keys(valor).length > 0, 'Informe ao menos um campo'),
  consulta: objetoVazio
});

const buscarPorId = z.object({
  parametros: idParametro,
  corpo: objetoVazio,
  consulta: objetoVazio
});

module.exports = { criarMedico, atualizarMedico, buscarPorId };
