import type {
  DetalhesOrcamento,
  FinancialInfo,
  Requerente,
  CertidoesNecessariasItaliano,
  CertidoesLinhagem,
  CertidoesRequerentes,
  CustosCertidoes
} from '../types/budget';
import { calcularTotalDocumentos } from './documentosService';

// Constantes
export const PESQUISA_ITA_ID = 'pesquisa-ita';
export const PESQUISA_BR_ID = 'pesquisa-br';
const EURO_FIXO = 6.90;
const VALOR_MENOR_EUROS = 300;

export const calcularTotalItens = (selectedItems: Record<string, any>): number => {
  return Object.values(selectedItems).reduce((sum: number, item: any) => sum + item.price, 0);
};

export const calcularValorTraducaoApostilamento = (
  certidoesItaliano: CertidoesNecessariasItaliano,
  certidoesLinhagem: CertidoesLinhagem,
  certidoesRequerentes: CertidoesRequerentes,
  custosCertidoes?: CustosCertidoes
): number => {
  let certidoesItalianoFiltradas: CertidoesNecessariasItaliano = {
    nascimento: false,
    batismo: false,
    casamento: false,
    obito: false
  };

  if (custosCertidoes) {
    if (certidoesItaliano.nascimento && custosCertidoes.nascimento?.moeda === 'real') certidoesItalianoFiltradas.nascimento = true;
    if (certidoesItaliano.casamento && custosCertidoes.casamento?.moeda === 'real') certidoesItalianoFiltradas.casamento = true;
    if (certidoesItaliano.obito && custosCertidoes.obito?.moeda === 'real') certidoesItalianoFiltradas.obito = true;
  }

  const totalDocumentos = calcularTotalDocumentos(
    certidoesItalianoFiltradas,
    certidoesLinhagem,
    certidoesRequerentes
  );

  if (totalDocumentos === 2) return 18000;
  if (totalDocumentos < 8) return totalDocumentos * 500;
  if (totalDocumentos >= 8 && totalDocumentos <= 12) return 5000;
  if (totalDocumentos >= 13 && totalDocumentos <= 15) return 6500;
  if (totalDocumentos >= 16 && totalDocumentos <= 20) return 8500;
  if (totalDocumentos >= 21 && totalDocumentos <= 25) return 10000;
  if (totalDocumentos >= 26 && totalDocumentos <= 30) return 12000;
  if (totalDocumentos >= 31 && totalDocumentos <= 40) return 15750;
  if (totalDocumentos >= 41 && totalDocumentos <= 53) return 18000;
  
  if (totalDocumentos >= 54) {
    const excedente = totalDocumentos - 53;
    return 18000 + (excedente * 340);
  }

  return 18000;
};

export const calcularValorEmissaoCertidoesBR = (
  certidoesItaliano: CertidoesNecessariasItaliano,
  certidoesLinhagem: CertidoesLinhagem,
  certidoesRequerentes: CertidoesRequerentes,
  infoAncestral?: any,
  custosCertidoes?: CustosCertidoes
): number => {
  let totalCidadaoItaliano = 0;
  if (certidoesItaliano && custosCertidoes) {
    if (certidoesItaliano.nascimento && custosCertidoes.nascimento?.moeda === 'real') totalCidadaoItaliano++;
    if (certidoesItaliano.casamento && custosCertidoes.casamento?.moeda === 'real') totalCidadaoItaliano++;
    if (certidoesItaliano.obito && custosCertidoes.obito?.moeda === 'real') totalCidadaoItaliano++;
  }

  const totalLinhagem = certidoesLinhagem.total;
  const totalRequerentes = certidoesRequerentes.total;
  const totalCertidoesBR = totalCidadaoItaliano + totalLinhagem + totalRequerentes;

  return totalCertidoesBR * 300;
};

export const calcularEmissaoCertidoesITA = (
  certidoesItaliano: CertidoesNecessariasItaliano,
  custosCertidoes?: CustosCertidoes | null,
  infoAncestral?: any
): number => {
  if (custosCertidoes) {
    if (custosCertidoes.totalEuro !== undefined && custosCertidoes.totalEuro > 0) {
      return custosCertidoes.totalEuro;
    }
  }
  return 0;
};

export const calcularCustasJudiciais = (requerentes: Requerente[]): number => {
  if (!requerentes || requerentes.length === 0) return 0;

  const numeroRequerentes = requerentes
    .filter(req => req.tipo === 'Requerente')
    .reduce((soma, req) => soma + (req.quantidade || 1), 0);

  if (numeroRequerentes === 0) return 0;

  const valorBase = 3400;
  const valorAdicional = 647;

  return valorBase + Math.max(0, numeroRequerentes - 1) * valorAdicional;
};

export const calcularNovaTaxaPorRequerente = (requerentes: Requerente[]): number => {
  if (!requerentes || requerentes.length === 0) return 0;

  const totalRequerentes = requerentes
    .filter(req => req.tipo === 'Requerente')
    .reduce((soma, req) => soma + (req.quantidade || 1), 0);

  if (totalRequerentes <= 1) return 0;

  return (totalRequerentes - 1) * 600;
};

