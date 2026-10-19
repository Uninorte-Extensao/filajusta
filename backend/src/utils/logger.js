const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const winston = require('winston');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const ambiente = require('../config/ambiente');

dayjs.extend(utc);
dayjs.extend(timezone);

const diretorioLogs = path.resolve(process.cwd(), 'logs');
fs.mkdirSync(diretorioLogs, { recursive: true });

const logger = winston.createLogger({
  level: ambiente.logs.nivel,
  format: winston.format.combine(
    winston.format.timestamp({ format: () => dayjs().tz(ambiente.fusoHorario).format() }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(diretorioLogs, 'erro.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(diretorioLogs, 'aplicacao.log') })
  ]
});

if (ambiente.ambiente !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    })
  );
}

const streamMorgan = {
  write: (mensagem) => logger.info(mensagem.trim())
};

morgan.token('url-segura', (req) => {
  const base = req.originalUrl || req.url || '';
  return base.replace(/([?&](?:cpf|token|senha|password)=)[^&]*/gi, '$1[REDACTED]');
});

const formatoHttp = ':remote-addr - :remote-user [:date[clf]] ":method :url-segura HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
const loggerHttp = morgan(formatoHttp, { stream: streamMorgan });

module.exports = { logger, loggerHttp };
