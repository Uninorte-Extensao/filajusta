const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ambienteAtual = process.env.NODE_ENV || 'development';
const producao = ambienteAtual === 'production';
const teste = ambienteAtual === 'test';

process.env.TZ = process.env.TIMEZONE || 'America/Manaus';

const paraBooleano = (valor, padrao = false) => {
  if (valor === undefined) return padrao;
  return String(valor).toLowerCase() === 'true';
};

const paraNumero = (valor, padrao) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : padrao;
};

const obter = (nome, padrao) => {
  const valor = process.env[nome];
  if (valor === undefined || valor === '') return padrao;
  return valor;
};

const exigir = (nome, valor) => {
  if (valor === undefined || valor === '') {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${nome}`);
  }
  return valor;
};

const validarSegredoJwt = (segredo) => {
  if (producao && segredo === 'change-me-super-secret') {
    throw new Error('JWT_SECRET precisa ser configurado com um valor seguro em producao');
  }

  if (producao && String(segredo).length < 32) {
    throw new Error('JWT_SECRET precisa ter pelo menos 32 caracteres em producao');
  }

  return segredo;
};

const databaseUrl = obter('DATABASE_URL');
const jwtSecret = validarSegredoJwt(producao ? exigir('JWT_SECRET', process.env.JWT_SECRET) : obter('JWT_SECRET', 'change-me-super-secret'));
const dbHost = databaseUrl ? undefined : obter('DB_HOST', 'localhost');
const dbNome = databaseUrl ? undefined : obter('DB_NAME', 'filajusta');
const dbUsuario = databaseUrl ? undefined : obter('DB_USER', 'filajusta');
const dbSenha = databaseUrl ? undefined : (producao ? exigir('DB_PASSWORD', process.env.DB_PASSWORD) : obter('DB_PASSWORD', 'filajusta'));
const corsOrigem = obter('CORS_ORIGIN', obter('FRONTEND_URL', producao ? undefined : '*'));

if (producao && !databaseUrl) {
  exigir('DB_HOST', process.env.DB_HOST);
  exigir('DB_NAME', process.env.DB_NAME);
  exigir('DB_USER', process.env.DB_USER);
}

if (producao) {
  exigir('CORS_ORIGIN', corsOrigem);
}

module.exports = {
  ambiente: ambienteAtual,
  producao,
  teste,
  porta: paraNumero(process.env.PORT, 3000),
  nomeAplicacao: obter('APP_NAME', 'FilaJusta'),
  urlAplicacao: obter('APP_URL', 'http://localhost:3000'),
  fusoHorario: obter('TIMEZONE', 'America/Manaus'),
  jwt: {
    segredo: jwtSecret,
    expiracao: obter('JWT_EXPIRES_IN', '8h')
  },
  bcrypt: {
    saltos: paraNumero(process.env.BCRYPT_SALT_ROUNDS, 12)
  },
  cors: {
    origem: corsOrigem
  },
  banco: {
    url: databaseUrl,
    host: dbHost,
    porta: paraNumero(process.env.DB_PORT, 5432),
    nome: dbNome,
    usuario: dbUsuario,
    senha: dbSenha,
    dialeto: obter('DB_DIALECT', 'postgres'),
    logar: paraBooleano(process.env.DB_LOGGING, false),
    ssl: paraBooleano(process.env.DB_SSL, false),
    rejeitarSslNaoAutorizado: paraBooleano(process.env.DB_SSL_REJECT_UNAUTHORIZED, true)
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
    nivel: obter('LOG_LEVEL', 'info')
  }
};
