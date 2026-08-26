const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const ambiente = require('./config/ambiente');
const rotas = require('./rotas');
const documentoOpenApi = require('./documentacao/openapi');
const tratarErros = require('./middlewares/tratarErros');
const rotaNaoEncontrada = require('./middlewares/rotaNaoEncontrada');
const { loggerHttp } = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors({ origin: ambiente.cors.origem === '*' ? true : ambiente.cors.origem }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(loggerHttp);

app.get('/saude', (_req, res) => {
  res.json({ sucesso: true, mensagem: 'FilaJusta API online', dados: { status: 'ok' } });
});

app.get('/health', (_req, res) => {
  res.json({ sucesso: true, mensagem: 'FilaJusta API online', dados: { status: 'ok' } });
});

app.get('/documentacao-json', (_req, res) => {
  res.json(documentoOpenApi);
});

app.use('/documentacao', swaggerUi.serve, swaggerUi.setup(documentoOpenApi));
app.use('/api', rotas);
app.use(rotaNaoEncontrada);
app.use(tratarErros);

module.exports = app;
