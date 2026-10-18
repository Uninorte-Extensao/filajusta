# FilaJusta - Backend

API REST do FilaJusta, construída com Node.js, Express, Sequelize e PostgreSQL.

## Responsabilidades

Regras de negócio, autenticação e autorização, validação de dados, acesso ao banco e gerenciamento de consultas, médicos, especialidades, pacientes, usuários e agenda.

## Configuração

```bash
npm install
cp .env.example .env   # use o .env.example como referência
npm run db:migrate
npm run db:seed
npm run dev            # http://localhost:3000
```

## Scripts

| Comando                | O que faz                              |
|------------------------|----------------------------------------|
| `npm run dev`          | Desenvolvimento                        |
| `npm start`            | Produção                               |
| `npm run db:migrate`   | Executa as migrations                  |
| `npm run db:seed`      | Executa os seeders                     |
| `npm run db:seed:undo` | Desfaz o último conjunto de seeds      |
| `npm run db:undo`      | Desfaz a última migration              |
| `npm run db:undo:all`  | Desfaz todas as migrations             |

## API

Módulos principais:

```text
/api/autenticacao
/api/especialidades
/api/medicos
/api/consultas
/api/admin
```

Algumas rotas são públicas e outras exigem autenticação e permissão por perfil. O login é feito em `POST /api/autenticacao/login`, e as rotas protegidas recebem o token no header:

```http
Authorization: Bearer <token>
```

A coleção completa de requisições está em [docs/FilaJusta.postman_collection.json](../docs/FilaJusta.postman_collection.json).

### Especialidades

Armazenadas no banco e identificadas por UUID. O frontend consulta a API em vez de usar listas ou IDs fixos.

```json
{
  "id": "00000000-0000-4000-8000-000000000108",
  "nome": "Neurologia",
  "descricao": "Acompanhamento de condicoes neurologicas."
}
```

### Médicos

Associados a uma especialidade por `especialidade_id`.

```json
{
  "nome": "Dr. Exemplo",
  "crm": "12345",
  "especialidade_id": "UUID-DA-ESPECIALIDADE",
  "telefone": null,
  "email": null,
  "ativo": true
}
```

## Segurança

- Hash de senha com bcrypt e autenticação JWT
- Controle de acesso por perfil
- Validação de entrada com Zod
- Rate limiting em endpoints sensíveis e Helmet
- Variáveis sensíveis apenas em `.env` (nunca versionado)