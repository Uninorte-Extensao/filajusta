const { z } = require('zod');
const ErroAplicacao = require('../utils/erroAplicacao');
const { cpf: cpfSchema } = require('../validadores/comuns');
const consultaRepositorio = require('../modulos/consultas/consulta.repositorio');

const schema = z.object({
  codigo: z.string().regex(/^VPL-[A-Z0-9]{4}$/, 'Codigo da consulta invalido'),
  cpf: cpfSchema
});

const validarConsultaPublica = async (req, _res, next) => {
  try {
    const corpo = req.body || {};
    const resultado = schema.safeParse({
      codigo: req.params.codigo || corpo.codigo || req.query.codigo,
      cpf: req.query.cpf || corpo.cpf || corpo.paciente_cpf || corpo.pacienteCpf
    });

    if (!resultado.success) {
      const detalhes = resultado.error.issues.map((item) => ({
        campo: item.path.join('.'),
        mensagem: item.message
      }));
      throw new ErroAplicacao('Erro de validacao', 400, detalhes);
    }

    const consulta = await consultaRepositorio.buscarPorCodigoComPaciente(resultado.data.codigo);
    if (!consulta) {
      throw new ErroAplicacao('Consulta nao encontrada', 404);
    }

    if (!consulta.paciente || consulta.paciente.cpf !== resultado.data.cpf) {
      throw new ErroAplicacao('CPF nao autorizado para esta consulta', 403);
    }

    req.consultaPublica = consulta;
    req.cpfPublico = resultado.data.cpf;
    return next();
  } catch (erro) {
    return next(erro);
  }
};

module.exports = validarConsultaPublica;
