# 📐 Proposta de Nova Arquitetura - Dashboard Orçamento v2.0

**Aplicação Interna | Equipe de até 10 usuários**

| Informação | Detalhe |
|------------|---------|
| **Data** | 22/01/2026 |
| **Versão** | 1.0 |
| **Tipo** | Aplicação Interna |
| **Usuários** | ~10 operadores |

---

## 📋 Resumo

Este documento apresenta a proposta de **reconstrução completa** do sistema Dashboard Orçamento, incluindo **backend** e **frontend** novos, corrigindo os problemas técnicos identificados na versão atual.

**Escopo:**
- ✅ Backend novo (Node.js + TypeScript)
- ✅ Frontend novo (React + Vite)
- ✅ Mesmo banco de dados MySQL (migração de schema se necessário)
- ✅ Mesmas integrações (S3, Bitrix24, Autentique)

---

## 1. Problemas da Arquitetura Atual

### 1.1 Resumo dos Problemas

| # | Problema | Impacto |
|---|----------|---------|
| 1 | SQL Injection (queries sem sanitização) | Segurança crítica |
| 2 | Ausência de transações | Dados inconsistentes |
| 3 | Autenticação de operadores insegura | Acesso não autorizado |
| 4 | Tratamento de erros inconsistente | Difícil debugar |
| 5 | Falta de validação de entrada | Erros inesperados |
| 6 | Logs desestruturados | Difícil monitorar |
| 7 | Código duplicado | Manutenção difícil |
| 8 | Falta de testes | Regressões frequentes |

### 1.2 Arquitetura Atual (Problemática)

```
Frontend (React) → Express Server → executeQuery(SQL raw) → Lambda → MySQL
                                          ↓
                                    VULNERÁVEL
```

---

## 2. Nova Arquitetura Proposta

### 2.1 Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         NOVA ARQUITETURA                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌─────────────────────────────────────────────┐
│                 │         │              BACKEND (Node.js)              │
│    FRONTEND     │         │                                             │
│   React + Vite  │  HTTP   │  ┌─────────────────────────────────────┐   │
│                 │ ◄─────► │  │           Express Server            │   │
│  • TypeScript   │   JWT   │  │  • Rate Limit • CORS • Helmet       │   │
│  • TailwindCSS  │         │  └──────────────────┬──────────────────┘   │
│  • React Query  │         │                     │                       │
│  • React Router │         │  ┌──────────────────▼──────────────────┐   │
│                 │         │  │           Middlewares               │   │
└─────────────────┘         │  │  • Auth JWT • Validação • Erros     │   │
                            │  └──────────────────┬──────────────────┘   │
                            │                     │                       │
                            │  ┌──────────────────▼──────────────────┐   │
                            │  │            Controllers              │   │
                            │  │  Orcamento • Membro • Documento     │   │
                            │  └──────────────────┬──────────────────┘   │
                            │                     │                       │
                            │  ┌──────────────────▼──────────────────┐   │
                            │  │             Services                │   │
                            │  │  Lógica de negócio + Validações     │   │
                            │  └──────────────────┬──────────────────┘   │
                            │                     │                       │
                            │  ┌──────────────────▼──────────────────┐   │
                            │  │           Repositories              │   │
                            │  │      Knex.js (Query Builder)        │   │
                            │  └──────────────────┬──────────────────┘   │
                            │                     │                       │
                            └─────────────────────┼───────────────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────┐
                    │                             │                         │
                    ▼                             ▼                         ▼
             ┌───────────┐                 ┌───────────┐             ┌───────────┐
             │   MySQL   │                 │  AWS S3   │             │  Bitrix   │
             │    RDS    │                 │   Docs    │             │ Autentique│
             └───────────┘                 └───────────┘             └───────────┘
