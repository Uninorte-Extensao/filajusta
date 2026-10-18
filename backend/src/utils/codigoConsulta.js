const crypto = require('crypto');

const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const gerarCodigoConsulta = () => {
  let sufixo = '';
  const bytes = crypto.randomBytes(4);

  for (let indice = 0; indice < 4; indice += 1) {
    sufixo += caracteres[bytes[indice] % caracteres.length];
  }

  return `VPL-${sufixo}`;
};

module.exports = { gerarCodigoConsulta };
