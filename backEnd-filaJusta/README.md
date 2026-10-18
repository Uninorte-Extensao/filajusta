# FilaJusta Backend

Backend do FilaJusta com dois fluxos separados e inteligência de dados aplicada:

- **Público:** paciente agenda e acompanha consulta sem login, usando CPF e código `VPL-XXXX`.
- **Interno:** recepção e admin usam JWT para gestão da clínica, acompanhamento preditivo de absenteísmo (SmartPredict) e painel analítico (BI).

---

> ⚠️ **AVISO IMPORTANTE SOBRE DADOS E SEEDERS:**
> Os scripts de povoamento do banco de dados (`seeders`) foram desenvolvidos **exclusivamente para ambientes de desenvolvimento, testes locais e demonstrações acadêmicas**. Eles contêm registros fictícios e determinísticos de médicos, pacientes, especialidades e histórico de agendamentos. **NUNCA execute os seeders em ambiente de produção real.**

---

## Estrutura

```text
src/
├── app.js
├── servidor.js
├── banco/modelos/
├── config/
├── documentacao/
├── middlewares/
│   ├── autenticar.js
│   ├── autorizar.js
│   ├── validarConsultaPublica.js
│   └── ...
├── modulos/
│   ├── agenda/
│   ├── autenticacao/
│   ├── consultas/            
│   ├── analytics/            
│   ├── documentos/
│   ├── especialidades/
│   ├── medicos/
│   ├── pacientes/
│   └── usuarios/
├── rotas/
│   ├── publicas/
│   ├── recepcao/             
│   └── admin/
├── utils/
│   ├── engineRisco.js        
│   └── ...
└── validadores/


## Instalacao

Antes de iniciar o backend, tenha uma instancia PostgreSQL disponivel e configure as variaveis `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` no arquivo `.env`.

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed   # Apenas para testes locais e desenvolvimento
npm run dev
```

## Variaveis de Ambiente

O backend le as configuracoes a partir do arquivo `.env` em desenvolvimento e de variaveis de ambiente nos demais ambientes.

Principais variaveis:

```text
NODE_ENV
PORT
APP_URL
TIMEZONE
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
DATABASE_URL
DB_SSL
DB_SSL_REJECT_UNAUTHORIZED
JWT_SECRET
JWT_EXPIRES_IN
CORS_ORIGIN
FRONTEND_URL
UPLOAD_DIR
MAX_UPLOAD_SIZE_MB
LOG_LEVEL
```

Em producao, `JWT_SECRET` e obrigatorio, nao pode usar o valor de exemplo e precisa ter pelo menos 32 caracteres. Tambem e obrigatorio configurar `CORS_ORIGIN`.

Para PostgreSQL em nuvem, use `DATABASE_URL` quando o provedor entregar uma URL unica. Se o provedor exigir SSL, configure `DB_SSL=true`. Mantenha `DB_SSL_REJECT_UNAUTHORIZED=true` quando o certificado do provedor for confiavel.

## Banco, Migrations e Seeds

Rodar migrations:

```bash
npm run db:migrate
```

ou:

```bash
npx sequelize-cli db:migrate
```

Popular o banco com dados padroes:

```bash
npm run db:seed
```

ou:

```bash
npx sequelize-cli db:seed:all
```

Desfazer os seeds:

```bash
npm run db:seed:undo
```

ou:

```bash
npx sequelize-cli db:seed:undo:all
```

### Dados Criados Pelo Seeder

O seeder `seeders/20260512222000-initial-data.js` cria uma base deterministica para testes no backend, Swagger, Postman e frontend:

- 10 especialidades medicas.
- 30 medicos, sendo 3 por especialidade.
- 12 pacientes ficticios com CPF valido e unico.
- 20 consultas de exemplo com status `aguardando`, `confirmado`, `atendido`, `cancelado` e `falta`.
- Prioridades informativas `normal`, `idoso`, `pcd` e `gestante`.
- Consultas em slots validos entre `07:00` e `17:00`, sempre no timezone `America/Manaus`.

O projeto nao possui tabela de horarios. Os horarios disponiveis sao calculados pela agenda a partir do expediente `07:00-17:00` e das consultas ja ocupadas.

### Usuarios Internos Padroes

```text
Admin:
email: admin@filajusta.com
senha: 123456

Recepcao:
email: recepcao@filajusta.com
senha: 123456
```

As senhas sao salvas com `bcrypt`.

## Documentacao

- Swagger UI: `GET /documentacao`
- OpenAPI JSON: `GET /documentacao-json`

Depois de rodar migrations e seeds, use os dados criados para testar login, listagem de medicos, especialidades, agenda, consultas e documentos.

## Postman

Importe:

- `FilaJusta.postman_collection.json`
- `FilaJusta.environment.json`

A colecao esta dividida em:

- `Publico`: sem JWT.
- `Recepcao`: requer JWT.
- `Admin`: requer JWT.

Use `POST /api/autenticacao/login` com um dos usuarios seed para preencher o token JWT no ambiente do Postman.

## Fluxo Publico do Paciente

Paciente **nao possui login**, **nao recebe token** e **nao acessa painel administrativo**.

Fluxo recomendado: `Especialidades -> Medicos filtrados -> Horarios -> Consulta`.

Rotas publicas:

