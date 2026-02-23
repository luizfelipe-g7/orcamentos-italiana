import type { Pessoa, CertidoesLinhagem } from '../types/budget';

export function calcularCertidoesLinhagem(pessoas: Pessoa[]): CertidoesLinhagem {
  let nascimento = 0;
  let casamento = 0;
  let obito = 0;
  let explicacaoNascimento = '';
  let explicacaoCasamento = '';
  let explicacaoObito = '';

  pessoas.forEach(pessoa => {
    // Nascimento
    if (pessoa.certidoes.nascimento.necessaria) {
      nascimento += pessoa.quantidade;
      explicacaoNascimento += `${pessoa.quantidade}x Nascimento (${pessoa.grauParentesco})\n`;
    }

    // Casamento
    if (pessoa.certidoes.casamento.necessaria) {
      casamento += pessoa.quantidade;
      explicacaoCasamento += `${pessoa.quantidade}x Casamento (${pessoa.grauParentesco})\n`;
    }

    // Óbito
    if (pessoa.certidoes.obito.necessaria) {
      obito += pessoa.quantidade;
      explicacaoObito += `${pessoa.quantidade}x Óbito (${pessoa.grauParentesco})\n`;
    }
  });

  return {
    nascimento: { total: nascimento, explicacao: explicacaoNascimento },
    casamento: { total: casamento, explicacao: explicacaoCasamento },
    obito: { total: obito, explicacao: explicacaoObito },
    total: nascimento + casamento + obito
  };
}
