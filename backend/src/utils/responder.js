const sucesso = (res, dados = null, mensagem = 'Operacao realizada com sucesso', statusHttp = 200) => {
  return res.status(statusHttp).json({
    sucesso: true,
    mensagem,
    dados
  });
};

const erro = (res, mensagem = 'Erro na operacao', statusHttp = 500, detalhe = null) => {
  return res.status(statusHttp).json({
    sucesso: false,
    mensagem,
    erro: detalhe
  });
};

module.exports = { sucesso, erro };
