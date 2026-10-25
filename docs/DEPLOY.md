# Publicação do FilaJusta

Arquitetura: frontend Next.js (Vercel) -> API Express em Docker (Render ou Railway) -> PostgreSQL.

## Antes de começar

1. Use no ambiente publicado uma senha de banco própria, diferente da usada em desenvolvimento.
2. Tenha em mãos: um banco PostgreSQL, uma conta no provedor do backend, uma conta na Vercel e uma conta SMTP (qualquer provedor de e-mail transacional ou uma conta de e-mail com senha de aplicativo).

## 1. Banco de dados

Crie um PostgreSQL no provedor escolhido e copie a **URL de conexão** (`postgres://usuario:senha@host:5432/banco`). Ela será a variável `DATABASE_URL` do backend. Se o provedor exigir SSL, use `DB_SSL=true`.

## 2. Backend (API)

Crie um serviço web a partir do repositório, com:

| Configuração            | Valor                         |
|-------------------------|-------------------------------|
| Diretório raiz          | `backend`                     |
| Ambiente / build        | Docker (usa `backend/Dockerfile`) |
| Health check            | `/saude`                      |

Variáveis de ambiente:

| Variável         | Valor                                                                 |
|------------------|-----------------------------------------------------------------------|
| `NODE_ENV`       | `production`                                                          |
| `DATABASE_URL`   | URL do passo 1                                                        |
| `DB_SSL`         | `true` se o provedor exigir SSL                                       |
| `DB_SSL_REJECT_UNAUTHORIZED` | `false` quando o provedor usa certificado autoassinado (caso do PostgreSQL do Render) |
| `JWT_SECRET`     | mínimo 32 caracteres: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CORS_ORIGIN`    | URL do frontend, sem barra no final (preencher após o passo 3)        |
| `RUN_MIGRATIONS` | `true` (aplica as migrations a cada início)                           |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | dados do provedor de e-mail (veja a seção E-mail abaixo) |
| `SEED_SENHA_PADRAO` | senha dos usuários de demonstração (use uma sua)                   |

O provedor define a variável `PORT` automaticamente; a API já a utiliza.

Em `NODE_ENV=production` a API **não inicia** sem `JWT_SECRET` (32+ caracteres), `CORS_ORIGIN` e credenciais de banco. O erro aparece no log.

### E-mail (recuperação de senha)

Serviços web gratuitos do Render **bloqueiam as portas SMTP 25, 465 e 587**. Um SMTP comum nessas portas (por exemplo o Gmail) dá timeout. Use um provedor que aceite outra porta, como o Resend na porta 2587:

| Variável    | Valor                                   |
|-------------|-----------------------------------------|
| `SMTP_HOST` | `smtp.resend.com`                       |
| `SMTP_PORT` | `2587`                                  |
| `SMTP_USER` | `resend` (texto literal)                |
| `SMTP_PASS` | chave de API do Resend (começa com `re_`) |
| `SMTP_FROM` | `FilaJusta <onboarding@resend.dev>`     |

Sem domínio verificado, o remetente `onboarding@resend.dev` só entrega para o e-mail da conta Resend. Para a demonstração, cadastre esse e-mail em um usuário do sistema. Para enviar a qualquer endereço, verifique um domínio no Resend.

O código de recuperação tem 6 dígitos, vale 10 minutos e é bloqueado após 5 tentativas erradas.

### Popular o banco (uma vez)

Do seu computador, na pasta `backend`, apontando para o banco publicado:

```bash
DATABASE_URL="postgres://..." DB_SSL=true SEED_SENHA_PADRAO="sua-senha" npm run db:migrate
DATABASE_URL="postgres://..." DB_SSL=true SEED_SENHA_PADRAO="sua-senha" npm run db:seed
```

No PowerShell: `$env:DATABASE_URL="postgres://..."; $env:DB_SSL="true"; npm run db:seed`.

Rode o `db:seed` **uma única vez**: repetir causa erro de chave duplicada. Para renovar só a fila de hoje (por exemplo na manhã da apresentação): `npm run db:seed:demo`.

## 3. Frontend (Vercel)

1. Importe o repositório e defina **Root Directory = `frontend`**. No plano gratuito da Vercel (Hobby) não é possível importar repositórios de organizações do GitHub: faça um **fork** para a sua conta e importe o fork. Para levar mudanças novas ao fork, use **Sync fork** no GitHub.
2. Variável de ambiente: `NEXT_PUBLIC_API_URL` = URL pública do backend, sem barra no final.
3. Faça o deploy e copie a URL gerada.
4. Volte ao backend, defina `CORS_ORIGIN` com essa URL e faça novo deploy.

`NEXT_PUBLIC_*` é embutida no build: se mudar o valor, é preciso um novo deploy do frontend.

## 4. Conferência

- [ ] `GET <URL da API>/saude` responde `FilaJusta API online`
- [ ] A URL do frontend abre e a lista de especialidades carrega
- [ ] Login em `/admin/login` e em `/recepcao` com os usuários de demonstração
- [ ] A recepção mostra a fila de hoje (8 pacientes com prioridades diferentes)
- [ ] Em `/admin/esqueci-senha`, o código chega por e-mail e a senha é redefinida

## Problemas comuns

| Sintoma | Causa provável |
|---------|----------------|
| Telas carregam, mas listas vazias e erro de CORS no console | `CORS_ORIGIN` diferente da URL do frontend (barra no final, `http` em vez de `https`) |
| Frontend chama a própria URL em vez da API | `NEXT_PUBLIC_API_URL` ausente no build; defina e refaça o deploy |
| API não inicia em produção | Falta `JWT_SECRET` (32+), `CORS_ORIGIN` ou dados do banco; veja o log |
| Erro de SSL ao conectar no banco | Defina `DB_SSL=true` |
| `self-signed certificate` no log da API | Defina `DB_SSL_REJECT_UNAUTHORIZED=false` |
| `column ... does not exist` | Migrations não aplicadas: `RUN_MIGRATIONS=true` ou `npm run db:migrate` |
| Recuperação de senha responde "Nao foi possivel enviar o e-mail" | `SMTP_*` incorretos ou porta bloqueada; o motivo exato está no log da API (timeout = porta bloqueada) |
| Código de recuperação não chega | Com `onboarding@resend.dev`, só chega ao e-mail da conta Resend; confira também o spam |
| Primeira requisição lenta | Alguns planos gratuitos hibernam o serviço quando ocioso |
