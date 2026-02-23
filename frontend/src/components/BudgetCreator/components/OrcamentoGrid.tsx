import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type {
    DetalhesOrcamento,
    FinancialInfo,
    CertidoesNecessariasItaliano,
    CertidoesLinhagem,
    CertidoesRequerentes
} from '../../../types/budget';
import { ValoresProcessoCard } from './ValoresProcessoCard';
import { OpcoesEmissaoCard } from './OpcoesEmissaoCard';
import { PESQUISA_ITA_ID, PESQUISA_BR_ID } from '../../../utils/budgetCalculations';

interface OrcamentoGridProps {
    detalhesOrcamento: DetalhesOrcamento;
    financialInfo: FinancialInfo;
    certidoesNecessarias: CertidoesNecessariasItaliano;
    certidoesLinhagem: CertidoesLinhagem;
    certidoesRequerentes: CertidoesRequerentes;
    qtdTotalMenores: number;
    qtdTotalRequerentes: number;
    handleEmissaoChange: (comEmissao: boolean) => void;
    euroTurismo: number | null;
    carregandoEuroTurismo: boolean;
    updatePesquisaITA: (valor: number) => void;
    updatePesquisaBR: (valor: number) => void;
}

export const OrcamentoGrid: React.FC<OrcamentoGridProps> = ({
    detalhesOrcamento,
    financialInfo,
    certidoesNecessarias,
    certidoesLinhagem,
    certidoesRequerentes,
    qtdTotalMenores,
    qtdTotalRequerentes,
    handleEmissaoChange,
    euroTurismo,
    carregandoEuroTurismo,
    updatePesquisaITA,
    updatePesquisaBR
}) => {
    const [pesquisaITAValue, setPesquisaITAValue] = useState<number>(detalhesOrcamento.pesquisaITA || 0);
    const [pesquisaBRValue, setPesquisaBRValue] = useState<number>(detalhesOrcamento.pesquisaBR || 0);

    useEffect(() => {
        if (detalhesOrcamento.pesquisaITA !== pesquisaITAValue) {
            setPesquisaITAValue(detalhesOrcamento.pesquisaITA);
        }
        if (detalhesOrcamento.pesquisaBR !== pesquisaBRValue) {
            setPesquisaBRValue(detalhesOrcamento.pesquisaBR);
        }
    }, [detalhesOrcamento.pesquisaITA, detalhesOrcamento.pesquisaBR]);

    const handlePesquisaITAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value) || 0;
        setPesquisaITAValue(newValue);
        updatePesquisaITA(newValue);
    };

    const handlePesquisaBRChange = (value: number) => {
        setPesquisaBRValue(value);
        updatePesquisaBR(value);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col sticky top-4 shadow-sm">
            <div className="p-4 bg-[#003366] text-white flex flex-col border-b border-blue-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Resumo do Orçamento</h2>
                </div>
            </div>

            <div className="p-5 space-y-4">
                <ValoresProcessoCard
                    detalhesOrcamento={detalhesOrcamento}
                    certidoesNecessarias={certidoesNecessarias}
                    certidoesLinhagem={certidoesLinhagem}
                    certidoesRequerentes={certidoesRequerentes}
                    qtdTotalMenores={qtdTotalMenores}
                    qtdTotalRequerentes={qtdTotalRequerentes}
                    euroTurismo={euroTurismo}
                    carregandoEuroTurismo={carregandoEuroTurismo}
                />

                <OpcoesEmissaoCard
                    detalhesOrcamento={detalhesOrcamento}
                    financialInfo={financialInfo}
                    qtdTotalRequerentes={qtdTotalRequerentes}
                    handleEmissaoChange={handleEmissaoChange}
                    euroTurismo={euroTurismo}
                    carregandoEuroTurismo={carregandoEuroTurismo}
                />

                {/* Card Pesquisa de Valores */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2.5 border-b border-gray-100 flex items-center">
                        <Search size={16} className="mr-2 text-[#003366]" />
                        Pesquisa de Valores
                    </h3>

                    <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-700 mr-4">Pesquisa ITA</label>
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500 mr-2">R$</span>
                                    <input
                                        type="number"
                                        className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#003366]"
                                        placeholder="0,00"
                                        value={pesquisaITAValue}
                                        onChange={handlePesquisaITAChange}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-700 mr-4">Pesquisa BR (+ R$ 1.500,00)</label>
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500 mr-2">R$</span>
                                    <div 
                                        className={`w-24 px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#003366] cursor-pointer bg-white flex items-center justify-between ${pesquisaBRValue > 0 ? 'border-[#003366]' : 'border-gray-300'}`}
                                        onClick={() => handlePesquisaBRChange(pesquisaBRValue > 0 ? 0 : 1500)}
                                    >
                                        <span>{pesquisaBRValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        <input
                                            type="checkbox"
                                            className="h-3.5 w-3.5 rounded border-gray-300 text-[#003366] focus:ring-[#003366] ml-2 cursor-pointer"
                                            checked={pesquisaBRValue > 0}
                                            onChange={(e) => handlePesquisaBRChange(e.target.checked ? 1500 : 0)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
