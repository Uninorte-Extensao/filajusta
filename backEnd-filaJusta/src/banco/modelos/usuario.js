module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    'Usuario',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      nome: {
        type: DataTypes.STRING(120),
        allowNull: false
      },

      email: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true
      },

      senha_hash: {
        type: DataTypes.STRING,
        allowNull: false
      },

      perfil: {
        type: DataTypes.ENUM('admin', 'recepcao'),
        allowNull: false,
        defaultValue: 'recepcao'
      },

      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'usuarios',
      underscored: true,
      paranoid: true
    }
  );

  Usuario.associate = () => {};

  return Usuario;
}