```

### 2.2 Stack Tecnológica

#### Backend

| Tecnologia | Propósito | Por que usar |
|------------|-----------|--------------|
| **Node.js 20+** | Runtime | LTS, performance |
| **TypeScript** | Linguagem | Type safety, menos bugs |
| **Express.js** | Framework | Simples, flexível |
| **Knex.js** | Query Builder | SQL seguro, migrations |
| **Zod** | Validação | Schema-first, inferência de tipos |
| **JWT** | Autenticação | Stateless, seguro |
| **Pino** | Logging | Estruturado, leve |
| **Jest** | Testes | Cobertura completa |

#### Frontend

| Tecnologia | Propósito | Por que usar |
|------------|-----------|--------------|
| **React 18+** | Framework UI | Produtividade, ecossistema |
| **Vite** | Build tool | Rápido, HMR |
| **TypeScript** | Linguagem | Consistência com backend |
| **TailwindCSS** | Estilos | Produtividade, responsivo |
| **React Query** | Data fetching | Cache, revalidação |
| **React Router** | Rotas | SPA navigation |
| **React Hook Form** | Formulários | Performance, validação |
| **Zod** | Validação | Mesmo do backend |

---

## 3. Decisões Técnicas e Justificativas

Esta seção documenta as decisões técnicas tomadas e o raciocínio por trás de cada escolha.

### 3.1 Por que TypeScript ao invés de JavaScript?

**Decisão:** Usar TypeScript em todo o projeto (backend e frontend).

**Justificativa:**
- O sistema atual em JavaScript tem bugs frequentes por falta de tipagem
- TypeScript detecta erros em tempo de desenvolvimento, não em produção
- Autocompletar e refatoração muito melhores no IDE
- Documentação implícita através dos tipos
- A equipe já tem familiaridade com TypeScript

**Problema que resolve:** Bugs causados por tipos incorretos, dificuldade de manutenção.

---

### 3.2 Por que Knex.js ao invés de Prisma ou TypeORM?

**Decisão:** Usar Knex.js como Query Builder.

**Alternativas consideradas:**
- **Prisma:** ORM moderno, mas adiciona camada de abstração desnecessária
- **TypeORM:** Mais complexo, curva de aprendizado maior
- **SQL Raw:** Vulnerável a SQL Injection (problema atual)

**Justificativa:**
- A equipe já conhece SQL, Knex mantém essa familiaridade
- Query Builder gera queries parametrizadas automaticamente (previne SQL Injection)
- Sistema de migrations incluso para versionamento do banco
- Suporte nativo a transações
- Menos overhead que um ORM completo
- Flexibilidade para queries complexas quando necessário

**Problema que resolve:** SQL Injection, falta de migrations, ausência de transações.

---

### 3.3 Por que Zod ao invés de Joi ou Yup?

**Decisão:** Usar Zod para validação de dados.

**Alternativas consideradas:**
- **Joi:** Popular, mas não tem inferência de tipos TypeScript
- **Yup:** Similar ao Joi, mesma limitação
- **class-validator:** Requer decorators, mais verboso

**Justificativa:**
- Inferência automática de tipos TypeScript (`z.infer<typeof schema>`)
- Schema de validação = Tipo TypeScript (DRY - não duplica código)
- API simples e intuitiva
- Excelente performance
- Funciona no backend e frontend (mesmo schema nos dois)
- Mensagens de erro customizáveis

**Problema que resolve:** Falta de validação, código duplicado entre tipos e validações.

---

### 3.4 Por que JWT ao invés de Sessions?

**Decisão:** Usar JWT (JSON Web Tokens) para autenticação.

**Alternativas consideradas:**
- **Sessions com cookies:** Requer storage de sessão no servidor
- **OAuth2:** Complexo demais para aplicação interna

**Justificativa:**
- Stateless: não precisa armazenar sessão no servidor
- Escala facilmente (não depende de estado compartilhado)
- Contém informações do usuário (id, role) no próprio token
- Fácil de validar em cada requisição
- Padrão da indústria para APIs REST
- Já usado parcialmente no sistema atual (clientes)

**Problema que resolve:** Autenticação insegura via headers forjáveis.

---

### 3.5 Por que React Query ao invés de Redux ou Context API?

**Decisão:** Usar React Query (TanStack Query) para gerenciamento de dados do servidor.

**Alternativas consideradas:**
- **Redux + RTK Query:** Mais complexo, boilerplate
- **Context API pura:** Sem cache, sem revalidação
- **SWR:** Similar, mas React Query tem mais features

**Justificativa:**
- Cache automático de dados
- Revalidação automática (stale-while-revalidate)
- Mutations com invalidação de cache
- Loading states e error handling automáticos
- Evita prop drilling excessivo
- Reduz código boilerplate significativamente
- DevTools excelente para debug

**Problema que resolve:** Código repetitivo de fetch, falta de cache, estados de loading manuais.

---

### 3.6 Por que Vite ao invés de Create React App?

**Decisão:** Usar Vite como build tool do frontend.

**Alternativas consideradas:**
- **Create React App (CRA):** Lento, abandonado pela equipe React
- **Next.js:** SSR desnecessário para aplicação interna
- **Webpack manual:** Configuração complexa

**Justificativa:**
- Build 10-100x mais rápido que CRA
- Hot Module Replacement (HMR) instantâneo
- Configuração mínima necessária
- Suporte nativo a TypeScript
- Suporte nativo a variáveis de ambiente
- Menor bundle size em produção
- Comunidade ativa e em crescimento

**Problema que resolve:** Build lento, desenvolvimento travado esperando compilação.

---

### 3.7 Por que TailwindCSS ao invés de CSS Modules ou Styled Components?

**Decisão:** Usar TailwindCSS para estilização.

**Alternativas consideradas:**
- **CSS Modules:** Organizado, mas produtividade menor
- **Styled Components:** Runtime overhead, CSS-in-JS
- **Material UI:** Componentes prontos, mas difícil customizar

**Justificativa:**
- Produtividade alta: estilos inline sem sair do HTML/JSX
- Consistência: design system via configuração
- Responsivo fácil: classes como `md:`, `lg:`
- Sem runtime: CSS gerado em build time
- Bundle pequeno: purge de classes não usadas
- Documentação excelente
- Componentes de UI como shadcn/ui disponíveis

**Problema que resolve:** Inconsistência visual, produtividade baixa em CSS.

---

### 3.8 Por que Pino ao invés de Winston ou console.log?

**Decisão:** Usar Pino para logging estruturado.

**Alternativas consideradas:**
- **console.log:** Desestruturado, difícil filtrar
- **Winston:** Popular, mas mais lento
- **Bunyan:** Similar ao Pino, menos mantido

**Justificativa:**
- 5x mais rápido que Winston
- Logs em JSON estruturado (fácil de parsear)
- Baixo overhead em produção
- Níveis de log configuráveis por ambiente
- Contexto por requisição (request ID, user ID)
- Integração fácil com ferramentas de monitoramento

**Problema que resolve:** Logs desestruturados, difícil debugar em produção.

---

### 3.9 Por que manter MySQL ao invés de migrar para PostgreSQL?

**Decisão:** Manter MySQL como banco de dados.

**Alternativas consideradas:**
- **PostgreSQL:** Mais features, mas requer migração
- **MongoDB:** NoSQL, mudança radical

**Justificativa:**
- Dados já existem no MySQL
- Migração de banco é arriscada e demorada
- MySQL atende às necessidades da aplicação
- Equipe já conhece MySQL
- Integrações existentes (Bitrix) usam MySQL
- Knex.js funciona perfeitamente com MySQL

**Problema que evita:** Risco de perda de dados, tempo de migração, curva de aprendizado.

---

### 3.10 Por que arquitetura em camadas (Controller → Service → Repository)?

**Decisão:** Separar código em camadas bem definidas.

**Alternativas consideradas:**
- **Tudo junto (atual):** Difícil manutenção
- **Clean Architecture completa:** Muito overhead para aplicação pequena
- **Microserviços:** Complexidade desnecessária

**Justificativa:**
- **Controller:** Só lida com HTTP (request/response)
- **Service:** Lógica de negócio isolada, testável
- **Repository:** Acesso a dados isolado, fácil trocar implementação
- Cada camada tem responsabilidade única
- Facilita testes unitários
- Código organizado e previsível
- Padrão conhecido pela maioria dos desenvolvedores

**Problema que resolve:** Código espaguete, difícil testar, difícil manter.

---

### 3.11 Por que não usar microserviços?

**Decisão:** Manter como monolito bem estruturado.

**Justificativa:**
- Aplicação interna com ~10 usuários
- Complexidade de microserviços não se justifica
- Um único deploy é mais simples de gerenciar
- Comunicação entre módulos é local (mais rápido)
- Equipe pequena, não precisa dividir por serviços
- Monolito modular permite extrair serviços no futuro se necessário

**Problema que evita:** Complexidade desnecessária, overhead de infraestrutura.

---

### 3.12 Resumo das Decisões

| Decisão | Escolha | Principal Motivo |
|---------|---------|------------------|
| Linguagem | TypeScript | Type safety, menos bugs |
| Query Builder | Knex.js | SQL seguro, familiaridade |
| Validação | Zod | Inferência de tipos |
| Autenticação | JWT | Stateless, padrão |
| Data Fetching | React Query | Cache, produtividade |
| Build Tool | Vite | Performance |
| CSS | TailwindCSS | Produtividade |
| Logging | Pino | Estruturado, rápido |
| Banco | MySQL | Já existente |
| Arquitetura | Camadas | Organização, testes |

---

## 4. Estrutura do Backend

### 3.1 Organização de Pastas

```
backend/
├── src/
│   ├── controllers/           # Recebem requisições HTTP
│   │   ├── authController.ts
│   │   ├── orcamentoController.ts
│   │   ├── membroController.ts
│   │   ├── documentoController.ts
│   │   ├── financeiroController.ts
│   │   └── index.ts
│   │
│   ├── services/              # Lógica de negócio
│   │   ├── authService.ts
│   │   ├── orcamentoService.ts
│   │   ├── membroService.ts
│   │   ├── documentoService.ts
│   │   ├── financeiroService.ts
│   │   ├── bitrixService.ts
│   │   ├── autentiqueService.ts
│   │   └── index.ts
│   │
│   ├── repositories/          # Acesso ao banco (Knex)
│   │   ├── orcamentoRepository.ts
│   │   ├── membroRepository.ts
│   │   ├── documentoRepository.ts
│   │   └── index.ts
│   │
│   ├── middlewares/           # Middlewares Express
│   │   ├── auth.ts            # Validação JWT
│   │   ├── validate.ts        # Validação de schemas
│   │   ├── errorHandler.ts    # Tratamento de erros
│   │   └── index.ts
│   │
│   ├── schemas/               # Schemas Zod (validação)
│   │   ├── orcamentoSchema.ts
│   │   ├── membroSchema.ts
│   │   ├── documentoSchema.ts
│   │   └── index.ts
│   │
│   ├── routes/                # Definição de rotas
│   │   ├── authRoutes.ts
│   │   ├── orcamentoRoutes.ts
│   │   ├── membroRoutes.ts
│   │   ├── documentoRoutes.ts
│   │   └── index.ts
│   │
│   ├── config/                # Configurações
│   │   ├── env.ts             # Variáveis de ambiente
│   │   ├── database.ts        # Conexão Knex
│   │   └── index.ts
│   │
│   ├── utils/                 # Utilitários
│   │   ├── logger.ts          # Pino logger
│   │   ├── errors.ts          # Classes de erro
│   │   └── index.ts
│   │
│   ├── types/                 # Tipos TypeScript
│   │   └── index.ts
│   │
│   ├── app.ts                 # Setup Express
│   └── server.ts              # Entry point
│
├── database/
│   ├── migrations/            # Migrations Knex
│   └── seeds/                 # Seeds para dev
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env.example
├── package.json
├── tsconfig.json
├── knexfile.ts
└── jest.config.ts
```

### 3.2 Fluxo de uma Requisição

```
1. Request HTTP
      ↓
