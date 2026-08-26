module.exports = (sequelize, DataTypes) => {
  const Medico = sequelize.define(
    'Medico',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      especialidade_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      nome: {
        type: DataTypes.STRING(140),
        allowNull: false
      },
      crm: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true
      },
      telefone: {
        type: DataTypes.STRING(30),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'medicos',
      underscored: true,
      paranoid: true
    }
  );

  Medico.associate = (modelos) => {
    Medico.belongsTo(modelos.Especialidade, { foreignKey: 'especialidade_id', as: 'especialidade' });
    Medico.hasMany(modelos.Consulta, { foreignKey: 'medico_id', as: 'consultas' });
  };

  return Medico;
};
