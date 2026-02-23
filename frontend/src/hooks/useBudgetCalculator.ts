import { useState, useEffect, useRef } from 'react';
import type {
    FinancialInfo,
    DetalhesOrcamento,
    Requerente,
    CertidoesNecessariasItaliano,
    CertidoesLinhagem,
    CertidoesRequerentes,
    CustosCertidoes
} from '../types/budget';
import {
    calcularTotalItens,
    calcularDetalhesOrcamento,
    calcularValorFinalComDesconto,
    calcularValorParcela,
    calcularInformacoesFinanceiras
} from '../utils/budgetCalculations';

interface UseBudgetCalculatorProps {
    selectedItems: Record<string, any>;
    requerentes: Requerente[];
    certidoesItaliano?: CertidoesNecessariasItaliano;
    certidoesLinhagem?: CertidoesLinhagem;
    certidoesRequerentes?: CertidoesRequerentes;
    infoAncestral?: any;
    custosCertidoes?: CustosCertidoes;
}

export const useBudgetCalculator = ({
    selectedItems,
    requerentes,
    certidoesItaliano = {
        nascimento: false,
        batismo: false,
        casamento: false,
        obito: false
    },
    certidoesLinhagem = {
        nascimento: { total: 0, explicacao: '' },
        casamento: { total: 0, explicacao: '' },
        obito: { total: 0, explicacao: '' },
        total: 0
    },
    certidoesRequerentes = {
        nascimento: { total: 0, explicacao: '' },
        casamento: { total: 0, explicacao: '' },
        total: 0
    },
    infoAncestral,
    custosCertidoes
}: UseBudgetCalculatorProps) => {
    const hasInitializedRef = useRef(false);
    const [isManualSetting, setIsManualSetting] = useState<boolean>(false);

    const [total, setTotal] = useState(0);
    const [financialInfo, setFinancialInfo] = useState<FinancialInfo>({
        parcelas: 1,
        valorParcela: 0,
        desconto: 0,
        valorFinal: 0,
        comEmissao: true,
        valorEntrada: 0,
        dataVencimento: new Date().getDate()
    });

    const [detalhesOrcamento, setDetalhesOrcamento] = useState<DetalhesOrcamento>({
        pesquisaITA: 0,
        pesquisaBR: 0,
        traducaoApostilamento: 0,
        emissaoCertidoesBR: 0,
        custasJudiciaisEuro: 0,
        emissaoCertificacoesITAEuro: 0,
        valorMenorReais: 0,
        parcelasMenor: {
            quantidade: 1,
            valorParcela: 0,
            valorEntrada: 0,
            dataVencimento: new Date().getDate()
        },
        temMenorIdade: false,
        totalAVista: 0,
        totalPorRequerente: 0,
        totalSemEmissao: 0,
        totalComEmissao: 0,
        totalSemTaxa: 0
    });

    useEffect(() => {
        if (isManualSetting) return;
        const novoTotal = calcularTotalItens(selectedItems);
        setTotal((prev) => (prev !== novoTotal ? novoTotal : prev));
    }, [selectedItems, isManualSetting]);

    useEffect(() => {
        if (isManualSetting) return;
        
        const novosDetalhes = calcularDetalhesOrcamento(
            selectedItems,
            requerentes,
            financialInfo,
            detalhesOrcamento,
            certidoesItaliano,
            certidoesLinhagem,
            certidoesRequerentes,
            custosCertidoes,
            infoAncestral
        );
        setDetalhesOrcamento((prev) => {
            const prevSerialized = JSON.stringify(prev);
            const nextSerialized = JSON.stringify(novosDetalhes);
            return prevSerialized !== nextSerialized ? novosDetalhes : prev;
        });

        const novasInfos = calcularInformacoesFinanceiras(
            financialInfo.comEmissao,
            novosDetalhes,
            financialInfo.desconto,
            financialInfo.valorEntrada,
            financialInfo.parcelas
        );
        setFinancialInfo(prev => {
            if (
                prev.valorFinal === novasInfos.valorFinal &&
                prev.valorParcela === novasInfos.valorParcela
            ) {
                return prev;
            }
            return {
                ...prev,
                valorFinal: novasInfos.valorFinal,
                valorParcela: novasInfos.valorParcela
            };
        });
    }, [selectedItems, financialInfo.desconto, financialInfo.parcelas, financialInfo.comEmissao, financialInfo.valorEntrada, requerentes, certidoesItaliano, certidoesLinhagem, certidoesRequerentes, infoAncestral, custosCertidoes, isManualSetting]);

    const handleParcelasChange = (parcelas: number) => {
        const parcelasNum = Number(parcelas);
        const parcelasValidas = (!isNaN(parcelasNum) && parcelasNum > 0) ? parcelasNum : 1;
        
        setFinancialInfo(prev => ({ ...prev, parcelas: parcelasValidas }));
        
        const valorBase = financialInfo.comEmissao ? 
            detalhesOrcamento.totalComEmissao : detalhesOrcamento.totalSemEmissao;
        const valorFinal = calcularValorFinalComDesconto(valorBase, financialInfo.desconto);
        const valorParcela = calcularValorParcela(valorFinal, financialInfo.valorEntrada, parcelasValidas);
        
        setFinancialInfo(prev => ({ ...prev, valorParcela }));
    };

    const handleDescontoChange = (desconto: number) => {
        const descontoLimitado = Math.min(100, Math.max(0, desconto));
        setFinancialInfo(prev => ({ ...prev, desconto: descontoLimitado }));
    };

    const handleEmissaoChange = (comEmissao: boolean) => {
        setFinancialInfo(prev => ({ ...prev, comEmissao }));
    };

    const handleValorEntradaChange = (valorEntrada: number) => {
        setFinancialInfo(prev => ({ ...prev, valorEntrada }));
    };

    const handleDataVencimentoChange = (dataVencimento: number) => {
        setFinancialInfo(prev => ({ ...prev, dataVencimento }));
    };

    const updatePesquisaITAValue = (valor: number) => {
        setIsManualSetting(true);
        setDetalhesOrcamento(prev => ({ ...prev, pesquisaITA: valor }));
        setTimeout(() => setIsManualSetting(false), 100);
    };

    const updatePesquisaBRValue = (valor: number) => {
        setIsManualSetting(true);
        setDetalhesOrcamento(prev => ({ ...prev, pesquisaBR: valor }));
        setTimeout(() => setIsManualSetting(false), 100);
    };

    return {
        total,
        financialInfo,
        detalhesOrcamento,
        handleParcelasChange,
        handleDescontoChange,
        handleEmissaoChange,
        handleValorEntradaChange,
        handleDataVencimentoChange,
        updatePesquisaITAValue,
        updatePesquisaBRValue,
        isInitialized: hasInitializedRef.current
    };
};
