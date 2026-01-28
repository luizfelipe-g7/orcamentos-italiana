-- ===========================================
-- DASHBOARD ORÇAMENTO v2.0 - SCHEMA COMPLETO
-- Supabase (PostgreSQL)
-- ===========================================

-- ============================================
-- 1. OPERADORES (Usuários do Sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS operadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'VENDEDOR' CHECK (role IN ('ADM', 'VENDEDOR')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca por status ativo (email já tem índice pelo UNIQUE)
CREATE INDEX idx_operadores_ativo ON operadores(ativo);

-- ============================================
-- 2. ORÇAMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS orcamentos (
    id SERIAL PRIMARY KEY,
    nome_familia VARCHAR(150) NOT NULL,
    cidadania VARCHAR(2) NOT NULL CHECK (cidadania IN ('IT', 'PT')),
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'FECHADO', 'CANCELADO', 'EM_ANDAMENTO')),
    
    -- Valores financeiros
    valor_total DECIMAL(12, 2),
    num_parcelas INTEGER,
    valor_entrada DECIMAL(12, 2),
    valor_parcela DECIMAL(12, 2),
    
    -- Datas importantes
    data_fechamento DATE,
    previsao_inicio DATE,
    
    -- Observações
    observacoes TEXT,
    
    -- Relacionamento com operador
    operador_id INTEGER NOT NULL REFERENCES operadores(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Integração Bitrix
    bitrix_deal_id VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orcamentos_operador ON orcamentos(operador_id);
CREATE INDEX idx_orcamentos_status ON orcamentos(status);
CREATE INDEX idx_orcamentos_cidadania ON orcamentos(cidadania);
CREATE INDEX idx_orcamentos_created ON orcamentos(created_at DESC);

-- ============================================
-- 3. MEMBROS (Família)
-- ============================================
CREATE TABLE IF NOT EXISTS membros (
    id SERIAL PRIMARY KEY,
    
    -- Relacionamento com orçamento
    orcamento_id INTEGER NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Dados pessoais
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    email VARCHAR(150),
    telefone VARCHAR(20),
    data_nascimento DATE,
    naturalidade VARCHAR(100),
    nacionalidade VARCHAR(50) DEFAULT 'Brasileira',
    
    -- Endereço
    cep VARCHAR(10),
    endereco VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    -- Parentesco e papel no processo
    parentesco VARCHAR(50),
    requerente BOOLEAN NOT NULL DEFAULT FALSE,
    pagante BOOLEAN NOT NULL DEFAULT FALSE,
    dante_causa BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Estado civil
    estado_civil VARCHAR(30),
    profissao VARCHAR(100),
    
    observacoes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_membros_orcamento ON membros(orcamento_id);
CREATE INDEX idx_membros_cpf ON membros(cpf);
CREATE INDEX idx_membros_requerente ON membros(requerente);

-- ============================================
-- 4. DOCUMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS documentos (
    id SERIAL PRIMARY KEY,
    
    -- Relacionamento com membro
    membro_id INTEGER NOT NULL REFERENCES membros(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Tipo de documento
    tipo VARCHAR(50) NOT NULL,
    subtipo VARCHAR(50),
    
    -- Arquivo
    nome_arquivo VARCHAR(255) NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    url_s3 VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    tamanho_bytes INTEGER,
    
    -- Status do documento
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ENVIADO', 'EM_ANALISE', 'APROVADO', 'REJEITADO', 'VENCIDO')),
    
    -- Datas importantes
    data_emissao DATE,
    data_validade DATE,
    
    -- Assinatura digital (Autentique)
    autentique_id VARCHAR(100),
    status_assinatura VARCHAR(20) CHECK (status_assinatura IN ('NAO_REQUER', 'PENDENTE', 'ENVIADO', 'ASSINADO', 'RECUSADO')),
    data_assinatura TIMESTAMP WITH TIME ZONE,
    
    observacoes TEXT,
    
    -- Quem fez upload
    uploaded_by INTEGER REFERENCES operadores(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documentos_membro ON documentos(membro_id);
CREATE INDEX idx_documentos_tipo ON documentos(tipo);
CREATE INDEX idx_documentos_status ON documentos(status);

-- ============================================
-- 5. FINANCEIRO - PAGANTES
-- ============================================
CREATE TABLE IF NOT EXISTS pagantes (
    id SERIAL PRIMARY KEY,
    
    -- Relacionamento com orçamento
    orcamento_id INTEGER NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Relacionamento com membro (opcional)
    membro_id INTEGER REFERENCES membros(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Dados do pagante
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14),
    email VARCHAR(150),
    telefone VARCHAR(20),
    
    -- Valores
    valor_total DECIMAL(12, 2) NOT NULL,
    num_parcelas INTEGER NOT NULL DEFAULT 1,
    valor_entrada DECIMAL(12, 2),
    
    observacoes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pagantes_orcamento ON pagantes(orcamento_id);

-- ============================================
-- 6. FINANCEIRO - PARCELAS
-- ============================================
CREATE TABLE IF NOT EXISTS parcelas (
    id SERIAL PRIMARY KEY,
    
    -- Relacionamento com pagante
    pagante_id INTEGER NOT NULL REFERENCES pagantes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Dados da parcela
    numero_parcela INTEGER NOT NULL,
    valor DECIMAL(12, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    
    -- Status de pagamento
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO')),
    
    -- Dados do pagamento
    data_pagamento DATE,
    valor_pago DECIMAL(12, 2),
    forma_pagamento VARCHAR(50),
    comprovante_url VARCHAR(500),
    
    observacoes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parcelas_pagante ON parcelas(pagante_id);
CREATE INDEX idx_parcelas_status ON parcelas(status);
CREATE INDEX idx_parcelas_vencimento ON parcelas(data_vencimento);

-- ============================================
-- 7. FINANCEIRO - HONORÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS honorarios (
    id SERIAL PRIMARY KEY,
    
    -- Relacionamento com orçamento
    orcamento_id INTEGER NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Descrição do serviço
    descricao VARCHAR(200) NOT NULL,
    detalhes TEXT,
    
    -- Valores
    valor DECIMAL(12, 2) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    desconto DECIMAL(12, 2),
    valor_final DECIMAL(12, 2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_honorarios_orcamento ON honorarios(orcamento_id);

-- ============================================
-- 8. PROCESSOS DE CIDADANIA
-- ============================================
CREATE TABLE IF NOT EXISTS processos_cidadania (
    id SERIAL PRIMARY KEY,
    
    -- Relacionamento com orçamento (1:1)
    orcamento_id INTEGER NOT NULL UNIQUE REFERENCES orcamentos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Tipo de processo
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('JUDICIAL', 'ADMINISTRATIVO', 'CONSULADO')),
    
    -- Status do processo
    status VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO_DOCUMENTOS' CHECK (status IN (
        'AGUARDANDO_DOCUMENTOS',
        'DOCUMENTOS_EM_ANALISE',
        'AGUARDANDO_TRADUCAO',
        'AGUARDANDO_APOSTILAMENTO',
        'PRONTO_PARA_PROTOCOLO',
        'PROTOCOLADO',
        'EM_ANALISE_CONSULADO',
        'EM_ANALISE_TRIBUNAL',
        'AGUARDANDO_SENTENCA',
        'SENTENCA_FAVORAVEL',
        'SENTENCA_DESFAVORAVEL',
        'CIDADANIA_RECONHECIDA',
        'CONCLUIDO',
        'CANCELADO'
    )),
    
    -- Datas importantes
    data_inicio DATE,
    data_protocolo DATE,
    data_previsao_conclusao DATE,
    data_conclusao DATE,
    
    -- Dados do processo judicial
    numero_processo VARCHAR(50),
    tribunal VARCHAR(100),
    comarca VARCHAR(100),
    juiz VARCHAR(150),
    
    -- Dados do consulado
    consulado VARCHAR(100),
    numero_pratica VARCHAR(50),
    
    -- Responsável
    responsavel VARCHAR(150),
    contato_responsavel VARCHAR(100),
    
    observacoes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_processos_orcamento ON processos_cidadania(orcamento_id);
CREATE INDEX idx_processos_status ON processos_cidadania(status);
CREATE INDEX idx_processos_tipo ON processos_cidadania(tipo);

-- ============================================
-- 9. HISTÓRICO DO PROCESSO
-- ============================================
CREATE TABLE IF NOT EXISTS processo_historico (
    id SERIAL PRIMARY KEY,
    
    -- Relacionamento com processo
    processo_id INTEGER NOT NULL REFERENCES processos_cidadania(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Evento
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50),
    
    -- Quem registrou
    operador_id INTEGER REFERENCES operadores(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    data_evento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_historico_processo ON processo_historico(processo_id);
CREATE INDEX idx_historico_data ON processo_historico(data_evento DESC);

-- ============================================
-- 10. FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_operadores_updated_at BEFORE UPDATE ON operadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_membros_updated_at BEFORE UPDATE ON membros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagantes_updated_at BEFORE UPDATE ON pagantes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parcelas_updated_at BEFORE UPDATE ON parcelas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_honorarios_updated_at BEFORE UPDATE ON honorarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processos_cidadania_updated_at BEFORE UPDATE ON processos_cidadania FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processo_historico_updated_at BEFORE UPDATE ON processo_historico FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SCHEMA CRIADO COM SUCESSO! ✅
-- ============================================
-- Para criar usuários, use o script: npm run seed:users
-- Ou a API: POST /api/auth/register (requer admin)