2. Express recebe
      ↓
3. Middleware Auth (valida JWT)
      ↓
4. Middleware Validate (valida body com Zod)
      ↓
5. Controller (extrai dados, chama service)
      ↓
6. Service (lógica de negócio)
      ↓
7. Repository (query com Knex)
      ↓
8. Response JSON
```

### 3.3 Exemplos de Código

#### Configuração do Banco (Knex)

```typescript
// src/config/database.ts
import knex from 'knex';
import { env } from './env';

export const db = knex({
  client: 'mysql2',
  connection: {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
  pool: { min: 2, max: 10 }
});
```

#### Repository (Query Segura)

```typescript
// src/repositories/orcamentoRepository.ts
import { db } from '../config/database';

export const orcamentoRepository = {
  async findById(id: number) {
    return db('orcamento_familia')
      .where({ id })
      .first();
  },

  async findByOperador(operadorId: number) {
    return db('orcamento_familia')
      .where({ operador_id: operadorId })
      .orderBy('created_at', 'desc');
  },

  async create(data: CreateOrcamentoDTO) {
    const [id] = await db('orcamento_familia')
      .insert(data);
    return id;
  },

  async update(id: number, data: UpdateOrcamentoDTO) {
    return db('orcamento_familia')
      .where({ id })
      .update(data);
  }
};
```

#### Service com Transação

```typescript
// src/services/financeiroService.ts
import { db } from '../config/database';

export const financeiroService = {
  async salvarDadosFinanceiros(orcamentoId: number, dados: FinanceiroDTO) {
    // Transação: tudo ou nada
    await db.transaction(async (trx) => {
      // Limpa dados antigos
      await trx('orcamento_valores_parcelas')
        .whereIn('requerente_pagante_id', function() {
          this.select('id')
            .from('orcamento_requerentes_pagantes')
            .where({ orcamento_id: orcamentoId });
        })
        .del();

      await trx('orcamento_requerentes_pagantes')
        .where({ orcamento_id: orcamentoId })
        .del();

      // Insere novos dados
      for (const pagante of dados.pagantes) {
        const [paganteId] = await trx('orcamento_requerentes_pagantes')
          .insert({ orcamento_id: orcamentoId, ...pagante });

        if (pagante.parcelas) {
          await trx('orcamento_valores_parcelas')
            .insert(pagante.parcelas.map(p => ({
              requerente_pagante_id: paganteId,
              ...p
            })));
        }
      }
    });
  }
};
```

#### Schema de Validação (Zod)

```typescript
// src/schemas/orcamentoSchema.ts
import { z } from 'zod';

export const createOrcamentoSchema = z.object({
  nome_familia: z.string().min(2).max(100),
  cidadania: z.enum(['PT', 'IT']),
  valor_total: z.number().positive().optional(),
  num_parcelas: z.number().int().min(1).max(24).optional(),
});

export const updateOrcamentoSchema = createOrcamentoSchema.partial();

export type CreateOrcamentoDTO = z.infer<typeof createOrcamentoSchema>;
export type UpdateOrcamentoDTO = z.infer<typeof updateOrcamentoSchema>;
```

#### Middleware de Autenticação

```typescript
// src/middlewares/auth.ts
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError('Token não fornecido');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    throw new UnauthorizedError('Token inválido');
  }
};

