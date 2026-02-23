import React from 'react';
import { Sliders } from 'lucide-react';
import type { DetalhesOrcamento, FinancialInfo } from '../../../types/budget';
import {
    calcularTotal,
    calcularValorPorRequerenteComEmissao,
    calcularTotalSemEmissao,
    calcularValorPorRequerenteSemEmissao,
    calcularValorSemTaxa
} from '../../../utils/budgetCalculations';

interface OpcoesEmissaoCardProps {
    detalhesOrcamento: DetalhesOrcamento;
    financialInfo: FinancialInfo;
    qtdTotalRequerentes: number;
    handleEmissaoChange: (comEmissao: boolean) => void;
    euroTurismo: number | null;
    carregandoEuroTurismo: boolean;
    novaTaxaRequerenteReal?: number | null;
    taxaMenor?: number | null;
}

export const OpcoesEmissaoCard: React.FC<OpcoesEmissaoCardProps> = ({
    detalhesOrcamento,
    financialInfo,
    qtdTotalRequerentes,
    handleEmissaoChange,
    euroTurismo,
    carregandoEuroTurismo,
    novaTaxaRequerenteReal,
    taxaMenor,
}) => {
    const totalCE = euroTurismo !== null
        ? calcularTotal(detalhesOrcamento, euroTurismo, taxaMenor)
        : 0;
    const totalSE = calcularTotalSemEmissao(totalCE, detalhesOrcamento.emissaoCertidoesBR);

    const taxaMenorAplicada = taxaMenor !== null && taxaMenor !== undefined
        ? taxaMenor
        : detalhesOrcamento.valorMenorReais;

    const valorReqCE = calcularValorPorRequerenteComEmissao(
        totalCE,
        taxaMenorAplicada,
        qtdTotalRequerentes
    );
    const valorReqSE = calcularValorPorRequerenteSemEmissao(
        totalSE,
        taxaMenorAplicada,
        qtdTotalRequerentes
    );

    const taxaRequerenteReal = novaTaxaRequerenteReal !== null && novaTaxaRequerenteReal !== undefined
        ? novaTaxaRequerenteReal
        : detalhesOrcamento.novaTaxaRequerenteReal || 0;

    const valorSemTaxa = calcularValorSemTaxa(
        financialInfo.comEmissao,
        totalCE,
        totalSE,
        taxaMenorAplicada,
        taxaRequerenteReal,
        qtdTotalRequerentes,
        valorReqCE,
        valorReqSE
    );

    const totalMostrado = financialInfo.comEmissao ? totalCE : totalSE;
    const valorPorRequerenteMostrado = financialInfo.comEmissao ? valorReqCE : valorReqSE;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2.5 border-b border-gray-100 flex items-center">
                <Sliders size={16} className="mr-2 text-[#003366]" />
                Opções de Emissão
            </h3>

            <div className="flex mb-4">
                <div
                    className={`flex-1 text-center py-2 px-3 rounded-l-md text-sm font-medium cursor-pointer transition-all ${financialInfo.comEmissao ? 'bg-[#003366] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    onClick={() => handleEmissaoChange(true)}
                >
                    Com Emissão
                </div>
                <div
                    className={`flex-1 text-center py-2 px-3 rounded-r-md text-sm font-medium cursor-pointer transition-all ${!financialInfo.comEmissao ? 'bg-[#003366] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    onClick={() => handleEmissaoChange(false)}
                >
                    Sem Emissão
                </div>
            </div>

            <div className={`p-4 rounded-lg border ${financialInfo.comEmissao ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} transition-all`}>
                <h4 className="text-sm font-medium text-[#003366] mb-3">{financialInfo.comEmissao ? 'Com Emissão' : 'Sem Emissão'}</h4>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 mr-4">Total</span>
                    <span className="text-sm font-medium min-w-[90px] text-right">
                        {carregandoEuroTurismo ? (
                            <span className="text-gray-400">Carregando...</span>
                        ) : (
                            <span>R$ {(totalMostrado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        )}
                    </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 mr-4">Requerente</span>
                    <span className="text-sm font-medium min-w-[90px] text-right">
                        {carregandoEuroTurismo ? (
                            <span className="text-gray-400">Carregando...</span>
                        ) : (
                            <span>R$ {(valorPorRequerenteMostrado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        )}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 mr-4">Sem Taxa</span>
                    <span className="text-sm font-medium min-w-[90px] text-right">
                        {carregandoEuroTurismo ? (
                            <span className="text-gray-400">Carregando...</span>
                        ) : (
                            <span>R$ {(valorSemTaxa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};
