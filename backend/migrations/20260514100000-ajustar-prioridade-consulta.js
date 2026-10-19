'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS consultas_prioridade;');
    await queryInterface.sequelize.query('ALTER TYPE enum_consultas_prioridade RENAME TO enum_consultas_prioridade_antigo;');
    await queryInterface.sequelize.query("CREATE TYPE enum_consultas_prioridade AS ENUM ('normal', 'idoso', 'pcd', 'gestante');");
    await queryInterface.sequelize.query('ALTER TABLE consultas ALTER COLUMN prioridade DROP DEFAULT;');
    await queryInterface.sequelize.query(`
      ALTER TABLE consultas
      ALTER COLUMN prioridade TYPE enum_consultas_prioridade
      USING (
        CASE
          WHEN prioridade::text = 'preferencial' THEN 'idoso'
          WHEN prioridade::text = 'urgente' THEN 'normal'
          ELSE prioridade::text
        END
      )::enum_consultas_prioridade;
    `);
    await queryInterface.sequelize.query("ALTER TABLE consultas ALTER COLUMN prioridade SET DEFAULT 'normal';");
    await queryInterface.sequelize.query('DROP TYPE enum_consultas_prioridade_antigo;');
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('ALTER TYPE enum_consultas_prioridade RENAME TO enum_consultas_prioridade_novo;');
    await queryInterface.sequelize.query("CREATE TYPE enum_consultas_prioridade AS ENUM ('normal', 'preferencial', 'urgente');");
    await queryInterface.sequelize.query('ALTER TABLE consultas ALTER COLUMN prioridade DROP DEFAULT;');
    await queryInterface.sequelize.query(`
      ALTER TABLE consultas
      ALTER COLUMN prioridade TYPE enum_consultas_prioridade
      USING (
        CASE
          WHEN prioridade::text IN ('idoso', 'pcd', 'gestante') THEN 'preferencial'
          ELSE prioridade::text
        END
      )::enum_consultas_prioridade;
    `);
    await queryInterface.sequelize.query("ALTER TABLE consultas ALTER COLUMN prioridade SET DEFAULT 'normal';");
    await queryInterface.sequelize.query('DROP TYPE enum_consultas_prioridade_novo;');
    await queryInterface.addIndex('consultas', ['prioridade']);
  }
};