export const calcularDetalhesOrcamento = (
  selectedItems: Record<string, any>,
  requerentes: Requerente[],
  financialInfo: FinancialInfo,
  detalhesAtuais: DetalhesOrcamento,
  certidoesItaliano: CertidoesNecessariasItaliano,
  certidoesLinhagem: CertidoesLinhagem,
  certidoesRequerentes: CertidoesRequerentes,
  custosCertidoes?: CustosCertidoes,
  infoAncestral?: any
): DetalhesOrcamento => {
  const pesquisaITA = selectedItems[PESQUISA_ITA_ID]?.price !== undefined 
    ? selectedItems[PESQUISA_ITA_ID]?.price 
    : detalhesAtuais.pesquisaITA;
      
  const pesquisaBR = selectedItems[PESQUISA_BR_ID]?.price !== undefined 
    ? selectedItems[PESQUISA_BR_ID]?.price 
    : detalhesAtuais.pesquisaBR;

  const traducaoApostilamento = calcularValorTraducaoApostilamento(
    certidoesItaliano,
    certidoesLinhagem,
    certidoesRequerentes,
    custosCertidoes
  );

  const emissaoCertidoesBR = calcularValorEmissaoCertidoesBR(
    certidoesItaliano,
    certidoesLinhagem,
    certidoesRequerentes,
    infoAncestral,
    custosCertidoes
  );

  const custasJudiciaisEuro = calcularCustasJudiciais(requerentes);
  const novaTaxaRequerenteEuro = calcularNovaTaxaPorRequerente(requerentes);
  const emissaoCertificacoesITAEuro = calcularEmissaoCertidoesITA(certidoesItaliano, custosCertidoes, infoAncestral);

  const qtdMenores = requerentes
    .filter(req => req.tipo === 'Menor')
    .reduce((soma, req) => soma + (req.quantidade || 1), 0);
  
  const valorMenorReais = qtdMenores * VALOR_MENOR_EUROS * EURO_FIXO;

  return {
    ...detalhesAtuais,
    pesquisaITA,
    pesquisaBR,
    traducaoApostilamento,
    emissaoCertidoesBR,
    custasJudiciaisEuro,
    emissaoCertificacoesITAEuro,
    valorMenorReais,
    novaTaxaRequerenteEuro
  };
};

export const calcularTotal = (
  detalhesOrcamento: DetalhesOrcamento,
  euroTurismo: number,
  taxaMenor?: number | null
): number => {
  const valorEurosConvertidos = (
    detalhesOrcamento.custasJudiciaisEuro +
    detalhesOrcamento.emissaoCertificacoesITAEuro
  ) * EURO_FIXO;

  const valorMenorFinal = taxaMenor !== undefined && taxaMenor !== null
    ? taxaMenor
    : detalhesOrcamento.valorMenorReais;

  return valorEurosConvertidos +
    detalhesOrcamento.pesquisaITA +
    detalhesOrcamento.pesquisaBR +
    detalhesOrcamento.traducaoApostilamento +
    valorMenorFinal +
    detalhesOrcamento.emissaoCertidoesBR;
};

export const calcularValorFinalComDesconto = (valorBase: number, desconto: number): number => {
  const percentual = 1 - (desconto / 100);
  return valorBase * percentual;
};

export const calcularValorParcela = (valorTotal: number, valorEntrada: number, numParcelas: number): number => {
  const parcelas = Math.max(1, numParcelas);
  const valorParcelado = Math.max(0, valorTotal - valorEntrada);
  return valorParcelado / parcelas;
};

export const calcularInformacoesFinanceiras = (
  comEmissao: boolean,
  detalhesOrcamento: DetalhesOrcamento,
  desconto: number,
  valorEntrada: number,
  parcelas: number
): FinancialInfo => {
  const valorBase = comEmissao ? detalhesOrcamento.totalComEmissao : detalhesOrcamento.totalSemEmissao;
  const valorFinal = calcularValorFinalComDesconto(valorBase, desconto);
  const valorParcela = calcularValorParcela(valorFinal, valorEntrada, parcelas);
  
  return {
    parcelas,
    valorParcela,
    desconto,
    valorFinal,
    comEmissao,
    valorEntrada,
    dataVencimento: 5
  };
};

export const calcularTotalSemEmissao = (totalComEmissao: number, emissaoCertidoesBR: number): number => {
  return totalComEmissao - emissaoCertidoesBR;
};

export const calcularValorPorRequerenteComEmissao = (
  totalComEmissao: number,
  valorMenor: number,
  totalRequerentes: number
): number => {
  if (totalRequerentes <= 0) return totalComEmissao;
  const valorSemMenor = totalComEmissao - valorMenor;
  return valorSemMenor / totalRequerentes;
};

export const calcularValorPorRequerenteSemEmissao = (
  totalSemEmissao: number,
  valorMenor: number,
  totalRequerentes: number
): number => {
  if (totalRequerentes <= 0) return totalSemEmissao;
  const valorSemMenor = totalSemEmissao - valorMenor;
  return valorSemMenor / totalRequerentes;
};

export const calcularValorSemTaxa = (
  comEmissao: boolean,
  totalComEmissao: number,
  totalSemEmissao: number,
  valorMenor: number,
  novaTaxaRequerenteReal: number,
  totalRequerentes: number = 0,
  valorPorRequerenteComEmissao?: number | null,
  valorPorRequerenteSemEmissao?: number | null
): number => {
  if (totalRequerentes <= 1) {
    return comEmissao ? totalComEmissao - valorMenor : totalSemEmissao - valorMenor;
  }
  
  let valorSemTaxa;
  if (comEmissao) {
    if (valorPorRequerenteComEmissao) {
      valorSemTaxa = valorPorRequerenteComEmissao - novaTaxaRequerenteReal;
    } else {
      valorSemTaxa = totalComEmissao - valorMenor - novaTaxaRequerenteReal;
    }
  } else {
    if (valorPorRequerenteSemEmissao) {
      valorSemTaxa = valorPorRequerenteSemEmissao - novaTaxaRequerenteReal;
    } else {
      valorSemTaxa = totalSemEmissao - valorMenor - novaTaxaRequerenteReal;
    }
  }
  
  return Math.max(0, valorSemTaxa);
};
