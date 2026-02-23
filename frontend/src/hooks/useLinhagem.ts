import { useState, useEffect, useRef } from 'react';
import type { Pessoa, NovaPessoa, CertidoesLinhagem } from '../types/budget';
import { calcularCertidoesLinhagem } from '../utils/certificatesService';
import { hierarchyMap } from '../utils/budgetData';

export const useLinhagem = () => {
    const hasInitializedRef = useRef(false);
    const [isManualSetting, setIsManualSetting] = useState<boolean>(false);
    const [pessoas, setPessoas] = useState<Pessoa[]>([]);

    const [novaPessoa, setNovaPessoa] = useState<NovaPessoa>({
        grauParentesco: '',
        quantidade: 1,
        casou: false,
        faleceu: false,
    });

    const [certidoesLinhagem, setCertidoesLinhagem] = useState<CertidoesLinhagem>({
        nascimento: { total: 0, explicacao: '' },
        casamento: { total: 0, explicacao: '' },
        obito: { total: 0, explicacao: '' },
        total: 0
    });

    useEffect(() => {
        if (isManualSetting) return;
        const novasCertidoes = calcularCertidoesLinhagem(pessoas);
        setCertidoesLinhagem(novasCertidoes);
    }, [pessoas, isManualSetting]);

    const handleNovaPessoaChange = (campo: keyof NovaPessoa, valor: any) => {
        setNovaPessoa(prev => ({ ...prev, [campo]: valor }));
    };

    const adicionarPessoa = () => {
        if (!novaPessoa.grauParentesco) return;

        setPessoas(prev => [
            ...prev,
            {
                id: `pessoa_${Date.now()}`,
                grauParentesco: novaPessoa.grauParentesco,
                quantidade: novaPessoa.quantidade,
                casou: novaPessoa.casou,
                faleceu: novaPessoa.faleceu,
                certidoes: {
                    nascimento: {
                        necessaria: true,
                        motivo: 'Necessária para comprovar a ligação genealógica'
                    },
                    casamento: {
                        necessaria: novaPessoa.casou,
                        motivo: novaPessoa.casou ? 'Necessária devido ao casamento' : ''
                    },
                    obito: {
                        necessaria: novaPessoa.faleceu,
                        motivo: novaPessoa.faleceu ? 'Necessária para comprovar a transição' : ''
                    }
                }
            }
        ]);

        setNovaPessoa({
            grauParentesco: '',
            quantidade: 1,
            casou: false,
            faleceu: false,
        });
        
        hasInitializedRef.current = true;
    };

    const removerPessoa = (id: string) => {
        setPessoas(prev => prev.filter(pessoa => pessoa.id !== id));
    };

    const alterarPropriedadePessoa = (id: string, propriedade: keyof NovaPessoa, valor: any) => {
        setPessoas(prev => prev.map(pessoa => {
            if (pessoa.id === id) {
                const pessoaAtualizada = {
                    ...pessoa,
                    [propriedade]: valor
                };

                if (propriedade === 'casou' || propriedade === 'faleceu') {
                    pessoaAtualizada.certidoes = {
                        ...pessoa.certidoes,
                        casamento: {
                            necessaria: propriedade === 'casou' ? valor : pessoa.casou,
                            motivo: (propriedade === 'casou' && valor) ? 'Necessária devido ao casamento' : ''
                        },
                        obito: {
                            necessaria: propriedade === 'faleceu' ? valor : pessoa.faleceu,
                            motivo: (propriedade === 'faleceu' && valor) ? 'Necessária para comprovar a transição' : ''
                        }
                    };
                }
                return pessoaAtualizada;
            }
            return pessoa;
        }));
        hasInitializedRef.current = true;
    };
    
    const gerarLinhagemAutomatica = (grauParentesco: string) => {
        const hierarquia = hierarchyMap[grauParentesco];
        if (!hierarquia) return;

        const hierarquiaFiltrada = hierarquia.filter(grau => grau !== grauParentesco);
        
        const novasPessoas: Pessoa[] = hierarquiaFiltrada.map(grau => ({
            id: `pessoa_${Date.now()}_${grau.replace('/', '')}`,
            grauParentesco: grau,
            quantidade: 1,
            casou: true,
            faleceu: grau !== 'Pai/Mãe',
            certidoes: {
                nascimento: {
                    necessaria: true,
                    motivo: 'Necessária para comprovar a ligação genealógica'
                },
                casamento: {
                    necessaria: true,
                    motivo: 'Necessária devido ao casamento'
                },
                obito: {
                    necessaria: grau !== 'Pai/Mãe',
                    motivo: grau !== 'Pai/Mãe' ? 'Necessária para comprovar a transição' : ''
                }
            }
        }));

        setPessoas(novasPessoas);
    };

    return {
        pessoas,
        novaPessoa,
        certidoesLinhagem,
        handleNovaPessoaChange,
        adicionarPessoa,
        removerPessoa,
        alterarPropriedadePessoa,
        gerarLinhagemAutomatica,
        setPessoas
    };
};
