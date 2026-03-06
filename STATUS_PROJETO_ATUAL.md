# Status Atual do Projeto - Dashboard Orcamentos Italiana

Este documento consolida o status do projeto ate o momento: o que foi implementado, o que foi estabilizado e o que ainda falta para concluir 100%.

## 1) Escopo e direcionamento

- O painel foi direcionado para **orcamentos de cidadania italiana**.
- Referencias de portuguesa foram removidas dos fluxos principais.
- Estrutura separada em:
  - `backend` (Node.js + TypeScript + Express + Knex + PostgreSQL/Supabase)
  - `frontend` (React + Vite + TypeScript + Tailwind)

## 2) O que ja foi feito

### 2.1 Backend (base e modulos)

- API Express estruturada com middlewares centrais:
  - autenticacao JWT;
  - validacao com Zod;
  - tratamento global de erros;
  - rate limit, CORS e Helmet.
- Banco com migrations e repositorios por modulo.
- Modulo Auth implementado:
  - login;
  - perfil (`/auth/me`);
  - atualizacao de perfil com regras por papel (`ADM` e `VENDEDOR`);
  - gestao de vendedores por admin;
  - upload de foto de perfil com persistencia.
- Modulo Orcamentos implementado:
  - criar, listar, detalhar, atualizar, excluir;
  - validacoes de schema e controle de permissao.
- Modulo Membros implementado:
  - CRUD e listagem por orcamento;
  - persistencia relacional no banco.
- Modulo Documentos implementado:
  - upload por membro;
  - listagem por membro;
  - exclusao;
  - **atualizacao de status** (endpoint adicionado: `PUT /api/documentos/:id/status`).
- Modulo Financeiro implementado:
  - honorarios (listar/criar/excluir);
  - pagantes (listar/criar/excluir);
  - parcelas (atualizacao de status/dados).
- Ajustes de robustez ja aplicados:
  - tratamento de erros Multer;
  - fallback para diferencas de schema em pontos criticos;
  - compatibilizacao de upload e entrega de arquivos.

### 2.2 Frontend (fluxos e telas)

- Base de autenticacao e rotas privadas funcionando.
- Dashboard conectado com dados reais (sem mock no fluxo principal).
- Orcamentos:
  - listagem com dados reais;
  - tela de novo orcamento com assistente;
  - tela de detalhe/edicao de orcamento.
- Linhagem:
  - arvore interativa com cards moviveis e conexoes (React Flow).
- Membros:
  - formulario/modal de cadastro;
  - vinculacao ao orcamento;
  - no detalhe do orcamento: criar, editar e excluir membros.
- Perfil/Configuracoes:
  - upload de foto da maquina;
  - persistencia e exibicao da foto no layout;
  - regras de permissao por papel (admin vs vendedor).
- Documentos no frontend (fase 2):
  - upload por membro;
  - listagem;
  - alteracao de status;
  - visualizacao e remocao.
- Financeiro no frontend (fase 2):
  - honorarios;
  - pagantes;
  - parcelas;
  - operacoes ponta a ponta via API.
- Correcoes recentes no Novo Orcamento:
  - ajuste de payload para evitar `400` por campos financeiros invalidos;
  - melhora da mensagem de erro exibida ao usuario;
  - observacoes salvas com resumo legivel (sem JSON bruto).

## 3) Fases 1 e 2 (status)

### Fase 1 - Concluida

- detalhe/edicao de orcamento;
- formulario completo de membro;
- estabilizacao de persistencia.

### Fase 2 - Concluida

- documentos frontend completos;
- financeiro frontend completo.

## 4) O que ainda falta para 100%

## 4.1 Fase 3 - Integracoes (pendente)

- Integracao **Bitrix24**.
- Integracao **Autentique**.
- Consolidacao de **AWS** (S3 em producao):
  - estrategia final de armazenamento;
  - credenciais por ambiente;
  - seguranca e politicas de acesso/upload.

### 4.2 Producao e seguranca (pendente)

- Revisao final de CORS, Helmet e rate limit para producao.
- Remocao de logs de debug e padronizacao de logging.
- Revisao de politicas de upload (tipo, tamanho, headers, origem).
- Validacao completa de variaveis de ambiente em staging/producao.

### 4.3 Banco e consistencia (pendente)

- Garantir aplicacao de migrations em todos os ambientes.
- Verificar divergencias entre schema esperado e schema real.
- Revisar constraints, indices e integridade referencial.
- (Opcional recomendado) normalizar observacoes antigas que ficaram com JSON bruto.

### 4.4 Qualidade e testes (pendente)

- Rodar bateria completa de testes dos fluxos criticos:
  - login/logout;
  - orcamentos (CRUD);
  - membros;
  - foto de perfil;
  - regras de permissao ADM vs VENDEDOR;
  - documentos e financeiro.
- Ampliar testes automatizados de regressao.

### 4.5 UX e acabamento (pendente)

- Padronizar mensagens de validacao/erro/sucesso.
- Revisar responsividade das telas principais.
- Refinar consistencia visual de formularios e estados de carregamento.

## 5) Recomendacao de proximo passo imediato

1. Fechar AWS/S3 para ambiente de producao (base para integracoes externas).
2. Implementar Bitrix24 e Autentique.
3. Executar hardening de producao + rodada completa de testes.
4. Preparar checklist de go-live.

---

Ultima atualizacao: 2026-01-29
