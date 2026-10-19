# FilaJusta - Vida Plena

Sistema web fullstack para agendamento e gerenciamento de consultas médicas. Centraliza o fluxo de atendimento de uma clínica: paciente, agendamento, recepção, médico e administração.

O frontend (Next.js) consome uma API REST própria (Node.js/Express) com banco PostgreSQL.

## Funcionalidades

- Agendamento e consulta de consultas
- Gerenciamento de médicos, especialidades e usuários
- Controle da fila de atendimento com priorização de pacientes
- Gerenciamento de horários e agenda
- Autenticação de funcionários e controle de acesso por perfil (paciente, recepção e administração)

## Tecnologias

| Camada   | Principais tecnologias                                              |
|----------|---------------------------------------------------------------------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, React Hook Form, Zod      |
| Backend  | Node.js, Express, Sequelize, JWT, bcrypt, Zod, Helmet               |
| Banco    | PostgreSQL                                                          |

## Estrutura do repositório

```text
filajusta/
├── frontend/   # aplicação Next.js
├── backend/    # API REST (Express + Sequelize, com migrations e seeders)
├── docs/       # documentação e coleção do Postman
└── .github/    # workflows de CI
```

## Como rodar localmente

Pré-requisitos: Node.js, npm, PostgreSQL e Git.

### 1. Clonar

```bash
git clone https://github.com/Uninorte-Extensao/filajusta.git
cd filajusta
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # preencha as variáveis
npm run db:migrate
npm run db:seed
npm run dev            # http://localhost:3000
```

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env
npm run dev            # http://localhost:3001
```


## Documentação

- API, scripts e detalhes do backend: [backend/README.md](backend/README.md)
- Coleção do Postman: [docs/FilaJusta.postman_collection.json](docs/FilaJusta.postman_collection.json)

## Equipe

Yandrew Souza, Alexson Brito, Pedro Ordones, Alberto Cordova e Yvens Souza.

## Contribuindo

1. Faça um fork do repositório.
2. Crie uma branch para a sua alteração.
3. Abra um Pull Request para a `main`, ligado à issue correspondente.

## Licença

O backend está configurado sob a licença MIT.