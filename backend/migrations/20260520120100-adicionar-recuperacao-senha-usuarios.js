'use strict';

/**
 * Campos usados na recuperacao de senha por codigo enviado por e-mail.
 * Guardamos apenas o hash do codigo, a validade e o contador de tentativas.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS recuperacao_codigo_hash VARCHAR(255);'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS recuperacao_expira_em TIMESTAMP WITH TIME ZONE;'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS recuperacao_tentativas INTEGER NOT NULL DEFAULT 0;'
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE usuarios DROP COLUMN IF EXISTS recuperacao_tentativas;');
    await queryInterface.sequelize.query('ALTER TABLE usuarios DROP COLUMN IF EXISTS recuperacao_expira_em;');
    await queryInterface.sequelize.query('ALTER TABLE usuarios DROP COLUMN IF EXISTS recuperacao_codigo_hash;');
  }
};
