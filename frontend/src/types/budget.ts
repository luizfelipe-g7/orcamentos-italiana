export interface Certidao {
  necessaria: boolean;
  motivo: string;
  moeda?: 'real' | 'euro';
  valor?: number;
}

export interface CertidoesPessoa {
  nascimento: Certidao;
  casamento: Certidao;
  obito: Certidao;
}

export interface Pessoa {
  id: string;
  grauParentesco: string;
  quantidade: number;
  casou: boolean;
  faleceu: boolean;
  certidoes: CertidoesPessoa;
}

export interface NovaPessoa {
  grauParentesco: string;
  quantidade: number;
  casou: boolean;
  faleceu: boolean;
}

export interface CertidoesLinhagem {
  nascimento: { total: number; explicacao: string };
  casamento: { total: number; explicacao: string };
  obito: { total: number; explicacao: string };
  total: number;
}

export interface Requerente {
  id: string;
  nome?: string;
  tipo: 'Requerente' | 'Menor';
  quantidade: number;
  casou?: boolean;
  certidoes?: {
    nascimento: Certidao;
    casamento: Certidao;
  };
}

export interface NovoRequerente {
  tipo: 'Requerente' | 'Menor';
  quantidade: number;
  casou: boolean;
}

export interface CertidoesRequerentes {
  nascimento: { total: number; explicacao: string };
  casamento: { total: number; explicacao: string };
  total: number;
}

export interface InfoAncestral {
  nasceuItalia: boolean;
  batizado: boolean;
  casouItalia: boolean;
  casouBrasil: boolean;
  faleceuItalia: boolean;
  faleceuBrasil: boolean;
}

export interface CertidoesNecessariasItaliano {
  nascimento: boolean;
  batismo: boolean;
  casamento: boolean;
  obito: boolean;
}

export interface CustosCertidoes {
  totalEuro: number;
  totalReal: number;
  nascimento?: Certidao;
  batismo?: Certidao;
  casamento?: Certidao;
  obito?: Certidao;
}

export interface FinancialInfo {
  parcelas: number;
  valorParcela: number;
  desconto: number;
  valorFinal: number;
  comEmissao: boolean;
  valorEntrada: number;
  dataVencimento: number;
}

export interface DetalhesOrcamento {
  pesquisaITA: number;
  pesquisaBR: number;
  traducaoApostilamento: number;
  emissaoCertidoesBR: number;
  custasJudiciaisEuro: number;
  emissaoCertificacoesITAEuro: number;
  valorMenorReais: number;
  parcelasMenor: {
    quantidade: number;
    valorParcela: number;
    valorEntrada: number;
    dataVencimento: number;
  };
  temMenorIdade: boolean;
  totalAVista: number;
  totalPorRequerente: number;
  totalSemEmissao: number;
  totalComEmissao: number;
  totalSemTaxa: number;
  novaTaxaRequerenteEuro?: number;
  novaTaxaRequerenteReal?: number;
}

export interface DetalhesDocumentos {
  italiano: {
    total: number;
    nascimento: number;
    batismo: number;
    casamento: number;
    obito: number;
  };
  linhagem: {
    total: number;
    nascimento: number;
    casamento: number;
    obito: number;
  };
  requerentes: {
    total: number;
    nascimento: number;
    casamento: number;
  };
  totalCertidoes: number;
  cnn: number;
  procuracao: number;
  totalDocumentos: number;
}
