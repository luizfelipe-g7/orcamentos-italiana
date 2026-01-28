# 🎯 Visão Geral do Projeto - Dashboard Orçamento v2.0

## O Que É Este Projeto?

Sistema interno de gestão de orçamentos e processos de cidadania italiana e portuguesa para uma assessoria de imigração.

**Usuários:** ~10 operadores internos da empresa

---

## 🎯 Objetivo Principal

Reconstruir do zero o sistema atual (que tem problemas de segurança e manutenção) com uma arquitetura moderna, segura e fácil de manter.

---

## 📋 O Que o Sistema Faz?

### Módulos Principais

```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD ORÇAMENTO                       │
├─────────────────┬─────────────────┬─────────────────────────┤
│   ORÇAMENTOS    │    MEMBROS      │      DOCUMENTOS         │
│                 │                 │                         │
│ • Criar         │ • Cadastrar     │ • Upload S3             │
│ • Listar        │ • Vincular      │ • Controle de status    │
│ • Editar        │ • Editar dados  │ • Assinatura digital    │
│ • Converter     │ • Gerir família │ • Organização           │
├─────────────────┼─────────────────┼─────────────────────────┤
│   FINANCEIRO    │   CIDADANIA PT  │     INTEGRAÇÕES         │
│                 │                 │                         │
│ • Parcelas      │ • Processos     │ • Bitrix24 (CRM)        │
│ • Pagamentos    │ • Documentos    │ • Autentique (assinat.) │
│ • Honorários    │ • Status        │ • AWS S3 (arquivos)     │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### Fluxo Básico de Uso

```
1. Operador faz LOGIN
         ↓
2. Cria/consulta ORÇAMENTO (italiano ou português)
         ↓
3. Cadastra MEMBROS da família
         ↓
4. Gerencia DOCUMENTOS (upload, status, assinatura)
         ↓
5. Controla FINANCEIRO (parcelas, pagamentos)
         ↓
6. Acompanha PROCESSO de cidadania
```

---

## 🛠️ Stack Tecnológica Escolhida

### Backend

| Tecnologia | Para quê |
|------------|----------|
| **Node.js 20+** | Runtime JavaScript |
| **TypeScript** | Tipagem estática |
| **Express.js** | Framework web |
| **Knex.js** | Query builder (SQL seguro) |
| **Zod** | Validação de dados |
| **JWT** | Autenticação |
| **Pino** | Logs estruturados |
| **Jest** | Testes |

### Frontend

| Tecnologia | Para quê |
|------------|----------|
| **React 18+** | Biblioteca UI |
| **Vite** | Build tool (rápido) |
| **TypeScript** | Tipagem estática |
| **TailwindCSS** | Estilização |
| **React Query** | Cache e fetch de dados |
| **React Router** | Navegação SPA |
| **React Hook Form** | Formulários |
| **Zod** | Validação (mesmo do backend) |

### Infraestrutura

| Serviço | Para quê |
|---------|----------|
| **MySQL** | Banco de dados (já existente) |
| **AWS S3** | Armazenamento de documentos |
| **Bitrix24** | CRM (integração) |
| **Autentique** | Assinatura digital (integração) |

---

## 📁 Estrutura de Pastas para Começar

### Backend

```
backend/
├── src/
│   ├── config/           # Configurações (env, database)
│   ├── controllers/      # Recebe HTTP, retorna resposta
│   ├── services/         # Lógica de negócio
│   ├── repositories/     # Acesso ao banco de dados
│   ├── middlewares/      # Auth, validação, erros
│   ├── schemas/          # Schemas Zod (validação)
│   ├── routes/           # Definição de rotas
│   ├── utils/            # Funções auxiliares
│   ├── types/            # Tipos TypeScript
│   └── app.ts            # Setup do Express
├── tests/                # Testes automatizados
├── package.json
├── tsconfig.json
├── knexfile.ts           # Config do Knex
└── .env                  # Variáveis de ambiente
```

### Frontend

```
frontend/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── ui/           # Botões, inputs, modals
│   │   └── layout/       # Header, sidebar, etc.
│   ├── pages/            # Páginas da aplicação
│   ├── hooks/            # Custom hooks
│   ├── services/         # Chamadas à API
│   ├── schemas/          # Schemas Zod
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Funções auxiliares
│   ├── styles/           # CSS global
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔐 Autenticação

### Como Vai Funcionar

```
┌─────────┐        ┌─────────┐        ┌─────────┐
│ Frontend│        │ Backend │        │  MySQL  │
└────┬────┘        └────┬────┘        └────┬────┘
     │                  │                  │
     │ POST /login      │                  │
     │ {email, senha}   │                  │
     │─────────────────►│                  │
     │                  │ Busca operador   │
     │                  │─────────────────►│
     │                  │◄─────────────────│
     │                  │                  │
     │                  │ Valida senha     │
     │                  │ (bcrypt)         │
     │                  │                  │
     │   JWT Token      │                  │
     │◄─────────────────│                  │
     │                  │                  │
     │ Requisições      │                  │
     │ + Authorization  │                  │
     │ Bearer {token}   │                  │
     │─────────────────►│                  │
     │                  │ Valida JWT       │
     │                  │ Processa         │
     │◄─────────────────│                  │
```

### Payload do JWT

```typescript
interface JwtPayload {
  id: number;
  email: string;
  nome: string;
  role: 'admin' | 'operador';
  iat: number;  // issued at
  exp: number;  // expiration
}
```

---

## 📊 Entidades Principais do Banco

### Diagrama Simplificado

