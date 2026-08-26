const ambiente = require('../config/ambiente');

const respostaSucesso = {
  type: 'object',
  properties: {
    sucesso: { type: 'boolean', example: true },
    mensagem: { type: 'string', example: 'Operacao realizada com sucesso' },
    dados: { nullable: true }
  }
};

const respostaErro = {
  type: 'object',
  properties: {
    sucesso: { type: 'boolean', example: false },
    mensagem: { type: 'string', example: 'Erro na operacao' },
    erro: { nullable: true }
  }
};

const semAutenticacao = 'Esta rota NAO requer autenticacao. Pacientes nao possuem login e nao recebem token.';
const comJwt = 'Esta rota requer JWT Bearer Token de usuario interno com perfil autorizado.';
const segurancaJwt = [{ bearerAuth: [] }];

const respostaPadrao = (descricao = 'Operacao realizada com sucesso') => ({
  description: descricao,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/RespostaSucesso' } } }
});

const erroPadrao = (descricao = 'Erro na operacao') => ({
  description: descricao,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/RespostaErro' } } }
});

const parametroId = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' }
};

const parametroCodigo = {
  name: 'codigo',
  in: 'path',
  required: true,
  schema: { type: 'string', example: 'VPL-1234' }
};

const queryCpf = {
  name: 'cpf',
  in: 'query',
  required: true,
  schema: { type: 'string', example: '52998224725' }
};

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'FilaJusta API',
    version: '3.0.0',
    description: 'API FilaJusta com fluxo publico para pacientes sem JWT e fluxo administrativo protegido por JWT.'
  },
  servers: [{ url: ambiente.urlAplicacao }],
  tags: [
    { name: 'Publico', description: semAutenticacao },
    { name: 'Autenticacao Interna', description: 'Login exclusivo para recepcao e admin.' },
    { name: 'Recepcao', description: comJwt },
    { name: 'Admin', description: comJwt }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      RespostaSucesso: respostaSucesso,
      RespostaErro: respostaErro,
      Login: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@filajusta.local' },
          senha: { type: 'string', example: 'FilaJusta@123' }
        }
      },
      ConsultaPublica: {
        type: 'object',
        required: ['medico_id', 'consulta_em', 'paciente_nome', 'paciente_cpf'],
        properties: {
          medico_id: { type: 'string', format: 'uuid', example: '66666666-6666-4666-8666-666666666666' },
          consulta_em: { type: 'string', format: 'date-time', example: '2026-05-15T07:00:00-04:00' },
          paciente_nome: { type: 'string', example: 'Maria da Silva' },
          paciente_cpf: { type: 'string', example: '529.982.247-25' },
          paciente_telefone: { type: 'string', example: '(92) 99999-0000' },
          paciente_email: { type: 'string', format: 'email', example: 'maria@example.com' },
          prioridade: {
            type: 'string',
            enum: ['normal', 'idoso', 'pcd', 'gestante'],
            example: 'idoso',
            description: 'Campo informativo. Nao altera a ordem da fila. idoso: Lei 10.741/2003; pcd: Lei 13.146/2015; gestante: Lei 11.634/2007.'
          },
          observacoes: { type: 'string', example: 'Primeira consulta' }
        }
      },
      Usuario: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          email: { type: 'string', format: 'email' },
          senha: { type: 'string' },
          perfil: { type: 'string', enum: ['admin', 'recepcao'] },
          ativo: { type: 'boolean' }
        }
      },
      StatusConsulta: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['aguardando', 'confirmado', 'atendido', 'cancelado', 'falta'] },
          motivo_cancelamento: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/saude': {
      get: { tags: ['Publico'], summary: 'Verifica saude da API', description: semAutenticacao, security: [], responses: { 200: respostaPadrao('API online') } }
    },
    '/documentacao-json': {
      get: { tags: ['Publico'], summary: 'Retorna OpenAPI JSON', description: semAutenticacao, security: [], responses: { 200: { description: 'OpenAPI JSON' } } }
    },
    '/api/especialidades': {
      get: { tags: ['Publico'], summary: 'Lista especialidades ativas', description: semAutenticacao, security: [], responses: { 200: respostaPadrao() } }
    },
    '/api/medicos': {
      get: { tags: ['Publico'], summary: 'Lista medicos ativos', description: semAutenticacao, security: [], responses: { 200: respostaPadrao() } }
    },
    '/api/horarios': {
      get: {
        tags: ['Publico'],
        summary: 'Lista horarios disponiveis sem expor pacientes',
        description: semAutenticacao,
        security: [],
        parameters: [
          { name: 'medico_id', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'data', in: 'query', required: true, schema: { type: 'string', example: '2026-05-15' } }
        ],
        responses: { 200: respostaPadrao() }
      }
    },
    '/api/consultas': {
      post: {
        tags: ['Publico'],
        summary: 'Agenda consulta para paciente sem login',
        description: `${semAutenticacao} Horarios permitidos: 07:00 ate 17:00 em America/Manaus.`,
        security: [],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ConsultaPublica' } } } },
        responses: { 201: respostaPadrao('Consulta agendada'), 400: erroPadrao('Regra invalida'), 409: erroPadrao('Conflito de horario ou CPF') }
      }
    },
    '/api/consultas/codigo/{codigo}': {
      get: {
        tags: ['Publico'],
        summary: 'Consulta agendamento por codigo e CPF',
        description: `${semAutenticacao} Exige CPF + codigo VPL-XXXX. CPF divergente retorna 403.`,
        security: [],
        parameters: [parametroCodigo, queryCpf],
        responses: { 200: respostaPadrao(), 403: erroPadrao('CPF nao autorizado'), 404: erroPadrao('Consulta nao encontrada') }
      }
    },
    '/api/consultas/codigo/{codigo}/confirmar': {
      patch: {
        tags: ['Publico'],
        summary: 'Confirma consulta por codigo e CPF',
        description: `${semAutenticacao} Exige CPF + codigo VPL-XXXX.`,
        security: [],
        parameters: [parametroCodigo, queryCpf],
        responses: { 200: respostaPadrao('Consulta confirmada'), 400: erroPadrao('Transicao invalida'), 403: erroPadrao('CPF nao autorizado') }
      }
    },
    '/api/consultas/codigo/{codigo}/cancelar': {
      patch: {
        tags: ['Publico'],
        summary: 'Cancela consulta por codigo e CPF',
        description: `${semAutenticacao} Exige CPF + codigo VPL-XXXX.`,
        security: [],
        parameters: [parametroCodigo, queryCpf],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { motivo_cancelamento: { type: 'string' } } } } } },
        responses: { 200: respostaPadrao('Consulta cancelada'), 400: erroPadrao('Transicao invalida'), 403: erroPadrao('CPF nao autorizado') }
      }
    },
    '/api/documentos/upload': {
      post: {
        tags: ['Publico'],
        summary: 'Envia documento de consulta por codigo e CPF',
        description: `${semAutenticacao} Upload publico exige CPF + codigo e frente obrigatoria.`,
        security: [],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['codigo', 'cpf', 'frente'],
                properties: {
                  codigo: { type: 'string', example: 'VPL-1234' },
                  cpf: { type: 'string', example: '52998224725' },
                  frente: { type: 'string', format: 'binary' },
                  verso: { type: 'string', format: 'binary' },
                  tipo: { type: 'string', example: 'documento' }
                }
              }
            }
          }
        },
        responses: { 201: respostaPadrao('Documento enviado'), 400: erroPadrao('Upload invalido'), 403: erroPadrao('CPF nao autorizado') }
      }
    },
    '/api/autenticacao/login': {
      post: {
        tags: ['Autenticacao Interna'],
        summary: 'Login de usuario interno',
        description: 'Uso exclusivo de recepcao e admin. Pacientes nao usam esta rota.',
        security: [],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } } },
        responses: { 200: respostaPadrao('Login realizado'), 401: erroPadrao('Credenciais invalidas'), 429: erroPadrao('Muitas tentativas') }
      }
    },
    '/api/autenticacao/me': {
      get: { tags: ['Autenticacao Interna'], summary: 'Usuario interno autenticado', description: comJwt, security: segurancaJwt, responses: { 200: respostaPadrao(), 401: erroPadrao('Token invalido') } }
    },
    '/api/recepcao/agenda/horarios': {
      get: { tags: ['Recepcao'], summary: 'Horarios internos com dados de agenda', description: comJwt, security: segurancaJwt, responses: { 200: respostaPadrao() } }
    },
    '/api/recepcao/agenda/dia': {
      get: { tags: ['Recepcao'], summary: 'Agenda diaria completa em ordem cronologica', description: `${comJwt} A prioridade e apenas informativa e nao altera a ordem da agenda.`, security: segurancaJwt, responses: { 200: respostaPadrao() } }
    },
    '/api/recepcao/consultas': {
      get: { tags: ['Recepcao'], summary: 'Lista consultas internas', description: comJwt, security: segurancaJwt, responses: { 200: respostaPadrao() } }
    },
    '/api/recepcao/consultas/{id}/status': {
      patch: { tags: ['Recepcao'], summary: 'Altera status de consulta', description: `${comJwt} Permite confirmado -> atendido e confirmado -> falta.`, security: segurancaJwt, parameters: [parametroId], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/StatusConsulta' } } } }, responses: { 200: respostaPadrao() } }
    },
    '/api/recepcao/pacientes': {
      get: { tags: ['Recepcao'], summary: 'Lista pacientes', description: comJwt, security: segurancaJwt, responses: { 200: respostaPadrao() } }
    },
    '/api/recepcao/documentos/{id}/download': {
      get: { tags: ['Recepcao'], summary: 'Baixa documento privado', description: comJwt, security: segurancaJwt, parameters: [parametroId], responses: { 200: { description: 'Arquivo privado' } } }
    },
    '/api/admin/usuarios': {
      get: { tags: ['Admin'], summary: 'Lista usuarios internos', description: comJwt, security: segurancaJwt, responses: { 200: respostaPadrao() } },
      post: { tags: ['Admin'], summary: 'Cria usuario interno', description: comJwt, security: segurancaJwt, requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } }, responses: { 201: respostaPadrao() } }
    },
    '/api/admin/medicos': {
      get: { tags: ['Admin'], summary: 'Lista medicos', description: comJwt, security: segurancaJwt, responses: { 200: respostaPadrao() } },
      post: { tags: ['Admin'], summary: 'Cria medico', description: comJwt, security: segurancaJwt, responses: { 201: respostaPadrao() } }
    },
    '/api/admin/especialidades': {
      get: { tags: ['Admin'], summary: 'Lista especialidades', description: comJwt, security: segurancaJwt, responses: { 200: respostaPadrao() } },
      post: { tags: ['Admin'], summary: 'Cria especialidade', description: comJwt, security: segurancaJwt, responses: { 201: respostaPadrao() } }
    },
    '/api/admin/consultas': {
      get: { tags: ['Admin'], summary: 'Lista consultas', description: comJwt, security: segurancaJwt, responses: { 200: respostaPadrao() } }
    },
    '/api/admin/agenda/dia': {
      get: { tags: ['Admin'], summary: 'Agenda completa', description: comJwt, security: segurancaJwt, responses: { 200: respostaPadrao() } }
    },
    '/api/admin/documentos/{id}/download': {
      get: { tags: ['Admin'], summary: 'Baixa documento privado', description: comJwt, security: segurancaJwt, parameters: [parametroId], responses: { 200: { description: 'Arquivo privado' } } }
    }
  }
};
