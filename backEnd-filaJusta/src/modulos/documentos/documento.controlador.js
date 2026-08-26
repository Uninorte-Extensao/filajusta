const documentoServico = require('./documento.servico');
const { sucesso } = require('../../utils/responder');

class DocumentoControlador {
  async criar(req, res) {
    return sucesso(
      res,
      await documentoServico.criarParaConsulta(req.validado.parametros.consultaId, req.validado.corpo, req.files),
      'Documento enviado',
      201
    );
  }

  async listarPorConsulta(req, res) {
    return sucesso(
      res,
      await documentoServico.listarPorConsulta(req.validado.parametros.consultaId),
      'Documentos encontrados'
    );
  }

  async download(req, res) {
    const arquivo = await documentoServico.download(
      req.validado.parametros.id,
      req.validado.consulta.lado || req.validado.consulta.side || 'frente'
    );
    res.type(arquivo.mime);
    return res.download(arquivo.caminhoAbsoluto, arquivo.nomeOriginal);
  }
}

module.exports = new DocumentoControlador();
