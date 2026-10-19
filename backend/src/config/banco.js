const ambiente = require('./ambiente');

const dialectOptions = {
  application_name: 'FilaJusta'
};

if (ambiente.banco.ssl) {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: ambiente.banco.rejeitarSslNaoAutorizado
  };
}

const configuracaoCompartilhada = {
  use_env_variable: ambiente.banco.url ? 'DATABASE_URL' : undefined,
  url: ambiente.banco.url,
  username: ambiente.banco.usuario,
  password: ambiente.banco.senha,
  database: ambiente.banco.nome,
  host: ambiente.banco.host,
  port: ambiente.banco.porta,
  dialect: ambiente.banco.dialeto,
  timezone: '-04:00',
  logging: ambiente.banco.logar ? console.log : false,
  dialectOptions,
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
