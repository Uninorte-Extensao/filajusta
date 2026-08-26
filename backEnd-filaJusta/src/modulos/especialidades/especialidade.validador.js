const { z } = require('zod');
const { idUuid, objetoVazio } = require('../../validadores/comuns');

const idParametro = z.object({ id: idUuid });

const criarEspecialidade = z.object({
  corpo: z.object({
    nome: z.string().min(2).max(120),
    descricao: z.string().optional().nullable(),
    ativo: z.boolean().optional()
  }),
  parametros: objetoVazio,
  consulta: objetoVazio
});

const atualizarEspecialidade = z.object({
  parametros: idParametro,
  corpo: z.object({
    nome: z.string().min(2).max(120).optional(),
    descricao: z.string().optional().nullable(),
    ativo: z.boolean().optional()
  }).refine((valor) => Object.keys(valor).length > 0, 'Informe ao menos um campo'),
  consulta: objetoVazio
});

const buscarPorId = z.object({
  parametros: idParametro,
  corpo: objetoVazio,
  consulta: objetoVazio
});

module.exports = { criarEspecialidade, atualizarEspecialidade, buscarPorId };
