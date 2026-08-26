const ErroAplicacao = require('../../utils/erroAplicacao');
const pacienteRepositorio = require('./paciente.repositorio');

class PacienteServico {
  listar() {
    return pacienteRepositorio.listar();
  }

  async buscar(id) {
    const paciente = await pacienteRepositorio.buscarPorId(id);
    if (!paciente) throw new ErroAplicacao('Paciente nao encontrado', 404);
    return paciente;
  }

  async criar(dados) {
    const normalizado = this.normalizarPaciente(dados);
    const existente = await pacienteRepositorio.buscarPorCpf(normalizado.cpf);
    if (existente) throw new ErroAplicacao('CPF ja cadastrado', 409);
    return pacienteRepositorio.criar(normalizado);
  }

  async atualizar(id, dados) {
    const paciente = await this.buscar(id);
    const normalizado = this.normalizarPaciente(dados);

    if (normalizado.cpf) {
      const existente = await pacienteRepositorio.buscarPorCpf(normalizado.cpf);
      if (existente && existente.id !== id) throw new ErroAplicacao('CPF ja cadastrado', 409);
    }

    return pacienteRepositorio.atualizar(paciente, normalizado);
  }

  async remover(id) {
    const paciente = await this.buscar(id);
    await pacienteRepositorio.remover(paciente);
  }

  async buscarOuCriarPorConsulta(dados, opcoes = {}) {
    const paciente = await pacienteRepositorio.buscarPorCpf(dados.paciente_cpf, opcoes);
    if (paciente) {
      const atualizacoes = {};
      if (dados.paciente_nome && paciente.nome !== dados.paciente_nome) atualizacoes.nome = dados.paciente_nome;
      if (dados.paciente_telefone !== undefined) atualizacoes.telefone = dados.paciente_telefone;
      if (dados.paciente_email !== undefined) atualizacoes.email = dados.paciente_email;
      if (Object.keys(atualizacoes).length) await paciente.update(atualizacoes, opcoes);
      return paciente;
    }

    return pacienteRepositorio.criar(
      {
        nome: dados.paciente_nome,
        cpf: dados.paciente_cpf,
        telefone: dados.paciente_telefone,
        email: dados.paciente_email
      },
      opcoes
    );
  }

  normalizarPaciente(dados) {
    const normalizado = { ...dados };
    if (normalizado.birth_date && !normalizado.data_nascimento) {
      normalizado.data_nascimento = normalizado.birth_date;
    }
    delete normalizado.birth_date;
    return normalizado;
  }
}

module.exports = new PacienteServico();
