module.exports = (sequelize, DataTypes) => {
  const Documento = sequelize.define(
    'Documento',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      consulta_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      paciente_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      tipo: {
        type: DataTypes.STRING(80),
        allowNull: false,
        defaultValue: 'documento'
      },
      arquivo_frente_caminho: {
        type: DataTypes.STRING,
        allowNull: false
      },
      arquivo_frente_nome_original: {
        type: DataTypes.STRING,
        allowNull: false
      },
      arquivo_frente_mime: {
        type: DataTypes.STRING,
        allowNull: false
      },
      arquivo_frente_tamanho: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      arquivo_verso_caminho: {
        type: DataTypes.STRING,
        allowNull: true
      },
      arquivo_verso_nome_original: {
        type: DataTypes.STRING,
        allowNull: true
      },
      arquivo_verso_mime: {
        type: DataTypes.STRING,
        allowNull: true
      },
      arquivo_verso_tamanho: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: 'documentos',
      underscored: true,
      paranoid: true
    }
  );

  Documento.associate = (modelos) => {
    Documento.belongsTo(modelos.Consulta, { foreignKey: 'consulta_id', as: 'consulta' });
    Documento.belongsTo(modelos.Paciente, { foreignKey: 'paciente_id', as: 'paciente' });
  };

  return Documento;
};
