import React, { useState, useEffect } from 'react';
import { Receipt } from 'lucide-react';
import type { DetalhesOrcamento, CertidoesNecessariasItaliano, CertidoesLinhagem, CertidoesRequerentes } from '../../../types/budget';
import { calcularTotalDocumentos } from '../../../utils/documentosService';

// Valores fixos
const EURO_FIXO = 6.90;
const VALOR_BASE_TAXA_MENOR = 754; // Valor base para cálculo da taxa menor (exemplo)

interface ValoresProcessoCardProps {
    detalhesOrcamento: DetalhesOrcamento;
    certidoesNecessarias: CertidoesNecessariasItaliano;
    certidoesLinhagem: CertidoesLinhagem;
    certidoesRequerentes: CertidoesRequerentes;
    qtdTotalMenores?: number;
    qtdTotalRequerentes?: number;
    euroTurismo: number | null;
    carregandoEuroTurismo: boolean;
    onTaxaMenorChange?: (valor: number | null) => void;
}

export const ValoresProcessoCard: React.FC<ValoresProcessoCardProps> = ({
    detalhesOrcamento,
    certidoesNecessarias,
    certidoesLinhagem,
    certidoesRequerentes,
    qtdTotalMenores = 0,
    euroTurismo,
    carregandoEuroTurismo,
    onTaxaMenorChange
}) => {
    const [taxaMenor, setTaxaMenor] = useState<number | null>(null);

    const totalDocumentos = calcularTotalDocumentos(
        certidoesNecessarias,
        certidoesLinhagem,
        certidoesRequerentes
    );
    
    useEffect(() => {
        if (euroTurismo !== null) {
            const quantidadeMenores = qtdTotalMenores > 0
                ? qtdTotalMenores
                : detalhesOrcamento.valorMenorReais / 1000; // Fallback simples

            const novoValorTaxaMenor = (quantidadeMenores * VALOR_BASE_TAXA_MENOR) * euroTurismo;

            if (novoValorTaxaMenor !== taxaMenor) {
                setTaxaMenor(novoValorTaxaMenor);
                if (onTaxaMenorChange) {
                    onTaxaMenorChange(novoValorTaxaMenor);
                }
            }
        }
    }, [euroTurismo, detalhesOrcamento.valorMenorReais, qtdTotalMenores]);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2.5 border-b border-gray-100 flex items-center">
                <Receipt size={16} className="mr-2 text-[#003366]" />
                Valores do Processo
            </h3>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 mr-4">
                        {totalDocumentos >= 54 ? "Tradução e Apostilamento (Com Taxa)" : "Tradução e Apostilamento"}
                    </span>
                    <span className="text-sm font-medium min-w-[90px] text-right">R$ {(detalhesOrcamento.traducaoApostilamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 mr-4">Emissão Certidões BR</span>
                    <span className="text-sm font-medium min-w-[90px] text-right">R$ {(detalhesOrcamento.emissaoCertidoesBR || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 mr-4">Custas Judiciais</span>
                    <span className="text-sm font-medium min-w-[90px] text-right">€ {(detalhesOrcamento.custasJudiciaisEuro || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 mr-4">Emissão Certidões ITA</span>
                    <span className="text-sm font-medium min-w-[90px] text-right">€ {(detalhesOrcamento.emissaoCertificacoesITAEuro || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 mr-4">Total Certidões + CNN e 1 Procuração</span>
                    <span className="text-sm font-medium min-w-[90px] text-right">{totalDocumentos} Certidões</span>
                </div>

                <div className="h-px bg-gray-100 my-2 border-b border-gray-200"></div>

                {qtdTotalMenores > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 mr-4">Taxa Menor</span>
                        {carregandoEuroTurismo ? (
                            <span className="text-sm font-medium text-gray-400 min-w-[90px] text-right">Carregando...</span>
                        ) : (
                            <span className="text-sm font-medium min-w-[90px] text-right">R$ {taxaMenor ? taxaMenor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}</span>
                        )}
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 mr-4">Euro Fixo</span>
                    <span className="text-sm font-medium min-w-[90px] text-right">R$ {EURO_FIXO.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 mr-4">Euro Turismo</span>
                    {carregandoEuroTurismo ? (
                        <span className="text-sm font-medium text-gray-400 min-w-[90px] text-right">Carregando...</span>
                    ) : (
                        <span className="text-sm font-medium min-w-[90px] text-right">R$ {euroTurismo ? euroTurismo.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
