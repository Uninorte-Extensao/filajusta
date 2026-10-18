module.exports = (sequelize, DataTypes) => {
  const Paciente = sequelize.define(
    'Paciente',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      nome: {
        type: DataTypes.STRING(140),
        allowNull: false
      },
      cpf: {
        type: DataTypes.STRING(11),
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
      data_nascimento: {
        type: DataTypes.DATEONLY,
        allowNull: true
      }
    },
    {
      tableName: 'pacientes',
      underscored: true,
      paranoid: true
    }
  );

  Paciente.associate = (modelos) => {
    Paciente.hasMany(modelos.Consulta, { foreignKey: 'paciente_id', as: 'consultas' });
    Paciente.hasMany(modelos.Documento, { foreignKey: 'paciente_id', as: 'documentos' });
  };

  return Paciente;
};
