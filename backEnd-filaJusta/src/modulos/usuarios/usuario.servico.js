const bcrypt = require('bcrypt');
const ambiente = require('../../config/ambiente');
const ErroAplicacao = require('../../utils/erroAplicacao');
const usuarioRepositorio = require('./usuario.repositorio');

class UsuarioServico {
  listar() {
    return usuarioRepositorio.listar();
  }

  async buscar(id) {
    const usuario = await usuarioRepositorio.buscarPorId(id);
    if (!usuario) throw new ErroAplicacao('Usuario nao encontrado', 404);
    return usuario;
  }

  async criar(dados) {
    const existente = await usuarioRepositorio.buscarPorEmail(dados.email);
    if (existente) throw new ErroAplicacao('Email ja cadastrado', 409);

    const senha_hash = await bcrypt.hash(dados.senha, ambiente.bcrypt.saltos);
    const usuario = await usuarioRepositorio.criar({
      nome: dados.nome,
      email: dados.email,
      senha_hash,
      perfil: dados.perfil,
      ativo: dados.ativo ?? true
    });

    return usuarioRepositorio.buscarPorId(usuario.id);
  }

  async atualizar(id, dados) {
    const atual = await this.buscar(id);

    if (dados.email) {
      const existente = await usuarioRepositorio.buscarPorEmail(dados.email);
      if (existente && existente.id !== id) throw new ErroAplicacao('Email ja cadastrado', 409);
    }

    const dadosAtualizacao = { ...dados };
    if (dados.senha) {
      dadosAtualizacao.senha_hash = await bcrypt.hash(dados.senha, ambiente.bcrypt.saltos);
      delete dadosAtualizacao.senha;
    }

    return usuarioRepositorio.atualizar(atual, dadosAtualizacao);
  }

  async remover(id) {
    const usuario = await this.buscar(id);
    await usuarioRepositorio.remover(usuario);
  }
}

module.exports = new UsuarioServico();