```
┌─────────────────┐       ┌─────────────────┐
│   OPERADORES    │       │   ORCAMENTOS    │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ nome            │       │ tipo (IT/PT)    │
│ email           │       │ status          │
│ senha (hash)    │       │ operador_id  ───┼──► FK
│ ativo           │       │ created_at      │
└─────────────────┘       └────────┬────────┘
                                   │
                                   │ 1:N
                                   ▼
┌─────────────────┐       ┌─────────────────┐
│   DOCUMENTOS    │       │    MEMBROS      │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ membro_id    ───┼──►    │ orcamento_id ───┼──► FK
│ tipo            │       │ nome            │
│ url_s3          │       │ cpf             │
│ status          │       │ email           │
│ created_at      │       │ parentesco      │
└─────────────────┘       └─────────────────┘
```

---

## 🚀 Primeiros Passos para Começar

### Semana 1: Setup Inicial

```bash
# 1. Criar pasta do projeto
mkdir cidadania-dashboard-v2
cd cidadania-dashboard-v2

# 2. Criar backend
mkdir backend && cd backend
npm init -y
npm install typescript ts-node @types/node -D
npx tsc --init

# 3. Instalar dependências principais
npm install express cors helmet dotenv
npm install knex mysql2
npm install zod jsonwebtoken bcrypt pino
npm install @types/express @types/cors @types/jsonwebtoken @types/bcrypt -D

# 4. Voltar e criar frontend
cd ..
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install tailwindcss postcss autoprefixer -D
npx tailwindcss init -p
npm install @tanstack/react-query react-router-dom react-hook-form zod @hookform/resolvers
```

### Ordem de Desenvolvimento Sugerida

```
1. Backend: Setup + Config + Conexão DB
   ↓
2. Backend: Auth (login + JWT middleware)
   ↓
3. Frontend: Setup + Auth (login page)
   ↓
4. Backend: CRUD Orçamentos
   ↓
5. Frontend: Tela de Orçamentos
   ↓
6. Backend: CRUD Membros
   ↓
7. Frontend: Tela de Membros
   ↓
8. Repetir para outros módulos...
```

---

## 📝 Padrão de Código

### Exemplo de Fluxo Completo (Criar Orçamento)

**1. Schema de Validação (`schemas/orcamento.schema.ts`)**
```typescript
import { z } from 'zod';

export const createOrcamentoSchema = z.object({
  tipo: z.enum(['italiano', 'portugues']),
  observacoes: z.string().optional(),
});

export type CreateOrcamentoInput = z.infer<typeof createOrcamentoSchema>;
```

**2. Repository (`repositories/orcamento.repository.ts`)**
```typescript
import { db } from '../config/database';

export const orcamentoRepository = {
  async create(data: CreateOrcamentoInput, operadorId: number) {
    const [id] = await db('orcamentos').insert({
      ...data,
      operador_id: operadorId,
      status: 'aberto',
    });
    return this.findById(id);
  },

  async findById(id: number) {
    return db('orcamentos').where({ id }).first();
  },
};
```

**3. Service (`services/orcamento.service.ts`)**
```typescript
import { orcamentoRepository } from '../repositories/orcamento.repository';

export const orcamentoService = {
  async criar(data: CreateOrcamentoInput, operadorId: number) {
    // Regras de negócio aqui
    return orcamentoRepository.create(data, operadorId);
  },
};
```

**4. Controller (`controllers/orcamento.controller.ts`)**
```typescript
import { Request, Response } from 'express';
import { orcamentoService } from '../services/orcamento.service';
import { createOrcamentoSchema } from '../schemas/orcamento.schema';

export const orcamentoController = {
  async criar(req: Request, res: Response) {
    const data = createOrcamentoSchema.parse(req.body);
    const orcamento = await orcamentoService.criar(data, req.user.id);
    res.status(201).json(orcamento);
  },
};
```

**5. Rota (`routes/orcamento.routes.ts`)**
```typescript
import { Router } from 'express';
import { orcamentoController } from '../controllers/orcamento.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, orcamentoController.criar);

export default router;
```

---

## ✅ Checklist de Início

### Backend
- [ ] Setup TypeScript
- [ ] Configurar ESLint + Prettier
- [ ] Conectar ao MySQL existente
- [ ] Criar middleware de autenticação JWT
- [ ] Criar middleware de tratamento de erros
- [ ] Criar middleware de validação (Zod)
- [ ] Configurar Pino para logs
- [ ] Criar estrutura de pastas

### Frontend
- [ ] Setup Vite + React + TypeScript
- [ ] Configurar TailwindCSS
- [ ] Configurar React Query
- [ ] Configurar React Router
- [ ] Criar layout base (sidebar, header)
- [ ] Criar página de login
- [ ] Criar contexto de autenticação
- [ ] Configurar Axios/fetch com interceptors

---

## 🔗 Links Úteis

- [Knex.js Docs](https://knexjs.org/)
- [Zod Docs](https://zod.dev/)
- [React Query Docs](https://tanstack.com/query/latest)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Pino Docs](https://getpino.io/)

---

## 📄 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `PROPOSTA_NOVA_ARQUITETURA.md` | Arquitetura detalhada + decisões técnicas |
| `GUIA_DESENVOLVIMENTO_E_BACKLOG.md` | Backlog e sprints |
| `DOCUMENTACAO_TECNICA_COMPLETA.md` | Documentação do sistema atual |
| `API_DOCUMENTATION.md` | Endpoints da API atual |

---

**Pronto para começar!** 🚀

Qualquer dúvida, consulte os documentos relacionados ou o código do sistema atual para referência.