// Middleware para verificar role
export const requireRole = (...roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('Acesso negado');
    }
    next();
  };
};
```

#### Controller

```typescript
// src/controllers/orcamentoController.ts
import { orcamentoService } from '../services/orcamentoService';

export const orcamentoController = {
  async list(req, res) {
    const { user } = req;
    
    const orcamentos = user.role === 'ADM'
      ? await orcamentoService.findAll()
      : await orcamentoService.findByOperador(user.id);

    res.json({ success: true, data: orcamentos });
  },

  async getById(req, res) {
    const { id } = req.params;
    const orcamento = await orcamentoService.findById(Number(id));

    if (!orcamento) {
      return res.status(404).json({ 
        success: false, 
        error: 'Orçamento não encontrado' 
      });
    }

    res.json({ success: true, data: orcamento });
  },

  async create(req, res) {
    const data = req.body; // Já validado pelo middleware
    const id = await orcamentoService.create(data);
    
    res.status(201).json({ success: true, data: { id } });
  }
};
```

#### Rotas

```typescript
// src/routes/orcamentoRoutes.ts
import { Router } from 'express';
import { orcamentoController } from '../controllers/orcamentoController';
import { authMiddleware, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createOrcamentoSchema, updateOrcamentoSchema } from '../schemas/orcamentoSchema';

