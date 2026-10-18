const { Documento, Consulta, Paciente } = require('../../banco/modelos');

class DocumentoRepositorio {
  criar(dados) {
    return Documento.create(dados);
  }

  buscarPorId(id) {
    return Documento.findByPk(id, {
      include: [
        { model: Consulta, as: 'consulta', attributes: ['id', 'codigo', 'status', 'prioridade', 'consulta_em'] },
        { model: Paciente, as: 'paciente', attributes: ['id', 'nome', 'cpf'] }
      ]
    });
  }

  listarPorConsulta(consultaId) {
    return Documento.findAll({
      where: { consulta_id: consultaId },
      order: [['criado_em', 'DESC']]
    });
  }
}

module.exports = new DocumentoRepositorio();