```text
GET   /api/especialidades
GET   /api/medicos
GET   /api/medicos?especialidade_id=<uuid>
GET   /api/horarios?medico_id=<uuid>&data=YYYY-MM-DD
POST  /api/consultas
GET   /api/consultas/codigo/:codigo?cpf=<cpf>
PATCH /api/consultas/codigo/:codigo/confirmar?cpf=<cpf>
PATCH /api/consultas/codigo/:codigo/cancelar?cpf=<cpf>
POST  /api/documentos/upload
```

Exemplo de medicos por especialidade:

```http
GET /api/medicos?especialidade_id=<uuid>
```

Exemplo de agendamento publico:

```http
POST /api/consultas
Content-Type: application/json

{
  "medico_id": "00000000-0000-4000-8000-000000000201",
  "consulta_em": "2026-05-18T07:00:00-04:00",
  "paciente_nome": "Maria da Silva",
  "paciente_cpf": "52998224725",
  "paciente_telefone": "(92) 99999-0000",
  "paciente_email": "maria@example.com",
  "prioridade": "idoso"
}
```

Consultar uma consulta:

```http
GET /api/consultas/codigo/VPL-A001?cpf=<cpf_do_paciente>
```

Se o CPF nao pertencer a consulta, a API retorna `403 Forbidden`.

Upload publico:

```http
POST /api/documentos/upload
Content-Type: multipart/form-data

codigo=VPL-A001
cpf=<cpf_do_paciente>
frente=<arquivo obrigatorio>
verso=<arquivo opcional>
tipo=documento
```

## Fluxo Interno

Recepcao e admin fazem login:

```http
POST /api/autenticacao/login
Content-Type: application/json

{
  "email": "admin@filajusta.com",
  "senha": "123456"
}
```

Use o token nas rotas protegidas:

```http
Authorization: Bearer <token>
```

## Rotas Protegidas da Recepcao

```text
GET   /api/recepcao/agenda/horarios
GET   /api/recepcao/agenda/dia
GET   /api/recepcao/consultas
GET   /api/recepcao/consultas/:id
PATCH /api/recepcao/consultas/:id/status
DELETE /api/recepcao/consultas/:id
GET   /api/recepcao/pacientes
PATCH /api/recepcao/pacientes/:id
GET   /api/recepcao/consultas/:consultaId/documentos
GET   /api/recepcao/documentos/:id/download
```

## Rotas Protegidas do Admin

```text
/api/admin/usuarios
/api/admin/medicos
/api/admin/especialidades
/api/admin/consultas
/api/admin/agenda
/api/admin/pacientes
/api/admin/documentos
```

## Middlewares de Autorizacao

- `autenticarUsuario`: valida JWT e carrega `req.usuario`.
- `autorizarPerfil`: restringe acesso por `admin` e/ou `recepcao`.
- `validarConsultaPublica`: valida `codigo + cpf`, busca a consulta e retorna `403` quando o CPF nao corresponde.

JWT nao e aplicado globalmente. Ele existe somente nas rotas internas.

## Regras de Consulta

- Codigo unico `VPL-XXXX`.
- Agendamento minimo: 1 hora de antecedencia.
- Agendamento maximo: 7 dias a frente.
- Uma consulta ativa por CPF no mesmo dia.
- Medico nao pode ter duas consultas ativas no mesmo horario.
- Conflitos retornam `409`.
- Status: `aguardando`, `confirmado`, `atendido`, `cancelado`, `falta`.
- Maquina de estados:
  - `aguardando -> confirmado | cancelado`
  - `confirmado -> atendido | falta | cancelado`
  - `atendido`, `cancelado` e `falta` sao finais.
- Transicoes publicas permitidas apenas para confirmar ou cancelar.
- Somente recepcao/admin podem marcar `falta`.
- Prioridade: `normal`, `idoso`, `pcd`, `gestante`.
- Prioridade e apenas informativa/visual e nao altera a posicao cronologica da agenda.
- `idoso`: Lei 10.741/2003, Estatuto do Idoso.
- `pcd`: Lei 13.146/2015, Lei Brasileira de Inclusao.
- `gestante`: Lei 11.634/2007.
- Horarios permitidos: 07:00 ate 17:00, com 17:00 incluso, sempre em `America/Manaus`.
- Agenda da recepcao e ordenada somente por data/hora da consulta.

## Testes Com Dados Seed

Para testar no Swagger, Postman ou frontend:

1. Rode migrations e seeds.
2. Faca login com `admin@filajusta.com` ou `recepcao@filajusta.com`.
3. Liste especialidades em `GET /api/especialidades`.
4. Liste todos os medicos ativos em `GET /api/medicos`.
5. Liste medicos de uma especialidade em `GET /api/medicos?especialidade_id=<uuid_da_especialidade>`.
6. Consulte horarios em `GET /api/horarios?medico_id=00000000-0000-4000-8000-000000000201&data=YYYY-MM-DD`.
7. Use uma consulta seed com codigo `VPL-A001` a `VPL-A020` e o CPF vinculado ao paciente para testar o fluxo publico.

## Respostas

Sucesso:

```json
{
  "sucesso": true,
  "mensagem": "Operacao realizada com sucesso",
  "dados": {}
}
```

Erro:

```json
{
  "sucesso": false,
  "mensagem": "Erro na operacao",
  "erro": {}
}
```
