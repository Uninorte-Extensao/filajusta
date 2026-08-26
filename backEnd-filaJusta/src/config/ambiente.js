const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

process.env.TZ = process.env.TIMEZONE || 'America/Manaus';

const paraBooleano = (valor, padrao = false) => {
  if (valor === undefined) return padrao;
  return String(valor).toLowerCase() === 'true';
};

const paraNumero = (valor, padrao) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : padrao;
};

module.exports = {
  ambiente: process.env.NODE_ENV || 'development',
  porta: paraNumero(process.env.PORT, 3000),
  nomeAplicacao: process.env.APP_NAME || 'FilaJusta',
  urlAplicacao: process.env.APP_URL || 'http://localhost:3000',
  fusoHorario: process.env.TIMEZONE || 'America/Manaus',
  jwt: {
    segredo: process.env.JWT_SECRET || 'change-me-super-secret',
    expiracao: process.env.JWT_EXPIRES_IN || '8h'
  },
  bcrypt: {
    saltos: paraNumero(process.env.BCRYPT_SALT_ROUNDS, 12)
  },
  cors: {
    origem: process.env.CORS_ORIGIN || '*'
  },
  banco: {
    host: process.env.DB_HOST || 'localhost',
    porta: paraNumero(process.env.DB_PORT, 5432),
    nome: process.env.DB_NAME || 'filajusta',
    usuario: process.env.DB_USER || 'filajusta',
    senha: process.env.DB_PASSWORD || 'filajusta',
    dialeto: process.env.DB_DIALECT || 'postgres',
    logar: paraBooleano(process.env.DB_LOGGING, false)
  },
  limiteRequisicoes: {
    janelaLoginMinutos: paraNumero(process.env.LOGIN_RATE_LIMIT_WINDOW_MINUTES, 15),
    maximoLogin: paraNumero(process.env.LOGIN_RATE_LIMIT_MAX, 10)
  },
  upload: {
    diretorio: process.env.UPLOAD_DIR || 'storage/documents',
    tamanhoMaximoMb: paraNumero(process.env.MAX_UPLOAD_SIZE_MB, 10)
  },
  logs: {
    nivel: process.env.LOG_LEVEL || 'info'
  }
};
