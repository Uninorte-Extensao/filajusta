const { z } = require('zod');
const { objetoVazio } = require('../../validadores/comuns');

const login = z.object({
  corpo: z.object({
    email: z.string().email('Email invalido'),
    senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').optional(),
    password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').optional()
  }).refine((corpo) => corpo.senha || corpo.password, 'Senha obrigatoria'),
  parametros: objetoVazio,
  consulta: objetoVazio
});

const emailNormalizado = z.string().trim().toLowerCase().email('Email invalido');
const codigoRecuperacao = z.string().trim().regex(/^\d{6}$/, 'Codigo deve ter 6 digitos');

const solicitarRecuperacao = z.object({
  corpo: z.object({ email: emailNormalizado }),
  parametros: objetoVazio,
  consulta: objetoVazio
});

const validarRecuperacao = z.object({
  corpo: z.object({ email: emailNormalizado, codigo: codigoRecuperacao }),
  parametros: objetoVazio,
  consulta: objetoVazio
});

const redefinirSenha = z.object({
  corpo: z.object({
    email: emailNormalizado,
    codigo: codigoRecuperacao,
    novaSenha: z
      .string()
      .min(6, 'Senha deve ter ao menos 6 caracteres')
      .max(72, 'Senha deve ter no maximo 72 caracteres')
  }),
  parametros: objetoVazio,
  consulta: objetoVazio
});

module.exports = { login, solicitarRecuperacao, validarRecuperacao, redefinirSenha };
