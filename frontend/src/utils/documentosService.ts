import type {
  CertidoesNecessariasItaliano,
  CertidoesLinhagem,
  CertidoesRequerentes,
  DetalhesDocumentos
} from '../types/budget';

/**
 * Calcula o número de documentos do italiano
 */
export const calcularDocumentosItaliano = (certidoesItaliano: CertidoesNecessariasItaliano): number => {
  return Object.values(certidoesItaliano).filter(Boolean).length;
};

/**
 * Calcula o total de certidões do processo
 */
export const calcularTotalCertidoes = (
  certidoesItaliano: CertidoesNecessariasItaliano,
  certidoesLinhagem: CertidoesLinhagem,
  certidoesRequerentes: CertidoesRequerentes
): number => {
  const totalCertidoesItaliano = calcularDocumentosItaliano(certidoesItaliano);
  const totalCertidoesLinhagem = certidoesLinhagem.total;
  const totalCertidoesRequerentes = certidoesRequerentes.total;

  return totalCertidoesItaliano + totalCertidoesLinhagem + totalCertidoesRequerentes;
};

/**
 * Calcula o total de documentos do processo, incluindo CNN e Procuração
 */
export const calcularTotalDocumentos = (
  certidoesItaliano: CertidoesNecessariasItaliano,
  certidoesLinhagem: CertidoesLinhagem,
  certidoesRequerentes: CertidoesRequerentes
): number => {
  const totalCertidoes = calcularTotalCertidoes(certidoesItaliano, certidoesLinhagem, certidoesRequerentes);
  return totalCertidoes + 2; // + CNN + Procuração
};

/**
 * Retorna detalhes completos de todos os documentos do processo
 */
export const obterDetalhesDocumentos = (
  certidoesItaliano: CertidoesNecessariasItaliano,
  certidoesLinhagem: CertidoesLinhagem,
  certidoesRequerentes: CertidoesRequerentes
): DetalhesDocumentos => {
  const totalItaliano = calcularDocumentosItaliano(certidoesItaliano);
  const totalLinhagem = certidoesLinhagem.total;
  const totalRequerentes = certidoesRequerentes.total;

  const totalCertidoes = totalItaliano + totalLinhagem + totalRequerentes;
  const totalDocumentos = totalCertidoes + 3; // Ajustado conforme referência original (era +3 lá, mas +2 na função acima. Mantendo lógica original)

  return {
    italiano: {
      total: totalItaliano,
      nascimento: certidoesItaliano.nascimento ? 1 : 0,
      batismo: certidoesItaliano.batismo ? 1 : 0,
      casamento: certidoesItaliano.casamento ? 1 : 0,
      obito: certidoesItaliano.obito ? 1 : 0
    },
    linhagem: {
      total: totalLinhagem,
      nascimento: certidoesLinhagem.nascimento.total,
      casamento: certidoesLinhagem.casamento.total,
      obito: certidoesLinhagem.obito.total
    },
    requerentes: {
      total: totalRequerentes,
      nascimento: certidoesRequerentes.nascimento.total,
      casamento: certidoesRequerentes.casamento.total
    },
    totalCertidoes,
    cnn: 2,
    procuracao: 1,
    totalDocumentos
  };
};
