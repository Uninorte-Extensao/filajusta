const fs = require('fs');
const path = require('path');
const multer = require('multer');
const configuracaoUpload = require('../config/upload');
const ErroAplicacao = require('../utils/erroAplicacao');

fs.mkdirSync(configuracaoUpload.diretorioUpload, { recursive: true });

const armazenamento = multer.diskStorage({
  destination: (_req, _arquivo, callback) => callback(null, configuracaoUpload.diretorioUpload),
  filename: (_req, arquivo, callback) => {
    const extensao = path.extname(arquivo.originalname).toLowerCase();
    const nomeArquivo = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;
    callback(null, nomeArquivo);
  }
});

const filtrarArquivo = (_req, arquivo, callback) => {
  if (!configuracaoUpload.tiposPermitidos.includes(arquivo.mimetype)) {
    return callback(new ErroAplicacao('Tipo de arquivo nao permitido. Use JPG, PNG ou PDF.', 400));
  }
  return callback(null, true);
};

const uploadDocumento = multer({
  storage: armazenamento,
  fileFilter: filtrarArquivo,
  limits: { fileSize: configuracaoUpload.tamanhoMaximoArquivo }
}).fields([
  { name: 'frente', maxCount: 1 },
  { name: 'verso', maxCount: 1 },
  { name: 'front', maxCount: 1 },
  { name: 'back', maxCount: 1 }
]);

module.exports = { uploadDocumento };