const router = Router();

router.use(authMiddleware); // Todas as rotas precisam de auth

router.get('/', orcamentoController.list);
router.get('/:id', orcamentoController.getById);
router.post('/', validate(createOrcamentoSchema), orcamentoController.create);
router.put('/:id', validate(updateOrcamentoSchema), orcamentoController.update);
router.delete('/:id', requireRole('ADM'), orcamentoController.delete);

export default router;
```

#### Error Handler Global

```typescript
// src/middlewares/errorHandler.ts
import { logger } from '../utils/logger';

export const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: err.message
    });
  }

  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
};
```

---

## 5. Estrutura do Frontend

### 5.1 Organização de Pastas

```
frontend/
├── src/
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ui/                # Componentes base (Button, Input, etc)
│   │   ├── forms/             # Componentes de formulário
│   │   ├── layout/            # Header, Sidebar, Layout
│   │   └── tables/            # Tabelas e listagens
│   │
│   ├── pages/                 # Páginas da aplicação
│   │   ├── auth/
│   │   │   └── Login.tsx
│   │   ├── orcamentos/
│   │   │   ├── OrcamentoList.tsx
│   │   │   ├── OrcamentoForm.tsx
│   │   │   └── OrcamentoDetail.tsx
│   │   ├── membros/
│   │   ├── documentos/
│   │   └── financeiro/
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useOrcamentos.ts
│   │   └── useMembros.ts
│   │
│   ├── services/              # Chamadas API
│   │   ├── api.ts             # Axios instance
│   │   ├── authService.ts
│   │   ├── orcamentoService.ts
│   │   └── membroService.ts
│   │
│   ├── contexts/              # React Contexts
│   │   └── AuthContext.tsx
│   │
│   ├── schemas/               # Schemas Zod (validação)
│   │   ├── orcamentoSchema.ts
│   │   └── membroSchema.ts
│   │
│   ├── types/                 # Tipos TypeScript
│   │   └── index.ts
│   │
│   ├── utils/                 # Utilitários
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   ├── styles/                # Estilos globais
│   │   └── globals.css
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── routes.tsx
│
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### 5.2 Exemplos de Código

