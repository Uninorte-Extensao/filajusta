# 🏥 FilaJusta — Vida Plena

Sistema web fullstack para **agendamento e gerenciamento de consultas médicas**, desenvolvido para facilitar o atendimento de pacientes e auxiliar a equipe da clínica no controle de médicos, especialidades, consultas e fila de atendimento.

O projeto possui uma aplicação web desenvolvida em **Next.js** integrada a uma **API REST própria em Node.js/Express**, utilizando **PostgreSQL** como banco de dados.

---

## 📌 Sobre o projeto

O **FilaJusta — Vida Plena** foi desenvolvido para centralizar o processo de atendimento de uma clínica médica.

A plataforma possui interfaces diferentes para pacientes, recepção e administração.

Entre as principais funcionalidades estão:

- Agendamento de consultas
- Consulta de agendamentos
- Gerenciamento de médicos
- Gerenciamento de especialidades
- Cadastro e gerenciamento de usuários
- Controle da fila de atendimento
- Autenticação de funcionários
- Controle de acesso por perfil
- Priorização de pacientes
- Gerenciamento de horários
- API REST própria
- Persistência dos dados em PostgreSQL

---

## 🖥️ Tecnologias utilizadas

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- Lucide React
- React Hook Form
- Zod
- date-fns
- Recharts
- Sonner

### Backend

- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT
- bcrypt
- Zod
- Nodemailer
- Multer
- Helmet
- Express Rate Limit
- Morgan
- Winston

---

## 🏗️ Arquitetura

O projeto está dividido em duas aplicações:

```text
filajusta-vidaplena-fullstack/
│
├── FrontEnd/
│   ├── app/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   └── package.json
│
├── backEnd-filaJusta/
│   ├── src/
│   ├── migrations/
│   ├── seeders/
│   ├── .env.example
│   └── package.json
│
└── .gitignore
```

### FrontEnd

Responsável pela interface utilizada por:

- Pacientes
- Recepção
- Administradores

O frontend consome os endpoints disponibilizados pela API.

### BackEnd

Responsável por:

- Regras de negócio
- Autenticação
- Autorização
- Validação de dados
- Acesso ao banco
- Gerenciamento de consultas
- Médicos
- Especialidades
- Pacientes
- Usuários
- Agenda

---

## 👥 Perfis do sistema

O sistema possui diferentes níveis de acesso.

### 👤 Paciente

O paciente pode:

- Escolher uma especialidade
- Escolher um médico
- Selecionar data e horário
- Informar seus dados
- Criar um agendamento
- Consultar informações do agendamento

### 🧑‍💼 Recepção

A recepção possui acesso às funcionalidades relacionadas ao atendimento e acompanhamento das consultas.

Entre elas:

- Consulta de pacientes
- Visualização de médicos
- Acompanhamento da fila de espera
- Gerenciamento do atendimento

### 🔐 Administração

O administrador possui acesso às funcionalidades administrativas do sistema.

Entre elas:

- Gerenciamento de médicos
- Gerenciamento de especialidades
- Gerenciamento de usuários
- Administração de consultas
- Administração da agenda

---

## 🔐 Autenticação

A autenticação da aplicação é realizada pela própria API.

O backend utiliza:

- **JWT** para autenticação
- **bcrypt** para hash das senhas
- Middlewares de autenticação
- Middlewares de autorização por perfil
- Rate limiting em endpoints sensíveis

As senhas não devem ser armazenadas em texto puro.

---

## 🗄️ Banco de dados

O projeto utiliza:

```text
PostgreSQL
```

com:

```text
Sequelize ORM
```

O backend possui migrations e seeders para gerenciamento da estrutura e dos dados iniciais do banco.

---

## 🚀 Executando o projeto localmente

### Pré-requisitos

Antes de iniciar, tenha instalado:

- Node.js
- npm
- PostgreSQL
- Git

---

## 📥 Clonando o projeto

```bash
git clone https://github.com/Yandrew9393/filajusta-vidaplena-fullstack.git
```

Entre na pasta:

```bash
cd filajusta-vidaplena-fullstack
```

---

# ⚙️ Backend

Entre na pasta:

