const { z } = require('zod');
const { idUuid, objetoVazio } = require('../../validadores/comuns');

const idParametro = z.object({ id: idUuid });

const criarUsuario = z.object({
  corpo: z.object({
    nome: z.string().min(2).max(120),
    email: z.string().email(),
    senha: z.string().min(8),
    perfil: z.enum(['admin', 'recepcao']).default('recepcao'),
    ativo: z.boolean().optional()
  }),
  parametros: objetoVazio,
  consulta: objetoVazio
});

const atualizarUsuario = z.object({
  parametros: idParametro,
  corpo: z.object({
    nome: z.string().min(2).max(120).optional(),
    email: z.string().email().optional(),
    senha: z.string().min(8).optional(),
    perfil: z.enum(['admin', 'recepcao']).optional(),
    ativo: z.boolean().optional()
  }).refine((valor) => Object.keys(valor).length > 0, 'Informe ao menos um campo'),
  consulta: objetoVazio
});

const buscarPorId = z.object({
  parametros: idParametro,
  corpo: objetoVazio,
  consulta: objetoVazio
});

module.exports = { criarUsuario, atualizarUsuario, buscarPorId };
