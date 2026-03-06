# Checklist para Projeto ficar 100%

Este documento consolida o que ainda falta para o projeto atingir um estado de entrega "100%" em produção.

## 1) Funcionalidades core (prioridade alta)

- [x] Implementar tela de **detalhe/edição completa de orçamento** (carregar dados reais e reabrir fluxo com persistência).
- [x] Finalizar **fluxo relacional completo** do orçamento no frontend e backend (edição consistente de orçamento + membros já cadastrados).
- [x] Substituir fluxos simplificados por UI final (ex.: cadastro de membro via `prompt` -> formulário/modal completo com validação).

## 2) Módulos de negócio (prioridade alta)

- [x] Finalizar **Documentos (frontend)**:
  - [x] upload por membro;
  - [x] listagem por status;
  - [x] atualização de status do documento;
  - [x] visualização/remoção.
- [x] Finalizar **Financeiro (frontend)**:
  - [x] pagantes;
  - [x] parcelas;
  - [x] honorários;
  - [x] fechamento completo ponta a ponta com backend.

## 3) Integrações (prioridade média/alta)

- Implementar integração **Bitrix24**.
- Implementar integração **Autentique**.
- Implementar/fechar integração **AWS**:
  - consolidar estratégia de armazenamento (S3 em produção);
  - revisar credenciais/ambiente por `NODE_ENV`;
  - validar upload, leitura e segurança dos arquivos;
  - (opcional) planejar uso de serviços adicionais AWS conforme necessidade do projeto.

## 4) Segurança, ambiente e produção (prioridade alta)

- Revisar e finalizar configurações de **CORS**, **Helmet** e **Rate Limit** para ambiente de produção.
- Remover logs de debug e normalizar logging.
- Garantir políticas de upload/arquivos (tipo, tamanho, origem, headers).
- Validar variáveis de ambiente em staging/produção.

## 5) Banco de dados e consistência (prioridade alta)

- Garantir **migrations aplicadas** em todos os ambientes.
- Eliminar divergências entre schema real e schema esperado pelo código.
- Validar constraints, índices e integridade referencial após fluxos reais.

## 6) Qualidade e testes (prioridade alta)

- Executar bateria de testes dos fluxos críticos:
  - login/logout;
  - criação/edição/exclusão de orçamentos;
  - criação/edição de membros;
  - upload e persistência de foto;
  - permissões admin vs vendedor;
  - documentos e financeiro.
- Adicionar/ajustar testes automatizados de regressão para módulos principais.

## 7) UX e acabamento final (prioridade média)

- Melhorar consistência visual/formulários e estados de erro/sucesso.
- Padronizar mensagens de validação e feedback.
- Revisar responsividade das telas principais.

---

## Sugestão de fechamento por fases

### Fase 1 (rápida)
- [x] Detalhe/edição de orçamento;
- [x] formulário completo de membro;
- [x] estabilização de persistência.

### Fase 2 (média)
- [x] documentos frontend completos;
- [x] financeiro frontend completo.

### Fase 3 (produção)
- integrações (Bitrix24, Autentique, AWS);
- hardening de segurança/infra;
- testes finais e checklist de go-live.
