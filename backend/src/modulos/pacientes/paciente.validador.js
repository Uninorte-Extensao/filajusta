const { z } = require('zod');
const { idUuid, cpf, telefone, dataCalendario, objetoVazio } = require('../../validadores/comuns');

const idParametro = z.object({ id: idUuid });

const criarPaciente = z.object({
  corpo: z.object({
    nome: z.string().min(2).max(140),
    cpf,
    telefone,
    email: z.string().email().optional().nullable(),
    data_nascimento: dataCalendario.optional().nullable(),
    birth_date: dataCalendario.optional().nullable()
  }),
  parametros: objetoVazio,
  consulta: objetoVazio
});

const atualizarPaciente = z.object({
  parametros: idParametro,
  corpo: z.object({
    nome: z.string().min(2).max(140).optional(),
    cpf: cpf.optional(),
    telefone,
    email: z.string().email().optional().nullable(),
    data_nascimento: dataCalendario.optional().nullable(),
    birth_date: dataCalendario.optional().nullable()
  }).refine((valor) => Object.keys(valor).length > 0, 'Informe ao menos um campo'),
  consulta: objetoVazio
});

const buscarPorId = z.object({
  parametros: idParametro,
  corpo: objetoVazio,
  consulta: objetoVazio
});

module.exports = { criarPaciente, atualizarPaciente, buscarPorId, cpf };