#### Configuração da API

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
});

// Adiciona token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Trata erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };
```

#### Context de Autenticação

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  nome: string;
  email: string;
  role: 'ADM' | 'VENDEDOR';
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

#### Hook com React Query

```typescript
// src/hooks/useOrcamentos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useOrcamentos() {
  return useQuery({
    queryKey: ['orcamentos'],
    queryFn: async () => {
      const { data } = await api.get('/orcamentos');
      return data.data;
    }
  });
}

export function useOrcamento(id: number) {
  return useQuery({
    queryKey: ['orcamento', id],
    queryFn: async () => {
      const { data } = await api.get(`/orcamentos/${id}`);
      return data.data;
    },
    enabled: !!id
  });
}

export function useCreateOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados) => {
      const { data } = await api.post('/orcamentos', dados);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
    }
  });
}
```

#### Página de Listagem

```tsx
// src/pages/orcamentos/OrcamentoList.tsx
import { Link } from 'react-router-dom';
import { useOrcamentos } from '../../hooks/useOrcamentos';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/tables/Table';

export function OrcamentoList() {
  const { data: orcamentos, isLoading, error } = useOrcamentos();

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar orçamentos</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <Link to="/orcamentos/novo">
          <Button>Novo Orçamento</Button>
        </Link>
      </div>

      <Table
        columns={[
          { header: 'ID', accessor: 'id' },
          { header: 'Família', accessor: 'nome_familia' },
          { header: 'Cidadania', accessor: 'cidadania' },
          { header: 'Valor', accessor: 'valor_total', 
            render: (val) => `R$ ${val?.toLocaleString()}` },
          { header: 'Ações', accessor: 'id',
            render: (id) => (
              <Link to={`/orcamentos/${id}`}>
                <Button size="sm">Ver</Button>
              </Link>
            )
          }
        ]}
        data={orcamentos}
      />
    </div>
  );
}
```

#### Formulário com React Hook Form + Zod

```tsx
// src/pages/orcamentos/OrcamentoForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useCreateOrcamento } from '../../hooks/useOrcamentos';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  nome_familia: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cidadania: z.enum(['PT', 'IT'], { message: 'Selecione a cidadania' }),
  valor_total: z.number().positive().optional(),
});

type FormData = z.infer<typeof schema>;

