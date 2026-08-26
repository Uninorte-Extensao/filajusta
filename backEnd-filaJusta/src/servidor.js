const app = require('./app');
const ambiente = require('./config/ambiente');
const { sequelize } = require('./banco/modelos');
const { logger } = require('./utils/logger');

const iniciar = async () => {
  try {
    await sequelize.authenticate();
    app.listen(ambiente.porta, () => {
      logger.info(`${ambiente.nomeAplicacao} API executando na porta ${ambiente.porta}`);
    });
  } catch (erro) {
    logger.error('Falha ao iniciar servidor', erro);
    process.exit(1);
  }
};

iniciar();
