const { Usuario } = require('../../banco/modelos');

class UsuarioRepositorio {
  listar() {
    return Usuario.findAll({
      attributes: ['id', 'nome', 'email', 'perfil', 'ativo', 'criado_em', 'atualizado_em'],
      order: [['nome', 'ASC']]
    });
  }

  buscarPorId(id) {
    return Usuario.findByPk(id, {
      attributes: ['id', 'nome', 'email', 'perfil', 'ativo', 'criado_em', 'atualizado_em']
    });
  }

  buscarPorEmail(email) {
    return Usuario.findOne({ where: { email } });
  }

  criar(dados) {
    return Usuario.create(dados);
  }

  async atualizar(usuario, dados) {
    await usuario.update(dados);
    return this.buscarPorId(usuario.id);
  }

  remover(usuario) {
    return usuario.destroy();
  }
}

module.exports = new UsuarioRepositorio();