export function OrcamentoForm() {
  const navigate = useNavigate();
  const { mutate: create, isPending } = useCreateOrcamento();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  function onSubmit(data: FormData) {
    create(data, {
      onSuccess: () => navigate('/orcamentos')
    });
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Novo Orçamento</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome da Família"
          {...register('nome_familia')}
          error={errors.nome_familia?.message}
        />

        <Select
          label="Cidadania"
          {...register('cidadania')}
          error={errors.cidadania?.message}
          options={[
            { value: 'PT', label: 'Portuguesa' },
            { value: 'IT', label: 'Italiana' },
          ]}
        />

        <Input
          label="Valor Total"
          type="number"
          {...register('valor_total', { valueAsNumber: true })}
          error={errors.valor_total?.message}
        />

        <div className="flex gap-4">
          <Button type="submit" loading={isPending}>
            Salvar
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

## 6. Endpoints da API

### 6.1 Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login de operador |
| POST | `/auth/refresh` | Renovar token |
| GET | `/auth/me` | Dados do usuário logado |

### 6.2 Orçamentos

| Método | Endpoint | Descrição | Role |
|--------|----------|-----------|------|
| GET | `/orcamentos` | Listar orçamentos | ADM, VENDEDOR |
| GET | `/orcamentos/:id` | Buscar por ID | ADM, VENDEDOR |
| GET | `/orcamentos/:id/completo` | Orçamento + membros | ADM, VENDEDOR |
| POST | `/orcamentos` | Criar orçamento | ADM, VENDEDOR |
| PUT | `/orcamentos/:id` | Atualizar orçamento | ADM, VENDEDOR |
| DELETE | `/orcamentos/:id` | Excluir orçamento | ADM |

### 6.3 Membros

| Método | Endpoint | Descrição | Role |
|--------|----------|-----------|------|
| GET | `/membros/orcamento/:id` | Listar membros do orçamento | ADM, VENDEDOR |
| GET | `/membros/:id` | Buscar membro | ADM, VENDEDOR |
| POST | `/membros` | Criar membro | ADM, VENDEDOR |
| PUT | `/membros/:id` | Atualizar membro | ADM, VENDEDOR |
| DELETE | `/membros/:id` | Excluir membro | ADM |

### 6.4 Documentos

| Método | Endpoint | Descrição | Role |
|--------|----------|-----------|------|
| GET | `/documentos/orcamento/:id` | Listar docs do orçamento | ADM, VENDEDOR |
| POST | `/documentos/upload` | Upload de documento | ADM, VENDEDOR |
| GET | `/documentos/:id/url` | URL assinada para download | ADM, VENDEDOR |
| PUT | `/documentos/:id/status` | Atualizar status | ADM |

### 6.5 Financeiro

| Método | Endpoint | Descrição | Role |
|--------|----------|-----------|------|
| GET | `/orcamentos/:id/financeiro` | Dados financeiros | ADM, VENDEDOR |
| POST | `/orcamentos/:id/financeiro` | Salvar financeiro | ADM, VENDEDOR |

---

## 7. Comparativo: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **SQL** | String concatenation | Query Builder (Knex) |
| **Transações** | Ausentes | Knex transactions |
| **Autenticação** | Headers forjáveis | JWT seguro |
| **Validação** | Manual/inexistente | Zod schemas |
| **Erros** | Inconsistente | Handler global |
| **Logs** | console.log | Pino estruturado |
| **Tipos** | JavaScript | TypeScript |
| **Testes** | Nenhum | Jest |
| **Frontend** | CRA + CSS modules | Vite + Tailwind |
| **Data Fetching** | useEffect + useState | React Query |

---

## 8. Cronograma Sugerido

### Fase 1: Setup (1 semana)
- [ ] Criar projeto backend TypeScript
- [ ] Configurar Knex + migrations
- [ ] Criar projeto frontend Vite + React
- [ ] Configurar TailwindCSS

### Fase 2: Core (2 semanas)
- [ ] Autenticação (login, JWT, middleware)
- [ ] CRUD Orçamentos
- [ ] Layout base do frontend

### Fase 3: Módulos (2 semanas)
- [ ] CRUD Membros
- [ ] Upload de documentos (S3)
- [ ] Módulo financeiro

### Fase 4: Integrações (1 semana)
- [ ] Integração Bitrix24
- [ ] Integração Autentique

### Fase 5: Finalização (1 semana)
- [ ] Testes
- [ ] Ajustes finais
- [ ] Deploy

**Total estimado: 7 semanas**

---

## 9. Variáveis de Ambiente

### Backend (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dashboard_orcamento

# JWT
JWT_SECRET=sua-chave-secreta
JWT_EXPIRES_IN=8h

# AWS S3
AWS_REGION=sa-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=

# Bitrix24
BITRIX_URL=
BITRIX_CLIENT_ID=
BITRIX_CLIENT_SECRET=
BITRIX_REFRESH_TOKEN=

# Autentique
AUTENTIQUE_TOKEN=
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
```

---

## 10. Próximos Passos

1. **Aprovar** esta proposta com o Tech Lead
2. **Criar repositórios** para backend e frontend
3. **Setup inicial** dos projetos
4. **Iniciar desenvolvimento** pela autenticação

---

*Documento para revisão técnica*
*Aguardando aprovação*
