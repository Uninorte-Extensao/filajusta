const ErroAplicacao = require('../../utils/erroAplicacao');
const medicoRepositorio = require('./medico.repositorio');
const especialidadeRepositorio = require('../especialidades/especialidade.repositorio');

class MedicoServico {
  listar() {
    return medicoRepositorio.listar();
  }

  async listarPublico(filtros = {}) {
    const filtrosNormalizados = await this.normalizarFiltrosPublicos(filtros);
    const medicos = await medicoRepositorio.listar({ ativo: true, ...filtrosNormalizados });

    return medicos.map((medico) => this.serializarPublico(medico));
  }

  async buscar(id) {
    const medico = await medicoRepositorio.buscarPorId(id);
    if (!medico) throw new ErroAplicacao('Medico nao encontrado', 404);
    return medico;
  }

  async garantirMedicoAtivo(id) {
    const medico = await medicoRepositorio.buscarPorId(id);
    if (!medico || !medico.ativo) throw new ErroAplicacao('Medico nao encontrado ou inativo', 404);
    return medico;
  }

  async criar(dados) {
    const normalizado = this.normalizarMedico(dados);
    await this.validarEspecialidade(normalizado.especialidade_id);

    const existente = await medicoRepositorio.buscarPorCrm(normalizado.crm);
    if (existente) throw new ErroAplicacao('CRM ja cadastrado', 409);

    const medico = await medicoRepositorio.criar({ ...normalizado, ativo: normalizado.ativo ?? true });
    return medicoRepositorio.buscarPorId(medico.id);
  }

  async atualizar(id, dados) {
    const medico = await this.buscar(id);
    const normalizado = this.normalizarMedico(dados);

    if (normalizado.especialidade_id) {
      await this.validarEspecialidade(normalizado.especialidade_id);
    }

    if (normalizado.crm) {
      const existente = await medicoRepositorio.buscarPorCrm(normalizado.crm);
      if (existente && existente.id !== id) throw new ErroAplicacao('CRM ja cadastrado', 409);
    }

    return medicoRepositorio.atualizar(medico, normalizado);
  }

  async remover(id) {
    const medico = await this.buscar(id);
    await medicoRepositorio.remover(medico);
  }

  async validarEspecialidade(id) {
    const especialidade = await especialidadeRepositorio.buscarPorId(id);
    if (!especialidade || !especialidade.ativo) {
      throw new ErroAplicacao('Especialidade nao encontrada ou inativa', 404);
    }
  }

  async normalizarFiltrosPublicos(filtros) {
    if (filtros.especialidade_id) {
      const especialidade = await especialidadeRepositorio.buscarPorId(filtros.especialidade_id);
      if (!especialidade || !especialidade.ativo) throw new ErroAplicacao('Especialidade não encontrada', 404);
      return { especialidade_id: especialidade.id };
    }

    if (filtros.especialidade) {
      const especialidade = await especialidadeRepositorio.buscarPorNome(filtros.especialidade);
      if (!especialidade || !especialidade.ativo) throw new ErroAplicacao('Especialidade não encontrada', 404);
      return { especialidade_id: especialidade.id };
    }

    return {};
  }

  serializarPublico(medico) {
    return {
      id: medico.id,
      nome: medico.nome,
      crm: medico.crm,
      especialidade: medico.especialidade
        ? {
            id: medico.especialidade.id,
            nome: medico.especialidade.nome
          }
        : null
    };
  }

  normalizarMedico(dados) {
    const normalizado = { ...dados };
    normalizado.especialidade_id = normalizado.especialidade_id || normalizado.especialidadeId;
    delete normalizado.especialidadeId;
    return normalizado;
  }
}

module.exports = new MedicoServico();
