import { useState, useEffect, useRef } from 'react';
import type { Requerente, NovoRequerente, CertidoesRequerentes } from '../types/budget';
import { calcularCertidoesRequerentes } from '../utils/requerentesService';

export const useRequerentes = () => {
    const hasInitializedRef = useRef(false);
    const [isManualSetting, setIsManualSetting] = useState<boolean>(false);
    const [requerentes, setRequerentes] = useState<Requerente[]>([]);

    const [novoRequerente, setNovoRequerente] = useState<NovoRequerente>({
        tipo: 'Requerente',
        quantidade: 1,
        casou: false,
    });

    const [certidoesRequerentes, setCertidoesRequerentes] = useState<CertidoesRequerentes>({
        nascimento: { total: 0, explicacao: '' },
        casamento: { total: 0, explicacao: '' },
        total: 0
    });

    useEffect(() => {
        if (isManualSetting) return;
        const novasCertidoes = calcularCertidoesRequerentes(requerentes);
        setCertidoesRequerentes(novasCertidoes);
    }, [requerentes, isManualSetting]);

    const handleNovoRequerenteChange = (campo: keyof NovoRequerente, valor: any) => {
        setNovoRequerente(prev => {
            if (campo === 'tipo' && valor === 'Menor') {
                return { ...prev, [campo]: valor, casou: false };
            }
            return { ...prev, [campo]: valor };
        });
    };

    const adicionarRequerente = (requerenteData?: any) => {
        if (requerenteData) {
            const tipoRequerente = requerenteData.tipo === 'Menor' ? 'Menor' : 'Requerente';
            const casouStatus = tipoRequerente === 'Menor' ? false : (requerenteData.casou || false);
            
            const requerenteExistente = requerentes.find(r => 
                r.tipo === tipoRequerente && r.casou === casouStatus
            );
            
            if (requerenteExistente) {
                const novaQuantidade = requerenteExistente.quantidade + (requerenteData.quantidade || 1);
                setRequerentes(prev => prev.map(r => 
                    r.id === requerenteExistente.id ? { ...r, quantidade: novaQuantidade } : r
                ));
                return;
            }
            
            const novoReq: Requerente = {
                id: `requerente_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                tipo: tipoRequerente,
                quantidade: requerenteData.quantidade || 1,
                casou: casouStatus,
                certidoes: {
                    nascimento: {
                        necessaria: true,
                        motivo: tipoRequerente === 'Menor' ? 'Necessária para comprovar identidade do menor' : 'Necessária para comprovar identidade'
                    },
                    casamento: {
                        necessaria: tipoRequerente !== 'Menor' && casouStatus,
                        motivo: (tipoRequerente !== 'Menor' && casouStatus) ? 'Necessária devido ao casamento' : ''
                    }
                }
            };
            
            setRequerentes(prev => [...prev, novoReq]);
            return;
        }
        
        const tipoAtual = novoRequerente.tipo;
        const isMenor = tipoAtual === 'Menor';
        const casouStatus = isMenor ? false : novoRequerente.casou;
        
        const requerenteExistente = requerentes.find(r => 
            r.tipo === tipoAtual && r.casou === casouStatus
        );
        
        if (requerenteExistente) {
            const novaQuantidade = requerenteExistente.quantidade + novoRequerente.quantidade;
            setRequerentes(prev => prev.map(r => 
                r.id === requerenteExistente.id ? { ...r, quantidade: novaQuantidade } : r
            ));
        } else {
            setRequerentes(prev => [
                ...prev,
                {
                    id: `requerente_${Date.now()}`,
                    tipo: tipoAtual,
                    quantidade: novoRequerente.quantidade,
                    casou: casouStatus,
                    certidoes: {
                        nascimento: {
                            necessaria: true,
                            motivo: isMenor ? 'Necessária para comprovar identidade do menor' : 'Necessária para comprovar identidade'
                        },
                        casamento: {
                            necessaria: !isMenor && casouStatus,
                            motivo: (!isMenor && casouStatus) ? 'Necessária devido ao casamento' : ''
                        }
                    }
                }
            ]);
        }

        const savedTipo = novoRequerente.tipo;
        setNovoRequerente({
            tipo: savedTipo,
            quantidade: 1,
            casou: false,
        });
        
        hasInitializedRef.current = true;
    };

    const removerRequerente = (id: string) => {
        setRequerentes(prev => prev.filter(requerente => requerente.id !== id));
    };

    return {
        requerentes,
        novoRequerente,
        certidoesRequerentes,
        handleNovoRequerenteChange,
        adicionarRequerente,
        removerRequerente,
        setRequerentes
    };
};
