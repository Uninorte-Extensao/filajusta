const { z } = require('zod');
const { idUuid, objetoVazio } = require('../../validadores/comuns');

const uploadPorConsulta = z.object({
  corpo: z.object({
    tipo: z.string().min(2).max(80).optional(),
    type: z.string().min(2).max(80).optional()
  }),
  parametros: z.object({
    consultaId: idUuid
  }),
  consulta: objetoVazio
});

const listarPorConsulta = z.object({
  corpo: objetoVazio,
  parametros: z.object({
    consultaId: idUuid
  }),
  consulta: objetoVazio
});

const download = z.object({
  corpo: objetoVazio,
  parametros: z.object({
    id: idUuid
  }),
  consulta: z.object({
    lado: z.enum(['frente', 'verso']).optional(),
    side: z.enum(['front', 'back']).optional()
  })
});

module.exports = {
  uploadPorConsulta,
  listarPorConsulta,
  download
};
