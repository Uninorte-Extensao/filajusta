const ErroAplicacao = require('../../utils/erroAplicacao');
const especialidadeRepositorio = require('./especialidade.repositorio');

class EspecialidadeServico {
  listar() {
    return especialidadeRepositorio.listar();
  }

  async listarPublico() {
    const especialidades = await especialidadeRepositorio.listar();
    return especialidades
      .filter((especialidade) => especialidade.ativo)
      .map((especialidade) => ({
        id: especialidade.id,
        nome: especialidade.nome,
        descricao: especialidade.descricao
      }));
  }

  async buscar(id) {
    const especialidade = await especialidadeRepositorio.buscarPorId(id);
    if (!especialidade) throw new ErroAplicacao('Especialidade nao encontrada', 404);
    return especialidade;
  }

  async criar(dados) {
    const existente = await especialidadeRepositorio.buscarPorNome(dados.nome);
    if (existente) throw new ErroAplicacao('Especialidade ja cadastrada', 409);
    return especialidadeRepositorio.criar({ ...dados, ativo: dados.ativo ?? true });
  }

  async atualizar(id, dados) {
    const especialidade = await this.buscar(id);
    if (dados.nome) {
      const existente = await especialidadeRepositorio.buscarPorNome(dados.nome);
      if (existente && existente.id !== id) throw new ErroAplicacao('Especialidade ja cadastrada', 409);
    }
    return especialidadeRepositorio.atualizar(especialidade, dados);
  }

  async remover(id) {
    const especialidade = await this.buscar(id);
    const medicos = await especialidadeRepositorio.contarMedicos(id);
    if (medicos > 0) throw new ErroAplicacao('Especialidade possui medicos vinculados', 409);
    await especialidadeRepositorio.remover(especialidade);
  }
}

module.exports = new EspecialidadeServico();
