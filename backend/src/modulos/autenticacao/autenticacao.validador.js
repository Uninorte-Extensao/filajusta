const { z } = require('zod');

const { objetoVazio } = require('../../validadores/comuns');

const login = z.object({
  corpo: z.object({
    email: z
      .string()
      .email('Email invalido'),

    senha: z
      .string()
      .min(6, 'Senha deve ter ao menos 6 caracteres')
      .optional(),

    password: z
      .string()
      .min(6, 'Senha deve ter ao menos 6 caracteres')
      .optional()
  }).refine(
    (corpo) => corpo.senha || corpo.password,
    'Senha obrigatoria'
  ),

  parametros: objetoVazio,
  consulta: objetoVazio
});

const solicitarRecuperacao = z.object({
  corpo: z.object({
    email: z
      .string()
      .email('Email invalido')
  }),

  parametros: objetoVazio,
  consulta: objetoVazio
});

const validarCodigoRecuperacao = z.object({
  corpo: z.object({
    email: z
      .string()
      .email('Email invalido'),

    codigo: z
      .string()
      .length(6, 'Codigo deve conter 6 digitos')
      .regex(/^\d{6}$/, 'Codigo invalido')
  }),

  parametros: objetoVazio,
  consulta: objetoVazio
});

const redefinirSenha = z.object({
  corpo: z.object({
    email: z
      .string()
      .email('Email invalido'),

    codigo: z
      .string()
      .length(6, 'Codigo deve conter 6 digitos')
      .regex(/^\d{6}$/, 'Codigo invalido'),

    novaSenha: z
      .string()
      .min(6, 'Senha deve ter ao menos 6 caracteres')
  }),

  parametros: objetoVazio,
  consulta: objetoVazio
});

module.exports = {
  login,
  solicitarRecuperacao,
  validarCodigoRecuperacao,
  redefinirSenha
};