const ambiente = require('./ambiente');

const configuracaoCompartilhada = {
  username: ambiente.banco.usuario,
  password: ambiente.banco.senha,
  database: ambiente.banco.nome,
  host: ambiente.banco.host,
  port: ambiente.banco.porta,
  dialect: ambiente.banco.dialeto,
  timezone: '-04:00',
  logging: ambiente.banco.logar ? console.log : false,
  dialectOptions: {
    application_name: 'FilaJusta'
  },
  hooks: {
    afterConnect: async (conexao) => {
      if (conexao.query) {
        await conexao.query(`SET TIME ZONE '${ambiente.fusoHorario}'`);
      }
    }
  },
  define: {
    underscored: true,
    timestamps: true,
    paranoid: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
    deletedAt: 'excluido_em'
  }
};

module.exports = {
  development: configuracaoCompartilhada,
  test: {
    ...configuracaoCompartilhada,
    database: `${ambiente.banco.nome}_teste`,
    logging: false
  },
  production: configuracaoCompartilhada
};
