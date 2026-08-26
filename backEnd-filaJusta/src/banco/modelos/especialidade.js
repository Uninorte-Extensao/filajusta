module.exports = (sequelize, DataTypes) => {
  const Especialidade = sequelize.define(
    'Especialidade',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      nome: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'especialidades',
      underscored: true,
      paranoid: true
    }
  );

  Especialidade.associate = (modelos) => {
    Especialidade.hasMany(modelos.Medico, { foreignKey: 'especialidade_id', as: 'medicos' });
  };

  return Especialidade;
};
