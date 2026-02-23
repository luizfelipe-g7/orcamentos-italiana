import type { Requerente, CertidoesRequerentes } from '../types/budget';

export function calcularCertidoesRequerentes(requerentes: Requerente[]): CertidoesRequerentes {
  let nascimento = 0;
  let casamento = 0;
  let explicacaoNascimento = '';
  let explicacaoCasamento = '';

  requerentes.forEach(req => {
    // Nascimento (sempre necessária para todos)
    if (req.certidoes?.nascimento.necessaria) {
      nascimento += req.quantidade;
      explicacaoNascimento += `${req.quantidade}x Nascimento (${req.tipo})\n`;
    }

    // Casamento (apenas se casou e não for menor)
    if (req.certidoes?.casamento.necessaria) {
      casamento += req.quantidade;
      explicacaoCasamento += `${req.quantidade}x Casamento (${req.tipo})\n`;
    }
  });

  return {
    nascimento: { total: nascimento, explicacao: explicacaoNascimento },
    casamento: { total: casamento, explicacao: explicacaoCasamento },
    total: nascimento + casamento
  };
}