```bash
cd backEnd-filaJusta
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo:

```text
.env
```

Use o arquivo:

```text
.env.example
```

como referência para configurar as variáveis necessárias.

> Nunca envie o arquivo `.env` com credenciais reais para o repositório.

---

## 🗃️ Preparando o banco

Com o PostgreSQL configurado, execute as migrations:

```bash
npm run db:migrate
```

Caso o projeto utilize os dados iniciais disponibilizados nos seeders:

```bash
npm run db:seed
```

---

## ▶️ Iniciando o backend

```bash
npm run dev
```

Por padrão, durante o desenvolvimento, a API é executada em:

```text
http://localhost:3000
```

---

# 🎨 Frontend

Abra outro terminal e entre na pasta:

```bash
cd FrontEnd
```

Instale as dependências:

```bash
npm install
```

Configure o arquivo `.env` do frontend de acordo com o ambiente.

A aplicação deve apontar para a URL da API.

Exemplo de ambiente local:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Inicie o frontend:

```bash
npm run dev
```

Durante o desenvolvimento deste projeto, o frontend pode ser executado em:

```text
http://localhost:3001
```

---

## 🔄 Comunicação entre Frontend e Backend

A arquitetura funciona da seguinte maneira:

```text
┌─────────────────────┐
│      Frontend       │
│   Next.js + React   │
│   localhost:3001    │
└──────────┬──────────┘
           │
           │ HTTP / JSON
           ▼
┌─────────────────────┐
│      REST API       │
│  Node.js + Express  │
│   localhost:3000    │
└──────────┬──────────┘
           │
           │ Sequelize
           ▼
┌─────────────────────┐
│     PostgreSQL      │
│    Banco de dados   │
└─────────────────────┘
```

---

## 📡 API

A API possui módulos para recursos como:

```text
/api/autenticacao
/api/especialidades
/api/medicos
/api/consultas
/api/admin
```

Algumas rotas são públicas, enquanto outras exigem autenticação e permissões específicas.

Exemplo:

```http
POST /api/autenticacao/login
```

Rotas administrativas utilizam autenticação por token.

Exemplo:

```http
Authorization: Bearer <token>
```

---

## 🩺 Especialidades

As especialidades são armazenadas no banco de dados e identificadas por UUID.

Exemplo:

```json
{
  "id": "00000000-0000-4000-8000-000000000108",
  "nome": "Neurologia",
  "descricao": "Acompanhamento de condicoes neurologicas."
}
```

O frontend consulta essas informações diretamente pela API, evitando listas de especialidades duplicadas ou IDs fixos na interface.

---

## 👨‍⚕️ Médicos

Os médicos são associados a uma especialidade através de:

```text
especialidade_id
```

Exemplo:

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

---

## 🛡️ Segurança

Algumas medidas utilizadas no backend:

- Hash de senha com bcrypt
- Autenticação JWT
- Controle de acesso por perfil
- Validação de entrada com Zod
- Rate limiting
- Helmet
- Variáveis sensíveis armazenadas em `.env`
- Separação entre rotas públicas e protegidas

Arquivos contendo credenciais reais não devem ser versionados.

---

## 📁 Variáveis de ambiente

O repositório utiliza arquivos `.env` localmente.

Eles estão ignorados pelo Git através do:

```text
.gitignore
```

Utilize os arquivos de exemplo disponibilizados no projeto para configurar seu ambiente.

Nunca publique:

- Senhas do PostgreSQL
- JWT secrets
- Credenciais de e-mail
- Tokens
- Chaves privadas
- Credenciais de serviços externos

---

## 🧪 Scripts do backend

```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Executar migrations
npm run db:migrate

# Executar seeders
npm run db:seed

# Desfazer último conjunto de seeds
npm run db:seed:undo

# Desfazer migration
npm run db:undo

# Desfazer todas as migrations
npm run db:undo:all
```

---

## 🧪 Scripts do frontend

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Lint
npm run lint
```

---

## 🌱 Status do projeto

🚧 **Projeto em desenvolvimento**

O sistema está sendo continuamente aprimorado e novas funcionalidades poderão ser adicionadas.

---

## 🎯 Objetivo

O objetivo do FilaJusta é oferecer uma solução organizada para o fluxo de atendimento médico, permitindo integrar em uma única aplicação:

**paciente → agendamento → recepção → médico → administração**

---

## 🤝 Contribuições

Sugestões, melhorias e contribuições são bem-vindas.

Para contribuir:

1. Faça um fork do projeto.
2. Crie uma branch para sua alteração.
3. Faça suas alterações.
4. Crie um commit.
5. Envie a branch para seu fork.
6. Abra um Pull Request.

---

## 👨‍💻 Autor

Desenvolvido por Yandrew Souza, Alexson Brito, Pedro Ordones, Alberto Cordova, Yvens Souza

GitHub: [@Yandrew9393](https://github.com/Yandrew9393)

---

## 📄 Licença

O backend do projeto está configurado sob a licença MIT.

Consulte os arquivos do projeto para informações adicionais sobre licenciamento.

---

⭐ Se este projeto foi útil ou chamou sua atenção, considere deixar uma estrela no repositório.
