const path = require('path');
const ambiente = require('./ambiente');

module.exports = {
  diretorioUpload: path.resolve(process.cwd(), ambiente.upload.diretorio),
  tamanhoMaximoArquivo: ambiente.upload.tamanhoMaximoMb * 1024 * 1024,
  tiposPermitidos: ['image/jpeg', 'image/png', 'application/pdf']
};
