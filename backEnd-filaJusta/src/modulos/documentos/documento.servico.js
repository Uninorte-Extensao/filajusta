const fs = require('fs');
const path = require('path');
const ErroAplicacao = require('../../utils/erroAplicacao');
const documentoRepositorio = require('./documento.repositorio');
const consultaServico = require('../consultas/consulta.servico');

class DocumentoServico {
  async criarParaConsulta(consultaId, dados, arquivos) {
    const consulta = await consultaServico.buscar(consultaId);
    const frente = arquivos?.frente?.[0] || arquivos?.front?.[0];
    const verso = arquivos?.verso?.[0] || arquivos?.back?.[0] || null;

    if (!frente) {
      throw new ErroAplicacao('Frente do documento e obrigatoria', 400);
    }

    const documento = await documentoRepositorio.criar({
      consulta_id: consulta.id,
      paciente_id: consulta.paciente_id,
      tipo: dados.tipo || dados.type || 'documento',
      arquivo_frente_caminho: this.caminhoPrivado(frente.path),
      arquivo_frente_nome_original: frente.originalname,
      arquivo_frente_mime: frente.mimetype,
      arquivo_frente_tamanho: frente.size,
      arquivo_verso_caminho: verso ? this.caminhoPrivado(verso.path) : null,
      arquivo_verso_nome_original: verso ? verso.originalname : null,
      arquivo_verso_mime: verso ? verso.mimetype : null,
      arquivo_verso_tamanho: verso ? verso.size : null
    });

    return this.serializar(documento);
  }

  async criarPublico(consulta, dados, arquivos) {
    return this.criarParaConsulta(consulta.id, dados, arquivos);
  }

  async listarPorConsulta(consultaId) {
    await consultaServico.buscar(consultaId);
    const documentos = await documentoRepositorio.listarPorConsulta(consultaId);
    return documentos.map((documento) => this.serializar(documento));
  }

  async download(id, ladoSolicitado = 'frente') {
    const documento = await documentoRepositorio.buscarPorId(id);
    if (!documento) throw new ErroAplicacao('Documento nao encontrado', 404);

    const lado = ladoSolicitado === 'back' ? 'verso' : ladoSolicitado === 'front' ? 'frente' : ladoSolicitado;
    const caminhoArquivo = lado === 'verso' ? documento.arquivo_verso_caminho : documento.arquivo_frente_caminho;
    const nomeOriginal = lado === 'verso' ? documento.arquivo_verso_nome_original : documento.arquivo_frente_nome_original;
    const mime = lado === 'verso' ? documento.arquivo_verso_mime : documento.arquivo_frente_mime;

    if (!caminhoArquivo) throw new ErroAplicacao('Arquivo solicitado nao existe para este documento', 404);

    const caminhoAbsoluto = path.resolve(process.cwd(), caminhoArquivo);
    if (!fs.existsSync(caminhoAbsoluto)) throw new ErroAplicacao('Arquivo nao encontrado no storage privado', 404);

    return { caminhoAbsoluto, nomeOriginal, mime };
  }

  serializar(documento) {
    return {
      id: documento.id,
      consulta_id: documento.consulta_id,
      paciente_id: documento.paciente_id,
      tipo: documento.tipo,
      frente: {
        nome_original: documento.arquivo_frente_nome_original,
        mime: documento.arquivo_frente_mime,
        tamanho: documento.arquivo_frente_tamanho,
        url_privada: `/api/documentos/${documento.id}/download?lado=frente`
      },
      verso: documento.arquivo_verso_caminho
        ? {
            nome_original: documento.arquivo_verso_nome_original,
            mime: documento.arquivo_verso_mime,
            tamanho: documento.arquivo_verso_tamanho,
            url_privada: `/api/documentos/${documento.id}/download?lado=verso`
          }
        : null,
      criado_em: documento.criado_em,
      atualizado_em: documento.atualizado_em
    };
  }

  caminhoPrivado(caminhoArquivo) {
    return path.relative(process.cwd(), caminhoArquivo).replace(/\\/g, '/');
  }
}

module.exports = new DocumentoServico();
