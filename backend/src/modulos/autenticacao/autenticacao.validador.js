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

module.exports = { login };
