const app = require('./app');
const ambiente = require('./config/ambiente');
const { sequelize } = require('./banco/modelos');
const { logger } = require('./utils/logger');

const iniciar = async () => {
  try {
    await sequelize.authenticate();
    const servidor = app.listen(ambiente.porta, () => {
      logger.info(`${ambiente.nomeAplicacao} API executando na porta ${ambiente.porta}`);
    });

    const encerrar = (sinal) => {
      logger.info(`Recebido ${sinal}. Encerrando servidor...`);
      servidor.close(async () => {
        try {
          await sequelize.close();
          logger.info('Conexoes encerradas com sucesso');
          process.exit(0);
        } catch (erro) {
          logger.error('Falha ao encerrar conexoes', erro);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => encerrar('SIGTERM'));
    process.on('SIGINT', () => encerrar('SIGINT'));
  } catch (erro) {
    logger.error('Falha ao iniciar servidor', erro);
    process.exit(1);
  }
};

iniciar();
