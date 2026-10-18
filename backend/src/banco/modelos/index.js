const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const configuracaoBanco = require('../../config/banco')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(
  configuracaoBanco.database,
  configuracaoBanco.username,
  configuracaoBanco.password,
  configuracaoBanco
);

const banco = {};

fs.readdirSync(__dirname)
  .filter((arquivo) => arquivo !== 'index.js' && arquivo.endsWith('.js'))
  .forEach((arquivo) => {
    const criarModelo = require(path.join(__dirname, arquivo));
    const modelo = criarModelo(sequelize, DataTypes);
    banco[modelo.name] = modelo;
  });

Object.keys(banco).forEach((nomeModelo) => {
  if (banco[nomeModelo].associate) {
    banco[nomeModelo].associate(banco);
  }
});

banco.sequelize = sequelize;
banco.Sequelize = Sequelize;

module.exports = banco;
