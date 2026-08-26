const { Paciente } = require('../../banco/modelos');

class PacienteRepositorio {
  listar() {
    return Paciente.findAll({ order: [['nome', 'ASC']] });
  }

  buscarPorId(id, opcoes = {}) {
    return Paciente.findByPk(id, opcoes);
  }

  buscarPorCpf(cpf, opcoes = {}) {
    return Paciente.findOne({ where: { cpf }, ...opcoes });
  }

  criar(dados, opcoes = {}) {
    return Paciente.create(dados, opcoes);
  }

  async atualizar(paciente, dados, opcoes = {}) {
    await paciente.update(dados, opcoes);
    return paciente;
  }

  remover(paciente) {
    return paciente.destroy();
  }
}

module.exports = new PacienteRepositorio();
