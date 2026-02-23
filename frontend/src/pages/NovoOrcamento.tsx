import React, { useMemo, useState } from 'react';
import { Header } from '../components/layout/Header';
import { useLinhagem } from '../hooks/useLinhagem';
import { useItalianCertificates } from '../hooks/useItalianCertificates';
import { useRequerentes } from '../hooks/useRequerentes';
import { useBudgetCalculator } from '../hooks/useBudgetCalculator';
import { ItalianoSection } from '../components/BudgetCreator/sections/ItalianoSection';
import { LinhagemSection } from '../components/BudgetCreator/sections/LinhagemSection';
import { RequerentesSection } from '../components/BudgetCreator/sections/RequerentesSection';
import { PaymentConfigSection } from '../components/BudgetCreator/sections/PaymentConfigSection';
import { OrcamentoGrid } from '../components/BudgetCreator/components/OrcamentoGrid';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { budgetService } from '../services/budgetService';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 1, title: 'Ancestral Italiano' },
  { id: 2, title: 'Linhagem' },
  { id: 3, title: 'Requerentes' },
  { id: 4, title: 'Pagamento' },
];

export function NovoOrcamento() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [nomeFamilia, setNomeFamilia] = useState('');
  const [euroTurismo] = useState(6.90); // Valor fixo por enquanto, idealmente viria de uma API
  const [saving, setSaving] = useState(false);
  const selectedItems = useMemo(() => ({}), []);

  // Hooks
  const {
    pessoas,
    novaPessoa,
    certidoesLinhagem,
    handleNovaPessoaChange,
    adicionarPessoa,
    removerPessoa,
    alterarPropriedadePessoa,
    gerarLinhagemAutomatica
  } = useLinhagem();

  const {
    grauParentesco,
    infoAncestral,
    certidoesNecessarias,
    custosCertidoes,
    handleGrauParentescoChange,
    handleInfoAncestralChange
  } = useItalianCertificates();

  const {
    requerentes,
    adicionarRequerente,
    removerRequerente,
    certidoesRequerentes
  } = useRequerentes();

  const {
    financialInfo,
    detalhesOrcamento,
    handleEmissaoChange,
    updatePesquisaITAValue,
    updatePesquisaBRValue
  } = useBudgetCalculator({
    selectedItems,
    requerentes,
    certidoesItaliano: certidoesNecessarias,
    certidoesLinhagem,
    certidoesRequerentes,
    infoAncestral,
    custosCertidoes
  });

  // Handlers locais
  const handleGrauChange = (grau: string) => {
    handleGrauParentescoChange(grau);
    gerarLinhagemAutomatica(grau);
  };

  const nextStep = () => {
    if (currentStep === 1 && !nomeFamilia.trim()) {
      alert('Por favor, informe o sobrenome da família.');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };
  
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSaveBudget = async () => {
    if (!nomeFamilia.trim()) {
      alert('Por favor, informe o sobrenome da família.');
      setCurrentStep(1);
      return;
    }

    try {
      setSaving(true);
      
      // 1. Criar o Orçamento
      const budgetData = {
        nome_familia: nomeFamilia,
        cidadania: 'IT', // Por enquanto fixo IT, mas poderia vir de um seletor
        valor_total: financialInfo.valorFinal,
        num_parcelas: financialInfo.parcelas,
        observacoes: `Orçamento gerado via assistente. 
        Grau: ${grauParentesco}. 
        Requerentes: ${requerentes.reduce((acc, r) => acc + r.quantidade, 0)}.
        Detalhes: ${JSON.stringify(detalhesOrcamento)}`
      };

      const created = await budgetService.create(budgetData);
      const orcamentoId = created?.data?.id;

      if (orcamentoId) {
        const membrosPayload: Array<{
          orcamento_id: number;
          nome: string;
          parentesco?: string;
          requerente: boolean;
        }> = [];

        // Linhagem
        pessoas.forEach((pessoa, index) => {
          const quantidade = Math.max(1, pessoa.quantidade || 1);
          for (let i = 0; i < quantidade; i += 1) {
            membrosPayload.push({
              orcamento_id: Number(orcamentoId),
              nome: `${pessoa.grauParentesco} ${index + 1}.${i + 1}`,
              parentesco: pessoa.grauParentesco,
              requerente: false,
            });
          }
        });

        // Requerentes
        requerentes.forEach((req, index) => {
          const quantidade = Math.max(1, req.quantidade || 1);
          for (let i = 0; i < quantidade; i += 1) {
            membrosPayload.push({
              orcamento_id: Number(orcamentoId),
              nome: req.nome?.trim() || `${req.tipo} ${index + 1}.${i + 1}`,
              parentesco: req.tipo,
              requerente: true,
            });
          }
        });

        if (membrosPayload.length > 0) {
          await Promise.all(membrosPayload.map((membro) => api.post('/membros', membro)));
        }
      }
      
      alert('Orçamento salvo com sucesso!');
      navigate('/orcamentos');
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const qtdTotalMenores = requerentes.filter(r => r.tipo === 'Menor').reduce((acc, r) => acc + r.quantidade, 0);
  const qtdTotalRequerentes = requerentes.reduce((acc, r) => acc + r.quantidade, 0);

  return (
    <>
      <Header title="Novo Orçamento" subtitle="Crie uma proposta personalizada" />
      
      <main className="p-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {steps.map((step) => (
                  <div 
                    key={step.id}
                    className={`text-sm font-medium ${
                      step.id <= currentStep ? 'text-[#003366]' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                ))}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#003366] transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
              {currentStep === 1 && (
                <div className="p-6">
                  <ItalianoSection
                    grauParentesco={grauParentesco}
                    infoAncestral={infoAncestral}
                    certidoesNecessarias={certidoesNecessarias}
                    custosCertidoes={custosCertidoes}
                    handleGrauParentescoChange={handleGrauChange}
                    handleInfoAncestralChange={handleInfoAncestralChange}
                    nomeFamilia={nomeFamilia}
                    onNomeFamiliaChange={setNomeFamilia}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="p-6">
                  <LinhagemSection
                    pessoas={pessoas}
                    novaPessoa={novaPessoa}
                    certidoesLinhagem={certidoesLinhagem}
                    handleNovaPessoaChange={handleNovaPessoaChange}
                    adicionarPessoa={adicionarPessoa}
                    removerPessoa={removerPessoa}
                    alterarPropriedadePessoa={alterarPropriedadePessoa}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="p-6">
                  <RequerentesSection
                    requerentes={requerentes}
                    adicionarRequerente={adicionarRequerente}
                    removerRequerente={removerRequerente}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="p-6">
                  <PaymentConfigSection />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <OrcamentoGrid
              detalhesOrcamento={detalhesOrcamento}
              financialInfo={financialInfo}
              certidoesNecessarias={certidoesNecessarias}
              certidoesLinhagem={certidoesLinhagem}
              certidoesRequerentes={certidoesRequerentes}
              qtdTotalMenores={qtdTotalMenores}
              qtdTotalRequerentes={qtdTotalRequerentes}
              handleEmissaoChange={handleEmissaoChange}
              euroTurismo={euroTurismo}
              carregandoEuroTurismo={false}
              updatePesquisaITA={updatePesquisaITAValue}
              updatePesquisaBR={updatePesquisaBRValue}
            />
          </div>
        </div>
      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20 md:pl-64">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <ChevronLeft size={18} />
            Voltar
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2.5 bg-[#003366] text-white font-medium rounded-lg hover:bg-[#004080] flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              Próximo
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSaveBudget}
              disabled={saving}
              className={`px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all ${saving ? 'opacity-70 cursor-wait' : ''}`}
            >
              <Save size={18} />
              {saving ? 'Salvando...' : 'Finalizar Orçamento'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
