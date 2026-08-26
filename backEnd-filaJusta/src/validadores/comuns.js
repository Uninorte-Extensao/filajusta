const { z } = require('zod');
const { cpfValido, somenteNumeros } = require('../utils/cpf');

const idUuid = z.string().uuid('ID invalido');

const cpf = z
  .string()
  .transform(somenteNumeros)
  .refine(cpfValido, 'CPF invalido');

const telefone = z
  .string()
  .trim()
  .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone invalido')
  .optional()
  .nullable();

const dataIso = z.string().datetime({ offset: true, message: 'Data deve estar em ISO 8601 com fuso horario' });

const dataCalendario = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD');

const objetoVazio = z.object({}).optional();

module.exports = {
  idUuid,
  cpf,
  telefone,
  dataIso,
  dataCalendario,
  objetoVazio
};
