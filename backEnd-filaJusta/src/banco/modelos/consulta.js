module.exports = (sequelize, DataTypes) => {
  const { formatarDataManaus } = require('../../utils/data');

  const Consulta = sequelize.define(
    'Consulta',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      paciente_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      medico_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      codigo: {
        type: DataTypes.STRING(8),
        allowNull: false,
        unique: true
      },
      consulta_em: {
        type: DataTypes.DATE,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('aguardando', 'confirmado', 'atendido', 'cancelado', 'falta'),
        allowNull: false,
        defaultValue: 'aguardando'
      },
      prioridade: {
        type: DataTypes.ENUM('normal', 'idoso', 'pcd', 'gestante'),
        allowNull: false,
        defaultValue: 'normal'
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      motivo_cancelamento: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'consultas',
      underscored: true,
      paranoid: true
    }
  );

  Consulta.associate = (modelos) => {
    Consulta.belongsTo(modelos.Paciente, { foreignKey: 'paciente_id', as: 'paciente' });
    Consulta.belongsTo(modelos.Medico, { foreignKey: 'medico_id', as: 'medico' });
    Consulta.hasMany(modelos.Documento, { foreignKey: 'consulta_id', as: 'documentos' });
  };

  Consulta.prototype.toJSON = function toJSON() {
    const valores = { ...this.get() };
    if (valores.consulta_em) valores.consulta_em = formatarDataManaus(valores.consulta_em);
    if (valores.criado_em) valores.criado_em = formatarDataManaus(valores.criado_em);
    if (valores.atualizado_em) valores.atualizado_em = formatarDataManaus(valores.atualizado_em);
    return valores;
  };

  return Consulta;
};
