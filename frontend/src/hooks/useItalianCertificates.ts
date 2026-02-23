import { useState, useEffect } from 'react';
import type { InfoAncestral, CertidoesNecessariasItaliano, CustosCertidoes } from '../types/budget';
import { custosBase, taxaCambio } from '../utils/budgetData';

export const useItalianCertificates = () => {
    const [grauParentesco, setGrauParentesco] = useState<string>('');
    
    const [infoAncestral, setInfoAncestral] = useState<InfoAncestral>({
        nasceuItalia: true,
        batizado: false,
        casouItalia: true,
        casouBrasil: false,
        faleceuItalia: false,
        faleceuBrasil: true
    });

    const [certidoesNecessarias, setCertidoesNecessarias] = useState<CertidoesNecessariasItaliano>({
        nascimento: true,
        batismo: false,
        casamento: true,
        obito: true
    });

    const [custosCertidoes, setCustosCertidoes] = useState<CustosCertidoes>({
        totalEuro: 0,
        totalReal: 0
    });

    // Recalcula custos quando as certidões necessárias mudam
    useEffect(() => {
        let totalEuro = 0;
        let totalReal = 0;

        // Lógica simplificada de custos
        if (certidoesNecessarias.nascimento || certidoesNecessarias.batismo) {
            if (infoAncestral.nasceuItalia) totalEuro += custosBase.certidaoItaliana;
            else totalReal += custosBase.certidaoInteiroTeor;
        }

        if (certidoesNecessarias.casamento) {
            if (infoAncestral.casouItalia) totalEuro += custosBase.certidaoItaliana;
            else totalReal += custosBase.certidaoInteiroTeor;
        }

        if (certidoesNecessarias.obito) {
            if (infoAncestral.faleceuItalia) totalEuro += custosBase.certidaoItaliana;
            else totalReal += custosBase.certidaoInteiroTeor;
        }

        setCustosCertidoes({ totalEuro, totalReal });
    }, [certidoesNecessarias, infoAncestral]);

    const handleGrauParentescoChange = (novoGrau: string) => {
        setGrauParentesco(novoGrau);
    };

    const handleInfoAncestralChange = (campo: keyof InfoAncestral) => {
        setInfoAncestral(prev => {
            const novo = { ...prev, [campo]: !prev[campo] };
            
            // Lógica de exclusão mútua
            if (campo === 'nasceuItalia' && novo.nasceuItalia) {
                // Se nasceu na Itália, geralmente não é batizado (civil) ou vice-versa
            }
            
            return novo;
        });
    };

    return {
        grauParentesco,
        infoAncestral,
        certidoesNecessarias,
        custosCertidoes,
        handleGrauParentescoChange,
        handleInfoAncestralChange,
        setCertidoesNecessarias
    };
};
