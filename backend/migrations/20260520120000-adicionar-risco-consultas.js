'use strict';

/**
 * Cria as colunas do SmartPredict (score_risco e nivel_risco) na tabela consultas.
 * O model e o seed ja dependiam delas, mas nenhuma migration as criava, entao um
 * banco novo (deploy) falhava no seed e nas consultas. Idempotente: nao altera
 * bancos onde as colunas ja existem.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE consultas ADD COLUMN IF NOT EXISTS score_risco INTEGER DEFAULT 0;'
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE consultas ADD COLUMN IF NOT EXISTS nivel_risco VARCHAR(10) DEFAULT 'baixo';"
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE consultas DROP COLUMN IF EXISTS nivel_risco;');
    await queryInterface.sequelize.query('ALTER TABLE consultas DROP COLUMN IF EXISTS score_risco;');
  }
};
