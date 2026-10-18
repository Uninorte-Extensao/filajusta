const analyticsServico = require('./analytics.servico');
const responder = require('../../utils/responder');
const tratarAsync = require('../../utils/tratarAsync');

const obterKPIs = tratarAsync(async (req, res) => {
  const dados = await analyticsServico.obterKPIs();
  return responder.sucesso(res, dados, 'KPIs recuperados com sucesso');
});

const obterNoShowPorEspecialidade = tratarAsync(async (req, res) => {
  const dados = await analyticsServico.obterNoShowPorEspecialidade();
  return responder.sucesso(res, dados, 'Métricas por especialidade recuperadas com sucesso');
});

const obterConsultasAltoRisco = tratarAsync(async (req, res) => {
  const dados = await analyticsServico.obterConsultasAltoRisco();
  return responder.sucesso(res, dados, 'Consultas de alto risco recuperadas com sucesso');
});

module.exports = {
  obterKPIs,
  obterNoShowPorEspecialidade,
  obterConsultasAltoRisco
};