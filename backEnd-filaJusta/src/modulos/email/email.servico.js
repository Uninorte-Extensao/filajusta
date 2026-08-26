const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

class EmailServico {
  async enviarCodigoRecuperacao(email, codigo) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Código de recuperação - FilaJusta',
      text: `Seu código de recuperação é: ${codigo}. Ele expira em 10 minutos.`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Recuperação de senha</h2>

          <p>Seu código de recuperação é:</p>

          <p style="
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 4px;
          ">
            ${codigo}
          </p>

          <p>
            Esse código expira em 10 minutos.
          </p>
        </div>
      `
    });
  }
}

module.exports = new EmailServico();