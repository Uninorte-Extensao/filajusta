class ErroAplicacao extends Error {
  constructor(mensagem, statusHttp = 500, erro = undefined) {
    super(mensagem);
    this.name = 'ErroAplicacao';
    this.statusHttp = statusHttp;
    this.erro = erro;
    this.operacional = true;
  }
}

module.exports = ErroAplicacao;
