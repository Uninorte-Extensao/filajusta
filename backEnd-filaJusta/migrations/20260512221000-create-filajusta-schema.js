'use strict';

const filtroStatusAtivo = "excluido_em IS NULL AND status IN ('aguardando', 'confirmado')";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },
      nome: { type: Sequelize.STRING(120), allowNull: false },
      email: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      senha_hash: { type: Sequelize.STRING, allowNull: false },
      perfil: { type: Sequelize.ENUM('admin', 'recepcao'), allowNull: false, defaultValue: 'recepcao' },
      ativo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      criado_em: { type: Sequelize.DATE, allowNull: false },
      atualizado_em: { type: Sequelize.DATE, allowNull: false },
      excluido_em: { type: Sequelize.DATE, allowNull: true }
    });

    await queryInterface.createTable('pacientes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },
      nome: { type: Sequelize.STRING(140), allowNull: false },
      cpf: { type: Sequelize.STRING(11), allowNull: false, unique: true },
      telefone: { type: Sequelize.STRING(30), allowNull: true },
      email: { type: Sequelize.STRING(160), allowNull: true },
      data_nascimento: { type: Sequelize.DATEONLY, allowNull: true },
      criado_em: { type: Sequelize.DATE, allowNull: false },
      atualizado_em: { type: Sequelize.DATE, allowNull: false },
      excluido_em: { type: Sequelize.DATE, allowNull: true }
    });

    await queryInterface.createTable('especialidades', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },
      nome: { type: Sequelize.STRING(120), allowNull: false, unique: true },
      descricao: { type: Sequelize.TEXT, allowNull: true },
      ativo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      criado_em: { type: Sequelize.DATE, allowNull: false },
      atualizado_em: { type: Sequelize.DATE, allowNull: false },
      excluido_em: { type: Sequelize.DATE, allowNull: true }
    });

    await queryInterface.createTable('medicos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },
      especialidade_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'especialidades', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      nome: { type: Sequelize.STRING(140), allowNull: false },
      crm: { type: Sequelize.STRING(40), allowNull: false, unique: true },
      telefone: { type: Sequelize.STRING(30), allowNull: true },
      email: { type: Sequelize.STRING(160), allowNull: true },
      ativo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      criado_em: { type: Sequelize.DATE, allowNull: false },
      atualizado_em: { type: Sequelize.DATE, allowNull: false },
      excluido_em: { type: Sequelize.DATE, allowNull: true }
    });

    await queryInterface.createTable('consultas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },
      paciente_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'pacientes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      medico_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'medicos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      codigo: { type: Sequelize.STRING(8), allowNull: false, unique: true },
      consulta_em: { type: Sequelize.DATE, allowNull: false },
      status: {
        type: Sequelize.ENUM('aguardando', 'confirmado', 'atendido', 'cancelado', 'falta'),
        allowNull: false,
        defaultValue: 'aguardando'
      },
      prioridade: {
        type: Sequelize.ENUM('normal', 'idoso', 'pcd', 'gestante'),
        allowNull: false,
        defaultValue: 'normal'
      },
      observacoes: { type: Sequelize.TEXT, allowNull: true },
      motivo_cancelamento: { type: Sequelize.TEXT, allowNull: true },
      criado_em: { type: Sequelize.DATE, allowNull: false },
      atualizado_em: { type: Sequelize.DATE, allowNull: false },
      excluido_em: { type: Sequelize.DATE, allowNull: true }
    });

    await queryInterface.createTable('documentos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },
      consulta_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'consultas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      paciente_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'pacientes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tipo: { type: Sequelize.STRING(80), allowNull: false, defaultValue: 'documento' },
      arquivo_frente_caminho: { type: Sequelize.STRING, allowNull: false },
      arquivo_frente_nome_original: { type: Sequelize.STRING, allowNull: false },
      arquivo_frente_mime: { type: Sequelize.STRING, allowNull: false },
      arquivo_frente_tamanho: { type: Sequelize.INTEGER, allowNull: false },
      arquivo_verso_caminho: { type: Sequelize.STRING, allowNull: true },
      arquivo_verso_nome_original: { type: Sequelize.STRING, allowNull: true },
      arquivo_verso_mime: { type: Sequelize.STRING, allowNull: true },
      arquivo_verso_tamanho: { type: Sequelize.INTEGER, allowNull: true },
      criado_em: { type: Sequelize.DATE, allowNull: false },
      atualizado_em: { type: Sequelize.DATE, allowNull: false },
      excluido_em: { type: Sequelize.DATE, allowNull: true }
    });

    await queryInterface.addIndex('pacientes', ['cpf']);
    await queryInterface.addIndex('medicos', ['especialidade_id']);
    await queryInterface.addIndex('consultas', ['paciente_id', 'consulta_em']);
    await queryInterface.addIndex('consultas', ['medico_id', 'consulta_em']);
    await queryInterface.addIndex('consultas', ['status']);
    await queryInterface.addIndex('documentos', ['consulta_id']);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX consultas_medico_horario_ativo_unico
      ON consultas (medico_id, consulta_em)
      WHERE ${filtroStatusAtivo};
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS consultas_medico_horario_ativo_unico;');
    await queryInterface.dropTable('documentos');
    await queryInterface.dropTable('consultas');
    await queryInterface.dropTable('medicos');
    await queryInterface.dropTable('especialidades');
    await queryInterface.dropTable('pacientes');
    await queryInterface.dropTable('usuarios');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_usuarios_perfil;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_consultas_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_consultas_prioridade;');
  }
};
