const { Medico, Especialidade } = require('../../banco/modelos');

const incluirEspecialidade = [{ model: Especialidade, as: 'especialidade', attributes: ['id', 'nome'] }];

class MedicoRepositorio {
  listar() {
    return Medico.findAll({ include: incluirEspecialidade, order: [['nome', 'ASC']] });
  }

  buscarPorId(id, opcoes = {}) {
    return Medico.findByPk(id, { include: incluirEspecialidade, ...opcoes });
  }

  buscarPorCrm(crm) {
    return Medico.findOne({ where: { crm } });
  }

  criar(dados) {
    return Medico.create(dados);
  }

  async atualizar(medico, dados) {
    await medico.update(dados);
    return this.buscarPorId(medico.id);
  }

  remover(medico) {
    return medico.destroy();
  }
}

module.exports = new MedicoRepositorio();
