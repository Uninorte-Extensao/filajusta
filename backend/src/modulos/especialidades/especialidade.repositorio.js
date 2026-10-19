const { Especialidade, Medico } = require('../../banco/modelos');

class EspecialidadeRepositorio {
  listar() {
    return Especialidade.findAll({ order: [['nome', 'ASC']] });
  }

  buscarPorId(id) {
    return Especialidade.findByPk(id);
  }

  buscarPorNome(nome) {
    return Especialidade.findOne({ where: { nome } });
  }

  criar(dados) {
    return Especialidade.create(dados);
  }

  async atualizar(especialidade, dados) {
    await especialidade.update(dados);
    return especialidade;
  }

  remover(especialidade) {
    return especialidade.destroy();
  }

  contarMedicos(id) {
    return Medico.count({ where: { especialidade_id: id } });
  }
}

module.exports = new EspecialidadeRepositorio();
