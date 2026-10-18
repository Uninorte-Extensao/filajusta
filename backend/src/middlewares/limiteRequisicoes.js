const rateLimit = require('express-rate-limit');
const ambiente = require('../config/ambiente');
const { erro } = require('../utils/responder');

const limitarLogin = rateLimit({
  windowMs: ambiente.limiteRequisicoes.janelaLoginMinutos * 60 * 1000,
  limit: ambiente.limiteRequisicoes.maximoLogin,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => erro(res, 'Muitas tentativas de login. Tente novamente mais tarde.', 429)
});

module.exports = { limitarLogin };
