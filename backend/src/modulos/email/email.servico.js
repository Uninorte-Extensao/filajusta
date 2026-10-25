const nodemailer = require('nodemailer');
const ambiente = require('../../config/ambiente');
const { logger } = require('../../utils/logger');
const ErroAplicacao = require('../../utils/erroAplicacao');

class EmailServico {
  configurado() {
    return Boolean(ambiente.smtp.host);
  }

  criarTransporte() {
    const { host, porta, seguro, usuario, senha } = ambiente.smtp;

    return nodemailer.createTransport({
      host,
      port: porta,
      secure: seguro,
      auth: usuario ? { user: usuario, pass: senha } : undefined
    });
  }

  async enviarCodigoRecuperacao(email, codigo) {
    const minutos = ambiente.recuperacaoSenha.expiracaoMinutos;

    if (!this.configurado()) {
      if (ambiente.producao) {
        throw new ErroAplicacao('Envio de e-mail nao configurado (SMTP_HOST ausente)', 503);
      }
      // Em desenvolvimento, sem SMTP, o codigo aparece no log do servidor.
      logger.warn(`[DEV] SMTP nao configurado. Codigo de recuperacao de ${email}: ${codigo}`);
      return;
    }

    await this.criarTransporte().sendMail({
      from: ambiente.smtp.remetente,
      to: email,
      subject: 'Código de recuperação - FilaJusta',
      text: `Seu código de recuperação é: ${codigo}. Ele expira em ${minutos} minutos.`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Recuperação de senha</h2>
          <p>Seu código de recuperação é:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${codigo}</p>
          <p>Esse código expira em ${minutos} minutos.</p>
        </div>
      `
    });
  }
}

module.exports = new EmailServico();
